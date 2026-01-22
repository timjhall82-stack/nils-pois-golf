import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, Percent, Target, Activity, Swords, Gem, ArrowLeft } from 'lucide-react';

const GameSettingsView = ({ gameSettings, onUpdate, onCancel }) => {
    // Initialize state with current settings
    const [courseName, setCourseName] = useState(gameSettings?.courseName || '');
    const [slope, setSlope] = useState(gameSettings?.slope || 113);
    const [rating, setRating] = useState(gameSettings?.rating || 72);
    const [gameMode, setGameMode] = useState(gameSettings?.gameMode || 'stroke');
    const [teamMode, setTeamMode] = useState(gameSettings?.teamMode || 'singles');
    const [handicapMode, setHandicapMode] = useState(gameSettings?.handicapMode || 'full');
    const [holesMode, setHolesMode] = useState(gameSettings?.holesMode || '18');
    const [pars, setPars] = useState(gameSettings?.pars || Array(18).fill(4));
    const [si, setSi] = useState(gameSettings?.si || Array(18).fill(9));
    
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        // Calculate total par
        const totalPar = pars.reduce((a, b) => parseInt(a) + parseInt(b), 0);
        
        onUpdate({
            courseName,
            slope: parseFloat(slope),
            rating: parseFloat(rating),
            gameMode,
            teamMode,
            handicapMode,
            holesMode,
            pars: pars.map(p => parseInt(p)),
            si: si.map(s => parseInt(s)),
            totalPar
        });
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

    const ModeButton = ({ mode, current, set, icon: Icon, label }) => (
        <button 
            onClick={() => set(mode)} 
            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${current === mode ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-700 bg-slate-800 text-slate-400'}`}
        >
            <Icon size={16} className="mb-1" />
            <span className="text-[9px] font-bold uppercase">{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
            <div className="p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-10 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center text-lg"><Settings size={20} className="mr-2 text-slate-400" /> Game Setup</h3>
                <button onClick={onCancel} className="text-slate-400 hover:text-white"><ArrowLeft size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                
                {/* Course Info */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase">Course Details</label>
                    <input className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-white focus:border-emerald-500 outline-none" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="Course Name" />
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Slope</label><input type="number" className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-white focus:border-emerald-500 outline-none" value={slope} onChange={(e) => setSlope(e.target.value)} /></div>
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Rating</label><input type="number" className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-white focus:border-emerald-500 outline-none" value={rating} onChange={(e) => setRating(e.target.value)} /></div>
                    </div>
                </div>

                {/* Toggles */}
                <div className="space-y-4">
                     {/* Game Mode */}
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Game Mode</label>
                        <div className="grid grid-cols-4 gap-2">
                            <ModeButton mode="stroke" current={gameMode} set={setGameMode} icon={Target} label="Stroke" />
                            <ModeButton mode="stableford" current={gameMode} set={setGameMode} icon={Activity} label="Stable" />
                            <ModeButton mode="match" current={gameMode} set={setGameMode} icon={Swords} label="Match" />
                            <ModeButton mode="skins" current={gameMode} set={setGameMode} icon={Gem} label="Skins" />
                        </div>
                    </div>

                    {/* Format */}
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Format</label>
                       <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                            <button onClick={() => setTeamMode('singles')} className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${teamMode === 'singles' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Singles</button>
                            <button onClick={() => setTeamMode('pairs')} className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${teamMode === 'pairs' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Pairs</button>
                       </div>
                    </div>

                    {/* Handicap */}
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Handicap Calc</label>
                       <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                            <button onClick={() => setHandicapMode('full')} className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${handicapMode === 'full' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Full</button>
                            <button onClick={() => setHandicapMode('95')} className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${handicapMode === '95' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>95%</button>
                            <button onClick={() => setHandicapMode('diff')} className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${handicapMode === 'diff' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Diff</button>
                       </div>
                    </div>
                </div>

                {/* Hole Editor */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Hole Data (Par / SI)</label>
                    <div className="grid grid-cols-6 gap-1">
                        {Array.from({length: 18}).map((_, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <div className="text-[9px] text-center text-slate-600 font-mono">{i+1}</div>
                                <input type="number" className="bg-slate-800 border border-slate-700 rounded text-center text-white text-[10px] h-6 focus:border-emerald-500 outline-none" value={pars[i]} onChange={(e) => updateHoleData(i, 'par', e.target.value)} />
                                <input type="number" className="bg-slate-800 border border-slate-700 rounded text-center text-yellow-500 text-[10px] h-6 focus:border-emerald-500 outline-none" value={si[i]} onChange={(e) => updateHoleData(i, 'si', e.target.value)} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                    >
                        {isSaving ? <Activity className="animate-spin" /> : <><Save size={18}/> Update Game Settings</>}
                    </button>
                    <p className="text-[10px] text-center text-slate-500 mt-2">Updating Slope/Rating will recalculate all players' Course Handicaps.</p>
                </div>
            </div>
        </div>
    );
};

export default GameSettingsView;