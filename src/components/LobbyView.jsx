import React from 'react';
import { User, LogIn, AlertCircle, Contact, History, Info, ChevronDown } from 'lucide-react';
import { CUSTOM_LOGO_URL, APP_VERSION } from '../utils/constants';

const LobbyView = ({ playerName, setPlayerName, joinCodeInput, setJoinCodeInput, handleJoinGame, courseName, setCourseName, startSetup, error, setShowPortal, setShowHistory, user, handleLogin, handleLogout, setShowInfo, savedPlayers }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-950 text-white space-y-6">
    <div className="text-center mb-4">
      <div className="mb-2 relative z-10"><img src={CUSTOM_LOGO_URL} alt="Logo" className="w-48 h-48 mx-auto object-contain drop-shadow-2xl filter brightness-110" /></div>
      <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-lg">Nils Pois Golf</h1>
      <p className="text-emerald-400 text-xs font-bold tracking-widest uppercase">&copy; 2025 Timah</p>
    </div>
    <div className="w-full max-w-sm bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-3 flex justify-between items-center shadow-2xl">
        <div className="flex items-center"><div className="bg-slate-800 p-2 rounded-full text-slate-400 mr-3"><User size={16} /></div><div><div className="text-xs font-bold text-slate-300">{user?.isAnonymous ? 'Guest User' : (user?.displayName || (user?.email ? user.email.split('@')[0] : 'Golfer'))}</div><div className="text-[10px] text-slate-500">{user?.isAnonymous ? 'Data not saved' : (user?.email || 'Account Synced')}</div></div></div>
        {user?.isAnonymous ? <button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center transition-colors shadow-lg shadow-blue-600/20"><LogIn size={12} className="mr-1" /> Login</button> : <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 text-xs font-bold py-2 px-2 transition-colors">Sign Out</button>}
    </div>
    {error && <div className="w-full max-w-sm p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm text-center animate-in fade-in slide-in-from-top-2 flex items-center justify-center"><AlertCircle size={16} className="mr-2"/>{String(error)}</div>}
    <div className="w-full max-w-sm bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/10 space-y-4">
      <div className="flex justify-between items-center"><h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Start New Round</h2></div>
      <div><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Course / Game Name</label><input type="text" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:outline-none focus:border-emerald-500 transition-colors text-white" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="e.g. Sunday Medal" /></div>
      <button type="button" onClick={startSetup} disabled={!courseName.trim()} className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-bold text-white shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100">Setup Game</button>
    </div>
    <div className="w-full max-w-sm grid grid-cols-3 gap-2">
        <button onClick={() => setShowPortal(true)} className="bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-sm border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center group transition-all shadow-lg"><div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 mb-1 group-hover:bg-blue-500 group-hover:text-white transition-colors"><Contact size={18} /></div><div className="font-bold text-[10px] text-slate-300">Players</div></button>
        <button onClick={() => setShowHistory(true)} className="bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-sm border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center group transition-all shadow-lg"><div className="bg-purple-500/20 p-2 rounded-lg text-purple-400 mb-1 group-hover:bg-purple-500 group-hover:text-white transition-colors"><History size={18} /></div><div className="font-bold text-[10px] text-slate-300">History</div></button>
        <button onClick={() => setShowInfo(true)} className="bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-sm border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center group transition-all shadow-lg"><div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400 mb-1 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><Info size={18} /></div><div className="font-bold text-[10px] text-slate-300">Info</div></button>
    </div>
    <div className="w-full max-w-sm relative py-2"><div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-white/10"></div></div><div className="relative flex justify-center"><span className="bg-black/40 backdrop-blur px-2 text-xs text-slate-400 uppercase tracking-widest rounded">Or Join Existing</span></div></div>
    <div className="w-full max-w-sm bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-4 shadow-2xl">
        <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Your Name</label>
              <div className="relative">
                <input type="text" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white" value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Guest Name" list="player-suggestions"/>
                <datalist id="player-suggestions">
                    {savedPlayers.map(p => <option key={p.id} value={p.name} />)}
                </datalist>
                {savedPlayers.length > 0 && <div className="absolute right-2 top-3 text-slate-500 pointer-events-none"><ChevronDown size={14}/></div>}
              </div>
            </div>
            <div><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Game Code</label><input type="text" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-center font-mono uppercase tracking-widest focus:outline-none focus:border-blue-500 transition-colors text-white" value={joinCodeInput} onChange={(e) => setJoinCodeInput(e.target.value)} maxLength={6} placeholder="CODE" /></div>
        </div>
        <button type="button" onClick={handleJoinGame} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20 transition-all active:scale-95">Join Game</button>
    </div>
    <div className="mt-4 text-slate-400 text-[10px] font-mono opacity-60 bg-black/40 px-2 py-1 rounded backdrop-blur">Version {APP_VERSION}</div>
  </div>
);

export default LobbyView;