import React, { useState } from 'react';
import { 
    Settings, AlertCircle, User, Users, Plus, CheckSquare, Square, 
    UserCheck, X, BookOpen, Target, Activity, Swords, Gem, Save, Percent 
} from 'lucide-react';

// FIX: Import PRESET_COURSES directly at the top
import { PRESET_COURSES } from '../utils/constants';

const SetupView = ({ courseName, setCourseName, slope, setSlope, rating, setRating, pars, setPars, gameMode, setGameMode, setSi, si, playerName, setPlayerName, handicapIndex, setHandicapIndex, createGame, onCancel, savedPlayers, error, teamMode, setTeamMode, handicapMode, setHandicapMode, holesMode, setHolesMode }) => {
  const [selectedFriends, setSelectedFriends] = useState(new Set());
  const [adhocName, setAdhocName] = useState('');
  const [adhocHcp, setAdhocHcp] = useState('');
  const [adhocGuests, setAdhocGuests] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [hostAvatar, setHostAvatar] = useState('');
  const [activeTab, setActiveTab] = useState('preset');

  const handlePresetChange = (e) => {
    const key = e.target.value;
    // FIX: Access the imported constant directly
    if (key && PRESET_COURSES[key]) {
      const c = PRESET_COURSES[key];
      setCourseName(c.name); 
      setSlope(c.slope); 
      setRating(c.rating); 
      setPars(c.pars); 
      if (c.si) setSi(c.si);
    }
  };

  const updateHoleData = (index, type, value) => {
      const val = parseInt(value) || 0;
      if (type === 'par') {
          const newPars = [...pars];
          newPars[index] = val;
          setPars(newPars);
      } else {
          const newSi = [...si];
          newSi[index] = val;
          setSi(newSi);
      }
  };

  const toggleFriend = (id) => { const newSet = new Set(selectedFriends); if (newSet.has(id)) newSet.delete(id); else newSet.add(id); setSelectedFriends(newSet); };
  const addAdhoc = (e) => { e.preventDefault(); if (!adhocName.trim()) return; const newGuest = { id: `temp_${Date.now()}`, name: adhocName, handicap: adhocHcp || 0 }; setAdhocGuests(prev => [...prev, newGuest]); setAdhocName(''); setAdhocHcp(''); };
  const removeAdhoc = (id) => { setAdhocGuests(prev => prev.filter(g => g.id !== id)); };
  const handleStartGame = async () => {
      setIsCreating(true);
      try { const portalFriends = savedPlayers.filter(p => selectedFriends.has(p.id)); const fullRoster = [...portalFriends, ...adhocGuests]; await createGame(fullRoster, hostAvatar); } catch(e) { alert("Error creating game: " + e.message); setIsCreating(false); }
  };
  
  const ModeButton = ({ mode, icon: Icon, label }) => (<button onClick={() => setGameMode(mode)} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${gameMode === mode ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'}`}><Icon size={20} className="mb-1" /><span className="text-[10px] font-bold uppercase">{label}</span></button>);

  return (
    <div className="min-h-screen bg-transparent text-white p-4 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4 flex items-center"><Settings size={20} className="mr-2"/> Game Setup</h2>
        {error && <div className="w-full max-w-md p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm text-center mb-4 flex items-center justify-center animate-in fade-in"><AlertCircle size={16} className="mr-2"/>{String(error)}</div>}
        
        {/* Main Card with Backdrop Blur */}
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 space-y-6">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-emerald-400 uppercase flex items-center"><User size={12} className="mr-1"/> Host Player (You)</label>
                    {savedPlayers && savedPlayers.length > 0 && (
                        <select className="bg-slate-800 text-xs text-blue-400 border border-slate-700 rounded px-2 py-1 outline-none max-w-[120px]" onChange={(e) => { const p = savedPlayers.find(sp => sp.id === e.target.value); if(p) { setPlayerName(p.name); setHandicapIndex(p.handicap); setHostAvatar(p.avatarUrl || ''); } }} value=""><option value="" disabled>Load Profile...</option>{savedPlayers.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select>
                    )}
                </div>
                <div className="flex gap-3">
                     {hostAvatar && <img src={hostAvatar} className="w-10 h-10 rounded-full object-cover border border-slate-500 flex-shrink-0" alt="Host" />}
                     <input className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500 w-0" placeholder="Your Name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
                     <input type="number" className="w-20 bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="HCP" value={handicapIndex} onChange={(e) => setHandicapIndex(e.target.value)} />
                </div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-4">
                <label className="text-xs font-bold text-emerald-400 uppercase flex items-center"><Users size={12} className="mr-1"/> Add Players</label>
                <div className="flex gap-2 items-center">
                    <input className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500 w-0" placeholder="Guest Name" value={adhocName} onChange={(e) => setAdhocName(e.target.value)} />
                    <input type="number" className="w-16 bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="HCP" value={adhocHcp} onChange={(e) => setAdhocHcp(e.target.value)} />
                    <button type="button" onClick={addAdhoc} disabled={!adhocName.trim()} className="bg-emerald-600 text-white px-3 rounded-lg font-bold disabled:opacity-50 active:scale-95 transition-transform h-10 flex items-center justify-center flex-shrink-0"><Plus size={16} /></button>
                </div>
                {savedPlayers && savedPlayers.length > 0 && (
                    <div className="space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">From Portal</div>
                        <div className="max-h-32 overflow-y-auto pr-1">
                            {savedPlayers.map(p => (
                                <button type="button" key={p.id} onClick={() => toggleFriend(p.id)} className={`w-full flex items-center justify-between p-2 rounded-lg border text-xs mb-1 transition-all ${selectedFriends.has(p.id) ? 'bg-emerald-600/20 border-emerald-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        {p.avatarUrl && <img src={p.avatarUrl} className="w-6 h-6 rounded-full object-cover" />}
                                        <span className="truncate">{p.name}</span>
                                    </div>
                                    <div className="flex-shrink-0">{selectedFriends.has(p.id) ? <CheckSquare size={14} className="text-emerald-500"/> : <Square size={14} />}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {(playerName || selectedFriends.size > 0 || adhocGuests.length > 0) && (
                    <div className="bg-slate-900 rounded-lg p-2 border border-slate-800">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Who's Playing?</div>
                        <div className="flex flex-wrap gap-2">
                            {playerName && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30 flex items-center gap-1">{hostAvatar && <img src={hostAvatar} className="w-4 h-4 rounded-full"/>} {playerName} <UserCheck size={10} className="ml-1"/></span>}
                            {savedPlayers.filter(p => selectedFriends.has(p.id)).map(p => <span key={p.id} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700 flex items-center gap-1">{p.avatarUrl && <img src={p.avatarUrl} className="w-4 h-4 rounded-full"/>}{p.name}</span>)}
                            {adhocGuests.map(g => <span key={g.id} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30 flex items-center group">{g.name} <button type="button" onClick={() => removeAdhoc(g.id)} className="ml-1 hover:text-white"><X size={10}/></button></span>)}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="space-y-4">
                <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 mb-2">
                    <button onClick={() => setActiveTab('preset')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'preset' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Select Preset</button>
                    <button onClick={() => { setActiveTab('manual'); setCourseName(''); }} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'manual' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Create Custom</button>
                </div>

                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center"><BookOpen size={12} className="mr-1"/> Course Details</label>
                    
                    {activeTab === 'preset' ? (
                        <select className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-slate-400 focus:outline-none focus:border-emerald-500" onChange={handlePresetChange} defaultValue="">
                            <option value="" disabled>Or select preset...</option>
                            {Object.entries(PRESET_COURSES).map(([key, course]) => (
                                <option key={key} value={key}>{course.name}</option>
                            ))}
                        </select>
                    ) : (
                        <div className="space-y-2">
                            <input className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="Enter Course Name" />
                            <div className="text-[10px] text-slate-500 italic">Enter Slope/Rating below, then edit hole details</div>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-slate-500 uppercase">Slope</label><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 focus:border-emerald-500 outline-none transition-colors" value={slope} onChange={(e) => setSlope(e.target.value)} /></div>
                        <div><label className="text-xs font-bold text-slate-500 uppercase">Rating</label><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 focus:border-emerald-500 outline-none transition-colors" value={rating} onChange={(e) => setRating(e.target.value)} /></div>
                    </div>

                    {/* Manual Hole Editor */}
                    {activeTab === 'manual' && (
                        <div className="mt-2 bg-slate-900 rounded-lg p-2 border border-slate-800">
                            <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold mb-1 px-1"><span>Hole</span><span>Par</span><span>SI</span></div>
                            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                                {Array.from({length: 18}).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <div className="flex items-center justify-center bg-slate-800 rounded text-xs text-slate-400 font-mono h-8">{i + 1}</div>
                                        <input type="number" className="bg-slate-800 border border-slate-700 rounded text-center text-white text-xs h-8 focus:border-blue-500 outline-none" value={pars[i]} onChange={(e) => updateHoleData(i, 'par', e.target.value)} />
                                        <input type="number" className="bg-slate-800 border border-slate-700 rounded text-center text-white text-xs h-8 focus:border-blue-500 outline-none" value={si[i]} onChange={(e) => updateHoleData(i, 'si', e.target.value)} />
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Holes Mode Toggle */}
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Holes to Play</label>
                   <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                        <button onClick={() => setHolesMode('18')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${holesMode === '18' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>18 Holes</button>
                        <button onClick={() => setHolesMode('front9')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${holesMode === 'front9' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Front 9</button>
                        <button onClick={() => setHolesMode('back9')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${holesMode === 'back9' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Back 9</button>
                   </div>
                </div>

                {/* Format Toggle */}
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Format</label>
                   <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                        <button onClick={() => setTeamMode('singles')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${teamMode === 'singles' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Singles</button>
                        <button onClick={() => setTeamMode('pairs')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${teamMode === 'pairs' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Pairs (Better Ball)</button>
                   </div>
                </div>
                
                {/* Handicap Mode Toggle */}
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Handicap Calc</label>
                   <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                        <button onClick={() => setHandicapMode('full')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${handicapMode === 'full' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Full</button>
                        <button onClick={() => setHandicapMode('95')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${handicapMode === '95' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                            <span className="flex items-center justify-center"><Percent size={12} className="mr-1"/> 95%</span>
                        </button>
                        <button onClick={() => setHandicapMode('diff')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${handicapMode === 'diff' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Diff</button>
                   </div>
                </div>
                
                <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Game Mode</label><div className="grid grid-cols-2 gap-2"><ModeButton mode="stroke" icon={Target} label="Stroke Play" /><ModeButton mode="stableford" icon={Activity} label="Stableford" /><ModeButton mode="match" icon={Swords} label="Match Play" /><ModeButton mode="skins" icon={Gem} label="Skins" /></div></div>
            </div>
            <button type="button" onClick={handleStartGame} disabled={isCreating} className="w-full bg-emerald-600 py-4 rounded-xl font-bold mt-2 flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-emerald-900/50 disabled:opacity-50">{isCreating ? <Activity className="animate-spin" /> : <><Save size={18}/> Start Game</>}</button>
            <button type="button" onClick={onCancel} className="w-full py-2 text-slate-500 text-sm hover:text-white">Cancel</button>
        </div>
    </div>
  );
};

export default SetupView;