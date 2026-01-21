import React, { useMemo } from 'react';
import { Trophy, User } from 'lucide-react';
import { getShotsOnHole } from '../utils/scoring'; 
import { DEFAULT_PARS, DEFAULT_SI } from '../utils/constants';

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
                const g = p.teeGroup || 999;
                if (!groups[g]) groups[g] = [];
                groups[g].push(p);
            });

            // Sort so Group 1 is always first (The Reference/Host Team)
            entities = Object.entries(groups)
                .sort(([aId], [bId]) => aId - bId)
                .map(([gId, members]) => {
                    if (gId === '999') return null;
                    return {
                        id: `grp_${gId}`,
                        name: `Group ${gId}`,
                        members: members,
                        teeGroup: parseInt(gId),
                        isTeam: true,
                        getHoleScore: (hIdx, holeSi) => {
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
            // Singles Mode: Sort by join order (usually) or ID to ensure Host is first
            // We assume the first player in the list is the Host/Reference for Match Play
            entities = players.map(p => ({
                ...p,
                isTeam: false,
                getHoleScore: (hIdx, holeSi) => {
                    const raw = p.scores?.[hIdx + 1];
                    if (raw && raw !== 'NR') {
                        const shots = getShotsOnHole(p.courseHandicap, holeSi);
                        return raw - shots;
                    }
                    return null;
                }
            }));
        }

        // 2. LOGIC: MATCH PLAY (1 vs 1)
        if (activeGameMode === 'match') {
            // In this mode, the first entity (Host/Group 1) is the reference "Opponent"
            const opponent = entities[0]; 

            // Calculate match status for everyone relative to Entity 0
            entities.forEach(e => {
                e.matchScore = 0; // 0 = All Square, +1 = 1 Up, -1 = 1 Down
                e.thru = 0;
                
                // If this is the opponent themselves, they stay at 0 (AS)
                // We track their "thru" only
                if (e.id === opponent.id) {
                    for (let h = 0; h < 18; h++) {
                        if (e.getHoleScore(h, si[h]) !== null) e.thru = Math.max(e.thru, h+1);
                    }
                    return;
                }

                // Compare e vs opponent
                for (let h = 0; h < 18; h++) {
                    const holeSi = si[h];
                    const myNet = e.getHoleScore(h, holeSi);
                    const oppNet = opponent.getHoleScore(h, holeSi);

                    if (myNet !== null && oppNet !== null) {
                        e.thru = Math.max(e.thru, h + 1);
                        if (myNet < oppNet) {
                            e.matchScore += 1; // Win Hole
                        } else if (myNet > oppNet) {
                            e.matchScore -= 1; // Lose Hole
                        }
                        // Equal net scores = Halved hole (no change)
                    }
                }
            });

            // Return entities with 'score' mapped to matchScore
            return entities.map(e => ({ ...e, score: e.matchScore })).sort((a, b) => b.score - a.score);
        }

        // 3. LOGIC: SKINS
        if (activeGameMode === 'skins') {
            entities.forEach(e => { e.skins = 0; e.thru = 0; });
            // Carry-over pot logic
            let pot = 1; 

            for (let h = 0; h < 18; h++) {
                const holeSi = si[h];
                let minScore = 999;
                let winners = [];
                let holePlayed = false;

                entities.forEach(e => {
                    const net = e.getHoleScore(h, holeSi);
                    if (net !== null) {
                        e.thru = Math.max(e.thru, h + 1);
                        holePlayed = true;
                        if (net < minScore) {
                            minScore = net;
                            winners = [e];
                        } else if (net === minScore) {
                            winners.push(e);
                        }
                    }
                });

                if (holePlayed) {
                    if (winners.length === 1) {
                        // Unique winner takes pot
                        winners[0].skins += pot;
                        pot = 1; // Reset pot
                    } else {
                        // Tie: Carry over
                        pot += 1;
                    }
                }
            }
            return entities.map(e => ({ ...e, score: e.skins })).sort((a, b) => b.score - a.score);
        }

        // 4. LOGIC: STROKE / STABLEFORD (Default)
        return entities.map(e => {
            let total = 0;
            let thru = 0;
            for (let h = 0; h < 18; h++) {
                const holeSi = si[h];
                const holePar = pars[h];
                const net = e.getHoleScore(h, holeSi);
                if (net !== null) {
                    thru = Math.max(thru, h + 1);
                    if (activeGameMode === 'stableford') {
                        // Stableford Points
                        const pts = holePar - net + 2;
                        total += (pts < 0 ? 0 : pts);
                    } else {
                        // Stroke Play (Gross or Net total based on inputs, here we sum net diff from par)
                        // Simple Net Total relative to par for Leaderboard display
                        total += (net - holePar);
                    }
                }
            }
            return { ...e, score: total, thru };
        }).sort((a, b) => {
            // Stableford: High score wins. Stroke: Low score wins.
            if (activeGameMode === 'stableford') return b.score - a.score;
            return a.score - b.score;
        });

    }, [players, activeGameMode, teamMode, pars, si]);

    // --- DISPLAY HELPERS ---

    const getScoreLabel = () => activeGameMode === 'skins' ? 'Skins' : activeGameMode === 'match' ? 'Match' : activeGameMode === 'stableford' ? 'Points' : 'To Par';
    
    const getScoreValue = (score, isReference = false) => {
        if (activeGameMode === 'match') {
            if (isReference) return 'Ref'; // The Host/Opponent
            if (score === 0) return 'AS';
            if (score > 0) return `${score}UP`;
            if (score < 0) return `${Math.abs(score)}DN`;
        }
        if (activeGameMode === 'skins' || activeGameMode === 'stableford') return score;
        
        // Stroke play formatting
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
                {computedLeaderboard.map((entry, index) => {
                    // In Match Play, usually the top item is the Leader (who might be the host or the challenger)
                    // We check if this entry is the "Host/Reference" (index 0 of original list)
                    // But 'computedLeaderboard' is sorted by score. 
                    // We can identify the Host if needed, but standard display is fine.
                    
                    return (
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
                                                    {m.avatarUrl ? <img src={m.avatarUrl} className="w-full h-full object-cover" alt="Avatar"/> : <User size={12} className="m-auto text-slate-300"/>}
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
                                <div className="text-[10px] text-slate-500 font-bold uppercase">
                                    {activeGameMode === 'match' ? 'Vs Host' : getScoreLabel()}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LeaderboardView;