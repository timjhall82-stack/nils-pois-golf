import React, { useMemo } from 'react';
import { User, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { getShotsOnHole, calculateStableford } from '../utils/golfLogic';

const ScoreView = ({ currentHole, setCurrentHole, activePars, activeSi, players, user, updateScore, gameSettings }) => {
    const handlePrev = () => setCurrentHole(prev => Math.max(1, prev - 1));
    const handleNext = () => setCurrentHole(prev => Math.min(18, prev + 1));
    
    // Sort players: User first, then by group/name
    const sortedPlayers = useMemo(() => {
        return [...players].sort((a, b) => {
            if (a.userId === user?.uid) return -1;
            if (b.userId === user?.uid) return 1;
            return (a.teeGroup || 99) - (b.teeGroup || 99) || a.playerName.localeCompare(b.playerName);
        });
    }, [players, user]);

    const holeIndex = currentHole - 1;
    const par = activePars[holeIndex];
    const si = activeSi[holeIndex];

    const ScoringRow = ({ player }) => {
        const score = player.scores?.[currentHole] || '';
        const shots = getShotsOnHole(player.courseHandicap, si);
        const netScore = score && score !== 'NR' ? score - shots : 'NR';
        const points = calculateStableford(score, par, shots);

        const handleScoreChange = (delta) => {
            let newScore = (parseInt(score) || par) + delta;
            if (newScore < 1) newScore = 1;
            updateScore(player.userId, currentHole, newScore);
        };

        const toggleNR = () => {
            updateScore(player.userId, currentHole, score === 'NR' ? par : 'NR');
        };

        return (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 mb-3 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <div className="relative">
                        {player.avatarUrl ? (
                            <img src={player.avatarUrl} className="w-12 h-12 rounded-full object-cover border-2 border-slate-700" alt={player.playerName}/>
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                                <User size={20} className="text-slate-500"/>
                            </div>
                        )}
                        {player.teeGroup && (
                            <div className="absolute -bottom-1 -right-1 bg-slate-700 text-[10px] font-bold px-1.5 rounded border border-slate-600">
                                G{player.teeGroup}
                            </div>
                        )}
                        {shots !== 0 && (
                            <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-slate-900 font-bold shadow-sm">
                                {shots > 0 ? `+${shots}` : shots}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="font-bold text-white text-sm truncate">{player.playerName}</div>
                        <div className="text-[10px] text-slate-400 flex gap-2">
                             <span>Net: <span className="text-emerald-400 font-bold">{score === 'NR' ? '-' : netScore}</span></span>
                             {gameSettings?.gameMode === 'stableford' && <span>Pts: <span className="text-yellow-400 font-bold">{points}</span></span>}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={toggleNR} className={`w-8 h-8 rounded-lg font-bold text-[10px] border transition-colors ${score === 'NR' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                        NR
                    </button>
                    <button onClick={() => handleScoreChange(-1)} className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white border border-slate-700 active:bg-slate-700 active:scale-95 transition-all">
                        <Minus size={18} />
                    </button>
                    <div className={`w-12 h-10 flex items-center justify-center font-black text-xl rounded-lg border bg-slate-950 ${score === 'NR' ? 'text-red-500 border-red-900' : 'text-white border-slate-800'}`}>
                        {score}
                    </div>
                    <button onClick={() => handleScoreChange(1)} className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-900/50 active:scale-95 transition-all">
                        <Plus size={18} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
                <button onClick={handlePrev} className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white disabled:opacity-30 transition-colors" disabled={currentHole === 1}><ChevronLeft size={24} /></button>
                <div className="text-center">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Hole {currentHole}</div>
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex flex-col items-center"><span className="text-[10px] text-slate-500">PAR</span><span className="font-black text-xl text-white">{par}</span></div>
                        <div className="w-px h-8 bg-slate-800"></div>
                        <div className="flex flex-col items-center"><span className="text-[10px] text-slate-500">SI</span><span className="font-bold text-xl text-yellow-500">{si}</span></div>
                    </div>
                </div>
                <button onClick={handleNext} className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white disabled:opacity-30 transition-colors" disabled={currentHole === 18}><ChevronRight size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto pb-20">
                {sortedPlayers.map(p => <ScoringRow key={p.id} player={p} />)}
            </div>
        </div>
    );
};

export default ScoreView;