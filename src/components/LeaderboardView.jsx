import React, { useMemo } from 'react';
import { Trophy, User } from 'lucide-react';
import { getShotsOnHole, DEFAULT_PARS, DEFAULT_SI } from '../utils/constants'; // Adjust imports

const LeaderboardView = ({ leaderboardData, activeGameMode, teamMode, gameSettings }) => {
    const players = Array.isArray(leaderboardData) ? leaderboardData : []; 
    const pars = gameSettings?.pars || DEFAULT_PARS;
    const si = gameSettings?.si || DEFAULT_SI;

    const computedLeaderboard = useMemo(() => {
        let entities = [];
        
        // 1. Group Entities (Singles vs Pairs)
        if (teamMode === 'pairs') {
            const groups = {};
            players.forEach(p => {
                // If in pairs mode, group by their Tee Group
                const g = p.teeGroup || 999;
                if (!groups[g]) groups[g] = [];
                groups[g].push(p);
            });

            entities = Object.entries(groups).map(([gId, members]) => {
                if (gId === '999') return null; // Skip ungrouped players in pairs mode
                return {
                    id: `grp_${gId}`,
                    name: `Group ${gId}`,
                    members: members,
                    teeGroup: parseInt(gId),
                    isTeam: true,
                    getHoleScore: (hIdx, holeSi, holePar) => {
                        let bestNet = 999;
                        let played = false;
                        members.forEach(m => {
                            const raw = m.scores?.[hIdx + 1];
                            if (raw && raw !== 'NR') {
                                played = true;
                                const shots = getShotsOnHole(m.courseHandicap, holeSi);
                                const net = raw - shots;
                                if (net < bestNet) bestNet = net;
                            }
                        });
                        return played ? bestNet : null;
                    }
                };
            }).filter(Boolean);
        } else {
            // Singles Mode
            entities = players.map(p => ({
                ...p,
                isTeam: false,
                getHoleScore: (hIdx, holeSi, holePar) => {
                    const raw = p.scores?.[hIdx + 1];
                    if (raw && raw !== 'NR') {
                        const shots = getShotsOnHole(p.courseHandicap, holeSi);
                        return raw - shots;
                    }
                    return null;
                }
            }));
        }

        // 2. Calculate Scores
        const calculatedEntities = entities.map(e => {
            let total = 0;
            let thru = 0;
            
            // ... (Your existing Skins/Match logic here if needed, keeping simple Stroke/Stableford for brevity) ...
            
            if (activeGameMode === 'skins') {
               // ... logic for skins ...
               return { ...e, score: 0, thru: 0 }; // Placeholder if using complex logic
            } else if (activeGameMode === 'match') {
                 // ... logic for match ...
                 return { ...e, score: 0, thru: 0 };
            } else {
                // Standard Stroke / Stableford
                for (let h = 0; h < 18; h++) {
                    const holeSi = si[h];
                    const holePar = pars[h];
                    const net = e.getHoleScore(h, holeSi, holePar);
                    if (net !== null) {
                        thru = Math.max(thru, h + 1);
                        if (activeGameMode === 'stableford') {
                            const pts = holePar - net + 2;
                            total += (pts < 0 ? 0 : pts);
                        } else {
                            total += (net - holePar);
                        }
                    }
                }
                return { ...e, score: total, thru };
            }
        });

        // 3. SORTING LOGIC (The Fix)
        return calculatedEntities.sort((a, b) => {
            // Primary Sort: Score
            if (activeGameMode === 'stableford' || activeGameMode === 'skins') {
                if (b.score !== a.score) return b.score - a.score; // High points first
            } else {
                if (a.score !== b.score) return a.score - b.score; // Low score first
            }

            // Secondary Sort: Tee Group
            // If scores are tied (e.g. at start of game), sort by Group Number
            const groupA = a.teeGroup || 99;
            const groupB = b.teeGroup || 99;
            return groupA - groupB;
        });

    }, [players, activeGameMode, teamMode, pars, si]);

    const getScoreLabel = () => activeGameMode === 'skins' ? 'Skins' : activeGameMode === 'match' ? 'Match' : activeGameMode === 'stableford' ? 'Points' : 'To Par';
    const getScoreValue = (score) => {
        if (activeGameMode === 'skins' || activeGameMode === 'stableford') return score;
        if (score > 0) return `+${score}`;
        if (score === 0) return 'E';
        return score;
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/30 rounded-2xl overflow-hidden border border-slate-800">
             <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center sticky top-0 z-10">
                <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center">
                    <Trophy size={16} className="mr-2 text-yellow-500" /> Leaderboard
                </h3>
                <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 font-bold uppercase border border-slate-700">
                    {getScoreLabel()}
                </span>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-2">
                {computedLeaderboard.map((entry, index) => (
                    <div key={entry.id} className={`relative flex items-center justify-between p-3 rounded-xl border ${index === 0 ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-slate-800/50 border-slate-700/50'}`}>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-8 h-8 flex items-center justify-center font-black text-sm rounded-lg ${index === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-400'}`}>
                                {index + 1}
                            </div>
                            {entry.isTeam ? (
                                <div>
                                    <div className="font-bold text-white text-sm">{entry.name}</div>
                                    <div className="flex -space-x-2 mt-1">
                                        {entry.members.map(m => (
                                            <div key={m.id} className="w-5 h-5 rounded-full bg-slate-600 border border-slate-800 overflow-hidden">
                                                {m.avatarUrl ? <img src={m.avatarUrl} className="w-full h-full object-cover"/> : <User size={12} className="m-auto text-slate-300"/>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="min-w-0">
                                    <div className="font-bold text-white text-sm truncate">{entry.playerName}</div>
                                    <div className="flex gap-2">
                                        <div className="text-[10px] text-slate-500">Thru {entry.thru}</div>
                                        {entry.teeGroup && <div className="text-[10px] text-emerald-500 font-bold bg-emerald-900/20 px-1 rounded">Grp {entry.teeGroup}</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <div className={`font-black text-xl ${activeGameMode === 'stableford' || activeGameMode === 'skins' ? 'text-yellow-400' : (entry.score < 0 ? 'text-red-400' : (entry.score > 0 ? 'text-white' : 'text-slate-400'))}`}>
                                {getScoreValue(entry.score)}
                            </div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">{activeGameMode === 'match' ? 'Vs Par' : getScoreLabel()}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeaderboardView;