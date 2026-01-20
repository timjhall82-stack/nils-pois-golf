import React, { useMemo } from 'react';
import { getShotsOnHole, calculateStableford } from '../utils/scoring'; // Adjust path if needed

const ScorecardView = ({ players, activePars, activeSi, holesMode, gameMode }) => {
    // FIX: Sort players by Tee Group (Group 1, Group 2...) before rendering
    const sortedPlayers = useMemo(() => {
        return [...players].sort((a, b) => {
            // Sort by Group Number (1, 2, 3...)
            const groupA = a.teeGroup || 99;
            const groupB = b.teeGroup || 99;
            if (groupA !== groupB) return groupA - groupB;
            
            // If same group, sort Alphabetically
            return a.playerName.localeCompare(b.playerName);
        });
    }, [players]);

    const holes = useMemo(() => {
        if (holesMode === 'front9') return [1,2,3,4,5,6,7,8,9];
        if (holesMode === 'back9') return [10,11,12,13,14,15,16,17,18];
        return Array.from({length: 18}, (_, i) => i + 1);
    }, [holesMode]);

    return (
        <div className="flex flex-col h-full overflow-hidden bg-slate-900 border border-slate-800 rounded-xl">
             <div className="overflow-x-auto flex-1">
                 <table className="w-full text-center border-collapse">
                     <thead>
                         <tr>
                             <th className="sticky left-0 bg-slate-900 z-20 p-2 text-left text-xs text-slate-400 border-b border-slate-800 min-w-[100px]">Player</th>
                             {holes.map(h => (
                                 <th key={h} className="bg-slate-900/95 p-2 text-[10px] text-slate-500 border-b border-slate-800 min-w-[35px]">{h}</th>
                             ))}
                             <th className="bg-slate-900/95 p-2 text-[10px] text-white border-b border-slate-800 font-bold">Tot</th>
                         </tr>
                     </thead>
                     <tbody>
                        {sortedPlayers.map((p, idx) => {
                             let total = 0;
                             return (
                                 <tr key={p.id} className={idx % 2 === 0 ? 'bg-slate-800/30' : ''}>
                                     <td className="sticky left-0 bg-slate-900/95 z-10 p-2 text-left border-r border-slate-800">
                                         <div className="font-bold text-xs text-white truncate max-w-[90px]">{p.playerName}</div>
                                         <div className="flex items-center gap-1">
                                             {p.teeGroup && <span className="text-[9px] bg-slate-800 px-1 rounded border border-slate-700 text-slate-400">G{p.teeGroup}</span>}
                                             <span className="text-[9px] text-slate-500">CH {p.courseHandicap}</span>
                                         </div>
                                     </td>
                                     {holes.map(h => {
                                         const s = p.scores?.[h];
                                         let points = 0;
                                         
                                         if(s && s !== 'NR') total += parseInt(s);
                                         
                                         const par = activePars[h-1];
                                         const si = activeSi[h-1]; 
                                         
                                         let colorClass = "text-slate-400";
                                         if (s) {
                                            const diff = s - par;
                                            
                                            // Calculate Stableford points for display
                                            if (gameMode === 'stableford') {
                                                const shots = getShotsOnHole(p.courseHandicap, si);
                                                points = calculateStableford(s, par, shots);
                                            }

                                            if (s === 'NR') colorClass = "text-red-500";
                                            else if (diff <= -2) colorClass = "text-yellow-400 font-bold";
                                            else if (diff === -1) colorClass = "text-red-400 font-bold";
                                            else if (diff === 0) colorClass = "text-white";
                                            else if (diff === 1) colorClass = "text-blue-400";
                                            else colorClass = "text-slate-500";
                                         }

                                         return (
                                             <td key={h} className={`p-2 text-xs border-r border-slate-800/50 ${colorClass}`}>
                                                 {s || '-'}
                                                 {/* Show small yellow points if Stableford */}
                                                 {gameMode === 'stableford' && s && s !== 'NR' && (
                                                     <sub className="text-[9px] text-yellow-500/80 ml-0.5 align-baseline font-normal">({points})</sub>
                                                 )}
                                             </td>
                                         );
                                     })}
                                     <td className="p-2 text-xs font-bold text-emerald-400">{total > 0 ? total : '-'}</td>
                                 </tr>
                             );
                        })}
                     </tbody>
                 </table>
             </div>
        </div>
    );
};

export default ScorecardView;