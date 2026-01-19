export const calculateCourseHandicap = (index, slopeVal, ratingVal, parVal, holesMode = '18', handicapMode = 'full') => {
    if (!index || index === '') return 0;
    let idx = parseFloat(index);
    const slp = parseFloat(slopeVal) || 113;
    const rtg = parseFloat(ratingVal) || 72;
    const pr = parseInt(parVal) || 72;
    
    // WHS Formula
    let rawCh = idx * (slp / 113) + (rtg - pr);
    
    // Apply Allowance
    if (handicapMode === '95') {
        rawCh = rawCh * 0.95;
    }

    let ch = Math.round(rawCh);

    if (holesMode === 'front9' || holesMode === 'back9') {
        return Math.round(ch / 2);
    }
    return ch;
};

export const getShotsOnHole = (playingHandicap, holeSi) => {
    let shots = 0;
    if (playingHandicap >= holeSi) shots = 1;
    if (playingHandicap >= holeSi + 18) shots = 2;
    if (playingHandicap >= holeSi + 36) shots = 3;
    if (playingHandicap < 0 && Math.abs(playingHandicap) >= (19 - holeSi)) shots = -1;
    return shots;
};

export const calculateStableford = (gross, par, shots) => {
    if (!gross || gross === 'NR') return 0;
    const net = gross - shots;
    const points = par - net + 2;
    return points < 0 ? 0 : points;
};