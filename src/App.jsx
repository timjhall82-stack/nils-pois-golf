import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken, GoogleAuthProvider, signInWithPopup, linkWithPopup, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { collection, query, where, onSnapshot, setDoc, doc, getDoc, writeBatch, updateDoc } from 'firebase/firestore';
import { Activity, LogOut, Users, Share2, MapPin, Trophy, TableProperties, X, Loader2, CloudOff, Check } from 'lucide-react';

// Imports from new structure
import { auth, db } from './config/firebase';
import { APP_ID, COLLECTION_NAME, DEFAULT_PARS, DEFAULT_SI, BACKGROUND_IMAGE } from './utils/constants';
import { calculateCourseHandicap } from './utils/golfLogic';

// Components
import ScoreView from './components/ScoreView';
import LeaderboardView from './components/LeaderboardView';
import ScorecardView from './components/ScorecardView';
import SetupView from './components/SetupView';
import LobbyView from './components/LobbyView';
import { TeeSheetModal, PlayerPortal, HistoryView, InfoPage } from './components/Modals'; // Assuming you group these

const SyncStatus = ({ status }) => {
    if (status === 'saving') return <div className="flex items-center text-yellow-500 text-[10px] font-medium bg-slate-800 px-2 py-1 rounded-full border border-slate-700"><Loader2 size={12} className="animate-spin mr-1" /> Saving...</div>;
    if (status === 'error') return <div className="flex items-center text-red-500 text-[10px] font-medium bg-slate-800 px-2 py-1 rounded-full border border-red-900/50"><CloudOff size={12} className="mr-1" /> Offline</div>;
    return <div className="flex items-center text-slate-500 text-[10px] font-medium bg-slate-800 px-2 py-1 rounded-full border border-slate-700 transition-all duration-500"><Check size={12} className="mr-1 text-emerald-500" /> Saved</div>;
};

export default function App() {
  // State
  const [user, setUser] = useState(null);
  const [gameId, setGameId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [handicapIndex, setHandicapIndex] = useState('');
  const [savedPlayers, setSavedPlayers] = useState([]);
  const [syncStatus, setSyncStatus] = useState('saved');
  const [players, setPlayers] = useState([]);
  const [gameSettings, setGameSettings] = useState(null);
  const [view, setView] = useState('lobby'); 
  const [currentHole, setCurrentHole] = useState(1);
  const [loading, setLoading] = useState(true);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [error, setError] = useState('');
  
  // Modals
  const [showExitModal, setShowExitModal] = useState(false);
  const [showTeeSheet, setShowTeeSheet] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showInfo, setShowInfo] = useState(false); 
  
  // Setup State
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestHcp, setNewGuestHcp] = useState('');
  const [courseName, setCourseName] = useState('');
  const [slope, setSlope] = useState('113');
  const [rating, setRating] = useState('72.0');
  const [pars, setPars] = useState(DEFAULT_PARS);
  const [si, setSi] = useState(DEFAULT_SI);
  const [gameMode, setGameMode] = useState('stroke'); 
  const [teamMode, setTeamMode] = useState('singles'); 
  const [handicapMode, setHandicapMode] = useState('full');
  const [holesMode, setHolesMode] = useState('18');

  // Derived
  const activePars = gameSettings?.pars || DEFAULT_PARS;
  const activeSi = gameSettings?.si || DEFAULT_SI;
  const activeGameMode = gameSettings?.gameMode || 'stroke';

  // --- Effects ---
  useEffect(() => {
    const initAuth = async () => {
      try { await setPersistence(auth, browserLocalPersistence); if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) { await signInWithCustomToken(auth, __initial_auth_token); } } catch (err) { console.error("Auth error", err); setError("Failed to authenticate"); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const savedGame = localStorage.getItem('golf_game_id');
        const savedName = localStorage.getItem('golf_player_name');
        const savedHcp = localStorage.getItem('golf_player_hcp');
        if (savedGame && savedName) { setGameId(savedGame); setPlayerName(savedName); if (savedHcp) setHandicapIndex(savedHcp); setJoinCodeInput(savedGame); } else { setLoading(false); }
      } else {
        if (!user) { try { await signInAnonymously(auth); } catch (e) { console.error("Anon sign in failed", e); } }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
      if (!user) return;
      const q = query(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'saved_players'));
      const unsubscribe = onSnapshot(q, (snapshot) => { 
          const sp = []; snapshot.forEach(doc => sp.push({id: doc.id, ...doc.data()})); 
          sp.sort((a, b) => a.name.localeCompare(b.name)); setSavedPlayers(sp); 
      });
      return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !gameId) return;
    setLoading(true);
    const settingsRef = doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, `SETTINGS_${gameId}`);
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
        if (docSnap.exists()) { const s = docSnap.data(); setGameSettings(s); if (view === 'lobby' || view === 'setup') setView('score'); } 
        setLoading(false);
    });
    const q = query(collection(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME), where('gameId', '==', gameId.toUpperCase()), where('type', '==', 'player'));
    const unsubPlayers = onSnapshot(q, (snapshot) => { const playerData = []; snapshot.forEach((doc) => { playerData.push({ id: doc.id, ...doc.data() }); }); setPlayers(playerData); });
    return () => { unsubSettings(); unsubPlayers(); };
  }, [user, gameId]);

  // --- Actions ---
  const startSetup = () => { if (!courseName.trim()) { setError("Name the game first"); return; } setView('setup'); };

  const createGame = async (friendsToAdd = [], hostAvatarUrl = '') => {
      if (!playerName) throw new Error("Host name required");
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const settingsId = `SETTINGS_${newCode}`;
      const totalPar = pars.reduce((a, b) => a + b, 0);
      await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, settingsId), { 
          courseName, slope, rating, pars, si, totalPar, gameMode, teamMode, handicapMode, holesMode, createdAt: new Date().toISOString() 
      });
      await joinGameLogic(newCode, courseName, slope, rating, totalPar, hostAvatarUrl, holesMode, handicapMode);
      if (friendsToAdd.length > 0) {
          const batch = writeBatch(db);
          friendsToAdd.forEach(friend => {
              const guestId = `guest_${Math.random().toString(36).substring(2, 9)}`;
              const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, `${newCode}_${guestId}`);
              const ch = calculateCourseHandicap(friend.handicap, slope, rating, totalPar, holesMode, handicapMode);
              batch.set(docRef, { gameId: newCode, userId: guestId, playerName: friend.name, handicapIndex: friend.handicap, courseHandicap: ch, avatarUrl: friend.avatarUrl || '', type: 'player', isGuest: true, teeGroup: null, lastActive: new Date().toISOString() });
          });
          await batch.commit();
      }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim() || !joinCodeInput.trim()) { setError("Name and Code required"); return; }
    const code = joinCodeInput.toUpperCase();
    const settingsRef = doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, `SETTINGS_${code}`);
    const snap = await getDoc(settingsRef);
    if (!snap.exists()) { setError("Game code not found"); return; }
    const settings = snap.data();
    const mode = settings.handicapMode || (settings.useHandicapDiff ? 'diff' : 'full');
    await joinGameLogic(code, settings.courseName, settings.slope, settings.rating, settings.totalPar, '', settings.holesMode, mode);
  };

  const joinGameLogic = async (code, cName, cSlope, cRating, cTotalPar, avatarUrl = '', hMode = '18', hcpMode = 'full') => {
    setLoading(true); setGameId(code);
    localStorage.setItem('golf_game_id', code); localStorage.setItem('golf_player_name', playerName); localStorage.setItem('golf_player_hcp', handicapIndex);
    const ch = calculateCourseHandicap(handicapIndex, cSlope, cRating, cTotalPar, hMode, hcpMode);
    const playerDocId = `${code}_${user.uid}`;
    await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, playerDocId), { gameId: code, userId: user.uid, playerName: playerName, handicapIndex: handicapIndex, courseHandicap: ch, avatarUrl: avatarUrl, type: 'player', lastActive: new Date().toISOString() }, { merge: true });
    setView('score'); setLoading(false);
  };

  const updateScore = async (targetUserId, hole, strokes) => {
    if (!user || !gameId) return;
    setSyncStatus('saving');
    const playerDocId = `${gameId}_${targetUserId}`;
    const targetPlayer = players.find(p => p.userId === targetUserId) || {};
    const newScores = { ...(targetPlayer.scores || {}), [hole]: strokes };
    try { await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, playerDocId), { scores: newScores }, { merge: true }); setSyncStatus('saved'); } catch (e) { console.error("Sync error:", e); setSyncStatus('error'); }
  };

  const updatePlayerGroup = async (playerId, groupNum) => {
      if (!playerId) return;
      try { await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, playerId), { teeGroup: groupNum }); } catch(e) { console.error("Group update failed", e); }
  };
  
  const confirmLeave = () => { localStorage.removeItem('golf_game_id'); setGameId(''); setPlayers([]); setGameSettings(null); setView('lobby'); setJoinCodeInput(''); setShowExitModal(false); };
  const loadHistoricalGame = (oldGameId) => { if(!oldGameId) return; setGameId(oldGameId); setShowHistory(false); setView('leaderboard'); };

  const addGuestPlayer = async (avatarUrl = '') => {
      if (!newGuestName.trim() || !gameId) return;
      const guestId = `guest_${Math.random().toString(36).substring(2, 9)}`;
      const cSettings = gameSettings || {};
      const mode = cSettings.handicapMode || (cSettings.useHandicapDiff ? 'diff' : 'full');
      const ch = calculateCourseHandicap(newGuestHcp, cSettings.slope, cSettings.rating, cSettings.totalPar, cSettings.holesMode, mode);
      await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, `${gameId}_${guestId}`), { gameId: gameId, userId: guestId, playerName: newGuestName, handicapIndex: newGuestHcp || 0, courseHandicap: ch, avatarUrl: avatarUrl, type: 'player', isGuest: true, teeGroup: null, lastActive: new Date().toISOString() });
      setNewGuestName(''); setNewGuestHcp('');
  };

  const randomizeGroups = async (groupSize) => {
      if (players.length === 0) return;
      const shuffled = [...players];
      for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
      const batch = writeBatch(db);
      shuffled.forEach((p, index) => { batch.update(doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, p.id), { teeGroup: Math.floor(index / groupSize) + 1 }); });
      await batch.commit();
  };
  
  const handleLogin = async () => { const provider = new GoogleAuthProvider(); try { if (user && user.isAnonymous) { await linkWithPopup(user, provider); } else { await signInWithPopup(auth, provider); } } catch (error) { if (error.code === 'auth/credential-already-in-use') { await signInWithPopup(auth, provider); } else { alert("Login failed: " + error.message); } } };
  const handleLogout = async () => { await signOut(auth); await signInAnonymously(auth); };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden flex flex-col" style={{ backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.95)), url("${BACKGROUND_IMAGE}")`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        {view === 'lobby' && (
            <LobbyView 
                courseName={courseName} setCourseName={setCourseName} startSetup={() => setView('setup')}
                playerName={playerName} setPlayerName={setPlayerName} joinCodeInput={joinCodeInput} setJoinCodeInput={setJoinCodeInput}
                handleJoinGame={handleJoinGame} error={error} setShowPortal={setShowPortal} setShowHistory={setShowHistory}
                user={user} handleLogin={handleLogin} handleLogout={handleLogout} setShowInfo={setShowInfo} savedPlayers={savedPlayers} 
            />
        )}
        
        {view === 'setup' && (
            <SetupView 
                courseName={courseName} setCourseName={setCourseName} slope={slope} setSlope={setSlope} rating={rating} setRating={setRating}
                pars={pars} setPars={setPars} gameMode={gameMode} setGameMode={setGameMode} setSi={setSi} si={si}       
                playerName={playerName} setPlayerName={setPlayerName} handicapIndex={handicapIndex} setHandicapIndex={setHandicapIndex}
                createGame={createGame} onCancel={() => setView('lobby')} savedPlayers={savedPlayers} error={error} 
                teamMode={teamMode} setTeamMode={setTeamMode} handicapMode={handicapMode} setHandicapMode={setHandicapMode} holesMode={holesMode} setHolesMode={setHolesMode}
            />
        )}

        {(view === 'score' || view === 'leaderboard' || view === 'card') && (
            <>
                <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 h-14 flex items-center justify-between px-4 z-30 sticky top-0">
                    <div className="flex items-center space-x-2"><MapPin size={16} className="text-emerald-500" /><span className="font-bold text-sm truncate max-w-[120px]">{gameSettings?.courseName || 'Nils Pois'}</span></div>
                    <div className="flex items-center gap-2"><SyncStatus status={syncStatus} /><button onClick={() => setShowTeeSheet(true)} className="bg-slate-800 p-3 rounded-full text-emerald-500 hover:text-emerald-400 active:scale-95"><Users size={18} /></button><div className="flex items-center bg-slate-950 rounded-full px-3 py-1 border border-slate-800" onClick={() => {navigator.clipboard.writeText(gameId);}}><span className="font-mono font-bold text-emerald-400 tracking-widest mr-2">{gameId}</span><Share2 size={12} className="text-slate-500"/></div></div>
                </header>

                <main className="flex-1 p-4 max-w-lg mx-auto w-full overflow-hidden flex flex-col">
                    {view === 'score' && <ScoreView currentHole={currentHole} setCurrentHole={setCurrentHole} activePars={activePars} activeSi={activeSi} players={players} user={user} updateScore={updateScore} gameSettings={gameSettings} />}
                    {view === 'leaderboard' && <LeaderboardView leaderboardData={players} user={user} activeGameMode={activeGameMode} teamMode={gameSettings?.teamMode || 'singles'} gameSettings={gameSettings} />}
                    {view === 'card' && <ScorecardView players={players} activePars={activePars} activeSi={activeSi} holesMode={gameSettings?.holesMode || '18'} gameMode={activeGameMode} />}
                    <div className="mt-2 flex justify-between items-center px-1"><button onClick={() => setShowExitModal(true)} className="text-[10px] text-red-500/50 hover:text-red-400 flex items-center gap-1 uppercase tracking-wider"><LogOut size={10}/> Exit</button></div>
                </main>

                <nav className="bg-slate-900 border-t border-slate-800 h-16 pb-2 z-20">
                    <div className="flex justify-around items-center h-full px-2 gap-2">
                        <button onClick={() => setView('score')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${view === 'score' ? 'text-emerald-500' : 'text-slate-600'}`}><Activity size={20} /><span className="text-[10px] font-bold uppercase">Score</span></button>
                        <button onClick={() => setView('leaderboard')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${view === 'leaderboard' ? 'text-blue-500' : 'text-slate-600'}`}><Trophy size={20} /><span className="text-[10px] font-bold uppercase">Leaderboard</span></button>
                        <button onClick={() => setView('card')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${view === 'card' ? 'text-purple-500' : 'text-slate-600'}`}><TableProperties size={20} /><span className="text-[10px] font-bold uppercase">Card</span></button>
                    </div>
                </nav>
            </>
        )}

        {/* Modals */}
        {showPortal && user && <PlayerPortal onClose={() => setShowPortal(false)} userId={user.uid} savedPlayers={savedPlayers} db={db} APP_ID={APP_ID} COLLECTION_NAME={COLLECTION_NAME} />}
        {showHistory && user && <HistoryView userId={user.uid} onClose={() => setShowHistory(false)} onLoadGame={loadHistoricalGame} db={db} APP_ID={APP_ID} COLLECTION_NAME={COLLECTION_NAME} />}
        {showInfo && <InfoPage onClose={() => setShowInfo(false)} />}
        {showTeeSheet && <TeeSheetModal onClose={() => setShowTeeSheet(false)} players={players} addGuest={addGuestPlayer} randomize={randomizeGroups} newGuestName={newGuestName} setNewGuestName={setNewGuestName} newGuestHcp={newGuestHcp} setNewGuestHcp={setNewGuestHcp} savedPlayers={savedPlayers} updatePlayerGroup={updatePlayerGroup} />}
        {showExitModal && <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"><div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-xs w-full"><h3 className="text-lg font-bold text-white mb-4">Exit Game?</h3><p className="text-slate-400 text-sm mb-6">Scores are saved online.</p><div className="flex gap-3"><button onClick={() => setShowExitModal(false)} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm">Cancel</button><button onClick={confirmLeave} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm">Exit</button></div></div></div>}
    </div>
  );
}