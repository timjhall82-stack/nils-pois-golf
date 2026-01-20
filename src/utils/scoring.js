// src/utils/scoring.js

export const getShotsOnHole = (playingHandicap, holeSi) => {
    let shots = 0;
    if (playingHandicap >= holeSi) shots = 1;
    if (playingHandicap >= holeSi + 18) shots = 2;
    if (playingHandicap >= holeSi + 36) shots = 3;
    
    // Handle plus handicaps (giving shots back)
    if (playingHandicap < 0 && Math.abs(playingHandicap) >= (19 - holeSi)) {
        shots = -1;
    }
    
    return shots;
};

export const calculateStableford = (gross, par, shots) => {
    if (!gross || gross === 'NR') return 0;
    const net = gross - shots;
    const points = par - net + 2;
    return points < 0 ? 0 : points;
};

export const calculateNetScore = (gross, holeIdx, ch, siList) => {
    if (gross === 'NR' || !gross) return 'NR';
    const holeSi = siList[holeIdx];
    let strokesReceived = 0;
    
    if (ch >= holeSi) strokesReceived = 1;
    if (ch >= holeSi + 18) strokesReceived = 2; 
    if (ch < 0 && Math.abs(ch) >= (19 - holeSi)) strokesReceived = -1;
    
    return gross - strokesReceived;
};