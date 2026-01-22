import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  setDoc, 
  doc, 
  getDoc,
  getDocs,
  writeBatch,
  updateDoc
} from 'firebase/firestore';
import { 
  MapPin, 
  Share2, 
  Activity, 
  Trophy, 
  TableProperties, 
  Users, 
  LogOut, 
  Check, 
  Loader2, 
  CloudOff,
  X,
  Settings // FIX: Added Settings icon
} from 'lucide-react';

// --- IMPORTS ---
import { APP_VERSION, APP_ID, COLLECTION_NAME, BACKGROUND_IMAGE, DEFAULT_PARS, DEFAULT_SI, CUSTOM_LOGO_URL } from './utils/constants';

// Views
import LobbyView from './components/LobbyView';
import SetupView from './components/SetupView';
import ScoreView from './components/ScoreView';
import LeaderboardView from './components/LeaderboardView';
import ScorecardView from './components/ScorecardView';
// FIX: Import the new settings view
import GameSettingsView from './components/GameSettingsView';

// Modals
import { TeeSheetModal, InfoPage, HistoryView, PlayerPortal } from './components/Modals';

// --- Firebase Initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyCllkJmbTVFmCIzkyIHXIO24FKlJ9i4VQg",
  authDomain: "nilspoisgolf.firebaseapp.com",
  projectId: "nilspoisgolf",
  storageBucket: "nilspoisgolf.firebasestorage.app",
  messagingSenderId: "606422939116",
  appId: "1:606422939116:web:d2a51bd4a1d5606c787cc9",
  measurementId: "G-VZ8X10ZEC4"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Helper Functions ---
const calculateCourseHandicap = (index, slopeVal, ratingVal, parVal, holesMode = '18', handicapMode = 'full') => {
    if (!index || index === '') return 0;
    let idx = parseFloat(index);
    const slp = parseFloat(slopeVal) || 113;
    const rtg = parseFloat(ratingVal) || 72;
    const pr = parseInt(parVal) || 72;
    
    let rawCh = idx * (slp / 113) + (rtg - pr);
    if (handicapMode === '95') { rawCh = rawCh * 0.95; }

    let ch = Math.round(rawCh);
    if (holesMode === 'front9' || holesMode === 'back9') { return Math.round(ch / 2); }
    return ch;
};

const SyncStatus = ({ status }) => {
    if (status === 'saving') return <div className="flex items-center text-yellow-500 text-[10px] font-medium bg-slate-800 px-2 py-1 rounded-full border border-slate-700"><Loader2 size={12} className="animate-spin mr-1" /> Saving...</div>;
    if (status === 'error') return <div className="flex items-center text-red-500 text-[10px] font-medium bg-slate-800 px-2 py-1 rounded-full border border-red-900/50"><CloudOff size={12} className="mr-1" /> Offline</div>;
    return <div className="flex items-center text-slate-500 text-[10px] font-medium bg-slate-800 px-2 py-1 rounded-full border border-slate-700 transition-all duration-500"><Check size={12} className="mr-1 text-emerald-500" /> Saved</div>;
};

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState(null);
  const [gameId, setGameId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [handicapIndex, setHandicapIndex] = useState('');
  const [currentAvatar, setCurrentAvatar] = useState(''); 
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
  
  // Tee Sheet Guest Input
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestHcp, setNewGuestHcp] = useState('');
  
  // Setup State
  const [courseName, setCourseName] = useState('');
  const [slope, setSlope] = useState('113');
  const [rating, setRating] = useState('72.0');
  const [pars, setPars] = useState(DEFAULT_PARS);
  const [si, setSi] = useState(DEFAULT_SI);
  const [gameMode, setGameMode] = useState('stroke'); 
  const [teamMode, setTeamMode] = useState('singles');
  const [handicapMode, setHandicapMode] = useState('full');
  const [holesMode, setHolesMode] = useState('18');
  
  const activePars = gameSettings?.pars || DEFAULT_PARS;
  const activeSi = gameSettings?.si || DEFAULT_SI;
  const activeGameMode = gameSettings?.gameMode || 'stroke';
  const leaderboardData = players; 

  // Back Button Logic
  const isBackNav = useRef(false);
  useEffect(() => {
    if (!window.history.state) { window.history.replaceState({ view: 'lobby' }, ''); }
    const onPopState = (event) => {
      const destView = event.state?.view || 'lobby';
      if (view === 'score' && (destView === 'lobby' || destView === 'setup')) {
        window.history.pushState({ view: 'score' }, '');
        setShowExitModal(true);
      } else {
        isBackNav.current = true;
        setView(destView);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [view]);

  useEffect(() => {
    if (isBackNav.current) { isBackNav.current = false; return; }
    if (window.history.state?.view !== view) { window.history.pushState({ view }, ''); }
  }, [view]);

  // Auth & Data
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
          const sp = []; 
          snapshot.forEach(doc => sp.push({id: doc.id, ...doc.data()})); 
          sp.sort((a, b) => a.name.localeCompare(b.name)); 
          setSavedPlayers(sp); 
      }, (err) => { console.error("Error fetching players:", err); });
      return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !gameId) return;
    setLoading(true);
    const settingsRef = doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, `SETTINGS_${gameId}`);
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
        if (docSnap.exists()) { 
            const s = docSnap.data();
            setGameSettings(s); 
            if (view === 'lobby' || view === 'setup') setView('score'); 
        } 
        setLoading(false);
    }, (err) => console.error(err));
    const q = query(collection(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME), where('gameId', '==', gameId.toUpperCase()), where('type', '==', 'player'));
    const unsubPlayers = onSnapshot(q, (snapshot) => { const playerData = []; snapshot.forEach((doc) => { playerData.push({ id: doc.id, ...doc.data() }); }); setPlayers(playerData); }, (err) => console.error(err));
    return () => { unsubSettings(); unsubPlayers(); };
  }, [user, gameId]);

  // Actions
  const createGame = async (friendsToAdd = [], hostAvatarUrl = '') => {
      if (!playerName) { throw new Error("Host name required"); }
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const settingsId = `SETTINGS_${newCode}`;
      const totalPar = pars.reduce((a, b) => a + b, 0);
      
      await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, settingsId), { 
          courseName, slope, rating, pars, si, totalPar, gameMode, teamMode, handicapMode, holesMode,
          hostUserId: user.uid,
          createdAt: new Date().toISOString() 
      });
      await joinGameLogic(newCode, courseName, slope, rating, totalPar, hostAvatarUrl, holesMode, handicapMode);
      
      if (friendsToAdd.length > 0) {
          const batch = writeBatch(db);
          friendsToAdd.forEach(friend => {
              const guestId = `guest_${Math.random().toString(36).substring(2, 9)}`;
              const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, `${newCode}_${guestId}`);
              const ch = calculateCourseHandicap(friend.handicap, slope, rating, totalPar, holesMode, handicapMode);
              batch.set(docRef, { 
                  gameId: newCode, userId: guestId, playerName: friend.name, handicapIndex: friend.handicap, 
                  courseHandicap: ch, avatarUrl: friend.avatarUrl || '', type: 'player', isGuest: true, teeGroup: null, 
                  lastActive: new Date().toISOString() 
              });
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
    await joinGameLogic(code, settings.courseName, settings.slope, settings.rating, settings.totalPar, currentAvatar, settings.holesMode, mode);
  };

  const joinGameLogic = async (code, cName, cSlope, cRating, cTotalPar, avatarUrl = '', hMode = '18', hcpMode = 'full') => {
    setLoading(true);
    setGameId(code);
    localStorage.setItem('golf_game_id', code);
    localStorage.setItem('golf_player_name', playerName);
    localStorage.setItem('golf_player_hcp', handicapIndex);
    const ch = calculateCourseHandicap(handicapIndex, cSlope, cRating, cTotalPar, hMode, hcpMode);
    const playerDocId = `${code}_${user.uid}`;
    
    // Check for duplicate
    try {
        const q = query(
            collection(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME),
            where('gameId', '==', code),
            where('playerName', '==', playerName),
            where('type', '==', 'player')
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const existingDoc = querySnapshot.docs[0];
            const existingData = existingDoc.data();
            const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, existingDoc.id);
            await setDoc(docRef, {
                userId: user.uid, handicapIndex: handicapIndex, courseHandicap: ch,
                avatarUrl: avatarUrl || existingData.avatarUrl, isGuest: false, lastActive: new Date().toISOString()
            }, { merge: true });
        } else {
            await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, playerDocId), { 
                gameId: code, userId: user.uid, playerName: playerName, handicapIndex: handicapIndex, 
                courseHandicap: ch, avatarUrl: avatarUrl, type: 'player', lastActive: new Date().toISOString() 
            }, { merge: true });
        }
        setView('score');
    } catch (err) { console.error("Error joining:", err); setError("Join failed."); } finally { setLoading(false); }
  };

  // NEW: Update Settings & Recalculate Handicaps
  const updateGameSettings = async (newSettings) => {
    setSyncStatus('saving');
    try {
        const batch = writeBatch(db);
        
        // 1. Update Settings Doc
        const settingsRef = doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, `SETTINGS_${gameId}`);
        batch.update(settingsRef, newSettings);

        // 2. Recalculate Everyone's CH
        players.forEach(p => {
            const newCH = calculateCourseHandicap(
                p.handicapIndex, 
                newSettings.slope, 
                newSettings.rating, 
                newSettings.totalPar, 
                newSettings.holesMode, 
                newSettings.handicapMode || (newSettings.useHandicapDiff ? 'diff' : 'full')
            );
            const pRef = doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, p.id);
            batch.update(pRef, { courseHandicap: newCH });
        });

        await batch.commit();
        setSyncStatus('saved');
        setView('score'); // Return to game
    } catch(e) { 
        console.error("Error updating settings:", e); 
        setSyncStatus('error'); 
        alert("Failed to save settings.");
    }
  };

  const updateScore = async (targetUserId, hole, strokes) => {
    if (!user || !gameId) return;
    setSyncStatus('saving');
    const playerDocId = `${gameId}_${targetUserId}`;
    const targetPlayer = players.find(p => p.userId === targetUserId) || {};
    const currentScores = targetPlayer.scores || {};
    const newScores = { ...currentScores, [hole]: strokes };
    try { await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, playerDocId), { scores: newScores }, { merge: true }); setSyncStatus('saved'); } catch (e) { console.error("Sync error:", e); setSyncStatus('error'); }
  };

  const updatePlayerGroup = async (playerId, groupNum) => {
      if (!playerId) return;
      const playerDoc = doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, playerId);
      try { await updateDoc(playerDoc, { teeGroup: groupNum }); } catch(e) { console.error("Group update failed", e); }
  };
  
  const leaveGame = () => { setShowExitModal(true); };
  const confirmLeave = () => { localStorage.removeItem('golf_game_id'); setGameId(''); setPlayers([]); setGameSettings(null); setView('lobby'); setJoinCodeInput(''); setShowExitModal(false); };
  const loadHistoricalGame = (oldGameId) => { if(!oldGameId) return; setGameId(oldGameId); setShowHistory(false); setView('leaderboard'); };

  const addGuestPlayer = async (avatarUrl = '') => {
      if (!newGuestName.trim()) return;
      if (!gameId) return;
      const guestId = `guest_${Math.random().toString(36).substring(2, 9)}`;
      const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, `${gameId}_${guestId}`);
      const cSettings = gameSettings || {};
      const mode = cSettings.handicapMode || (cSettings.useHandicapDiff ? 'diff' : 'full');
      const ch = calculateCourseHandicap(newGuestHcp, cSettings.slope, cSettings.rating, cSettings.totalPar, cSettings.holesMode, mode);
      await setDoc(docRef, { 
          gameId: gameId, userId: guestId, playerName: newGuestName, handicapIndex: newGuestHcp || 0, 
          courseHandicap: ch, avatarUrl: avatarUrl, type: 'player', isGuest: true, teeGroup: null, lastActive: new Date().toISOString() 
      });
      setNewGuestName(''); setNewGuestHcp('');
  };

  const randomizeGroups = async (groupSize) => {
      if (players.length === 0) return;
      const shuffled = [...players];
      for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
      const batch = writeBatch(db);
      shuffled.forEach((p, index) => { const groupNum = Math.floor(index / groupSize) + 1; const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, p.id); batch.update(docRef, { teeGroup: groupNum }); });
      await batch.commit();
  };
  
  const handleLogin = async () => { const provider = new GoogleAuthProvider(); try { if (user && user.isAnonymous) { await linkWithPopup(user, provider); } else { await signInWithPopup(auth, provider); } } catch (error) { if (error.code === 'auth/credential-already-in-use') { await signInWithPopup(auth, provider); } else if (error.code === 'auth/popup-closed-by-user') { /* Ignore */ } else { alert("Login failed: " + error.message + "\nCheck domain whitelist in Firebase."); } } };
  const handleLogout = async () => { await signOut(auth); await signInAnonymously(auth); };

  return (
    <div className="min-h-screen bg-transparent text-white font-sans overflow-hidden flex flex-col" style={{ backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url("${BACKGROUND_IMAGE}")`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        {view === 'lobby' && (
            <LobbyView 
                courseName={courseName} setCourseName={setCourseName}
                startSetup={() => setView('setup')}
                playerName={playerName} setPlayerName={setPlayerName}
                handicapIndex={handicapIndex} setHandicapIndex={setHandicapIndex}
                currentAvatar={currentAvatar} setCurrentAvatar={setCurrentAvatar}
                joinCodeInput={joinCodeInput} setJoinCodeInput={setJoinCodeInput}
                handleJoinGame={handleJoinGame}
                error={error} 
                setShowPortal={setShowPortal}
                setShowHistory={setShowHistory}
                user={user} handleLogin={handleLogin} handleLogout={handleLogout}
                setShowInfo={setShowInfo}
                savedPlayers={savedPlayers} 
                APP_VERSION={APP_VERSION}
                CUSTOM_LOGO_URL={CUSTOM_LOGO_URL} 
            />
        )}
        
        {view === 'setup' && (
            <SetupView 
                courseName={courseName} setCourseName={setCourseName}
                slope={slope} setSlope={setSlope}
                rating={rating} setRating={setRating}
                pars={pars} setPars={setPars}
                gameMode={gameMode} setGameMode={setGameMode}
                setSi={setSi} si={si}       
                playerName={playerName} setPlayerName={setPlayerName}
                handicapIndex={handicapIndex} setHandicapIndex={setHandicapIndex}
                createGame={createGame}
                onCancel={() => setView('lobby')}
                savedPlayers={savedPlayers} 
                error={error} 
                teamMode={teamMode} setTeamMode={setTeamMode}
                handicapMode={handicapMode} setHandicapMode={setHandicapMode}
                holesMode={holesMode} setHolesMode={setHolesMode}
            />
        )}

        {/* FIX: Handle 'settings' view */}
        {(view === 'score' || view === 'leaderboard' || view === 'card' || view === 'settings') && (
            <>
                {view !== 'settings' && (
                    <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 h-14 flex items-center justify-between px-4 z-30 sticky top-0">
                        <div className="flex items-center space-x-2"><MapPin size={16} className="text-emerald-500" /><span className="font-bold text-sm truncate max-w-[120px]">{gameSettings?.courseName || 'Nils Pois'}</span></div>
                        <div className="flex items-center gap-2"><SyncStatus status={syncStatus} /><button type="button" onClick={(e) => { setShowTeeSheet(true); }} className="bg-slate-800 p-3 rounded-full text-emerald-500 hover:text-emerald-400 hover:bg-slate-700 transition active:scale-95"><Users size={18} /></button><div className="flex items-center bg-slate-950 rounded-full px-3 py-1 border border-slate-800" onClick={() => {navigator.clipboard.writeText(gameId);}}><span className="font-mono font-bold text-emerald-400 tracking-widest mr-2">{gameId}</span><Share2 size={12} className="text-slate-500"/></div></div>
                    </header>
                )}

                <main className="flex-1 p-4 max-w-lg mx-auto w-full overflow-hidden flex flex-col">
                    {view === 'score' && <ScoreView currentHole={currentHole} setCurrentHole={setCurrentHole} currentHoleScore={0} updateScore={updateScore} activePars={activePars} activeSi={activeSi} players={players} user={user} gameSettings={gameSettings} />}
                    {view === 'leaderboard' && <LeaderboardView leaderboardData={leaderboardData} user={user} activeGameMode={activeGameMode} teamMode={gameSettings?.teamMode || 'singles'} gameSettings={gameSettings} />}
                    {view === 'card' && <ScorecardView players={players} activePars={activePars} activeSi={activeSi} holesMode={gameSettings?.holesMode || '18'} gameMode={activeGameMode} />}
                    {/* FIX: Add Settings View */}
                    {view === 'settings' && <GameSettingsView gameSettings={gameSettings} onUpdate={updateGameSettings} onCancel={() => setView('score')} />}
                    
                    {view !== 'settings' && (
                        <div className="mt-2 flex justify-between items-center px-1"><button onClick={leaveGame} className="text-[10px] text-red-500/50 hover:text-red-400 flex items-center gap-1 uppercase tracking-wider"><LogOut size={10}/> Exit</button></div>
                    )}
                </main>

                <nav className="bg-slate-900 border-t border-slate-800 h-16 pb-2 z-20">
                    <div className="flex justify-around items-center h-full px-2 gap-2">
                        <button onClick={() => setView('score')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${view === 'score' ? 'text-emerald-500' : 'text-slate-600'}`}><Activity size={20} /><span className="text-[10px] font-bold uppercase">Score</span></button>
                        <button onClick={() => setView('leaderboard')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${view === 'leaderboard' ? 'text-blue-500' : 'text-slate-600'}`}><Trophy size={20} /><span className="text-[10px] font-bold uppercase">Leaderboard</span></button>
                        <button onClick={() => setView('card')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${view === 'card' ? 'text-purple-500' : 'text-slate-600'}`}><TableProperties size={20} /><span className="text-[10px] font-bold uppercase">Card</span></button>
                        {/* FIX: Add Settings Tab */}
                        <button onClick={() => setView('settings')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${view === 'settings' ? 'text-white' : 'text-slate-600'}`}><Settings size={20} /><span className="text-[10px] font-bold uppercase">Setup</span></button>
                    </div>
                </nav>
            </>
        )}
        {showPortal && user && <PlayerPortal onClose={() => setShowPortal(false)} userId={user.uid} savedPlayers={savedPlayers} db={db} APP_ID={APP_ID} />}
        {showHistory && user && <HistoryView userId={user.uid} onClose={() => setShowHistory(false)} onLoadGame={loadHistoricalGame} db={db} APP_ID={APP_ID} COLLECTION_NAME={COLLECTION_NAME} />}
        {showInfo && <InfoPage onClose={() => setShowInfo(false)} />}
        {showTeeSheet && <TeeSheetModal onClose={() => setShowTeeSheet(false)} players={players} addGuest={addGuestPlayer} randomize={randomizeGroups} newGuestName={newGuestName} setNewGuestName={setNewGuestName} newGuestHcp={newGuestHcp} setNewGuestHcp={setNewGuestHcp} savedPlayers={savedPlayers} updatePlayerGroup={updatePlayerGroup} teamMode={gameSettings?.teamMode || 'singles'} />}
        {showExitModal && <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"><div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-xs w-full"><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-white">Exit Game?</h3><button onClick={() => setShowExitModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button></div><p className="text-slate-400 text-sm mb-6">You will leave the lobby. Scores are saved online.</p><div className="flex gap-3"><button onClick={() => setShowExitModal(false)} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition">Cancel</button><button onClick={confirmLeave} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition">Exit</button></div></div></div>}
    </div>
  );
}