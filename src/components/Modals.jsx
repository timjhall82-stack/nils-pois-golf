// ... (Previous imports) ...

// ... (TeeSheetModal & InfoPage unchanged from previous step) ...

// --- IMPROVED HISTORY VIEW ---
export const HistoryView = ({ userId, onClose, onLoadGame, db, APP_ID, COLLECTION_NAME }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch player's personal records
                const q = query(
                    collection(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME), 
                    where('userId', '==', userId), 
                    where('type', '==', 'player')
                );
                const querySnapshot = await getDocs(q);
                
                const promises = querySnapshot.docs.map(async (playerDoc) => {
                    const playerData = playerDoc.data();
                    const gameId = playerData.gameId;
                    if (!gameId) return null;
                    
                    // Fetch associated Game Settings
                    const settingsRef = doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, `SETTINGS_${gameId}`);
                    const settingsSnap = await getDoc(settingsRef);
                    
                    if (settingsSnap.exists()) {
                        const settings = settingsSnap.data();
                        
                        // Calculate simple total strokes for display
                        let totalStrokes = 0;
                        if (playerData.scores) {
                            Object.values(playerData.scores).forEach(s => {
                                if (s && s !== 'NR') totalStrokes += parseInt(s);
                            });
                        }

                        return { 
                            id: gameId, 
                            // USE GAME TITLE IF AVAILABLE, ELSE COURSE NAME
                            gameTitle: settings.gameTitle || settings.courseName || `Game ${gameId}`,
                            courseName: settings.courseName, // Keep original course name for sub-text
                            date: settings.createdAt, 
                            totalScore: totalStrokes,
                            mode: settings.gameMode || 'stroke' 
                        };
                    }
                    return null;
                });
                
                const results = await Promise.all(promises);
                // Sort by date descending (newest first)
                setHistory(results.filter(g => g !== null).sort((a, b) => new Date(b.date) - new Date(a.date)));
            } catch (err) { 
                console.error("Error fetching history:", err); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchHistory();
    }, [userId, db, APP_ID, COLLECTION_NAME]);

    const handleDelete = async (gameId, e) => {
        e.stopPropagation(); 
        if (!confirm("Are you sure you want to permanently delete this round? This cannot be undone.")) return;

        try {
            const batch = writeBatch(db);
            const settingsRef = doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, `SETTINGS_${gameId}`);
            batch.delete(settingsRef);
            const q = query(collection(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME), where('gameId', '==', gameId));
            const playerSnaps = await getDocs(q);
            playerSnaps.forEach(doc => { batch.delete(doc.ref); });
            
            await batch.commit();
            setHistory(prev => prev.filter(g => g.id !== gameId));
        } catch (err) { 
            console.error("Error deleting game:", err); 
            alert("Could not delete game. Check console."); 
        }
    };

    const formatMode = (mode) => {
        if (!mode) return 'Stroke';
        return mode.charAt(0).toUpperCase() + mode.slice(1);
    };

    return (
        <div className="fixed inset-0 bg-slate-950 z-[60] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                <h3 className="font-bold text-white flex items-center text-lg"><History size={20} className="mr-2 text-purple-400" /> Game History</h3>
                <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                    <div className="flex justify-center pt-10 text-slate-500"><Activity className="animate-spin" /></div>
                ) : history.length === 0 ? (
                    <div className="text-center text-slate-500 py-10">No games played yet.</div>
                ) : (
                    history.map(game => (
                        <div key={game.id} className="w-full bg-slate-900 border border-slate-800 rounded-xl flex overflow-hidden group shadow-sm">
                            <button onClick={() => onLoadGame(game.id)} className="flex-1 p-4 text-left hover:bg-slate-800 transition">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        {/* Display Main Game Title */}
                                        <div className="font-bold text-white text-lg leading-tight">{game.gameTitle}</div>
                                        {/* Display Sub-text Course Name if it differs from Title */}
                                        {game.courseName && game.courseName !== game.gameTitle && (
                                            <div className="text-xs text-slate-500 font-bold mt-0.5 uppercase tracking-wide">{game.courseName}</div>
                                        )}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800 uppercase tracking-widest">{game.id}</div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                    <span className="flex items-center"><Calendar size={12} className="mr-1 opacity-70"/> {new Date(game.date).toLocaleDateString()}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                    <span className="flex items-center text-emerald-400 font-bold"><Flag size={12} className="mr-1 opacity-70"/> {formatMode(game.mode)}</span>
                                    {game.totalScore > 0 && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                            <span className="flex items-center text-white"><Trophy size={12} className="mr-1 text-yellow-500 opacity-70"/> {game.totalScore}</span>
                                        </>
                                    )}
                                </div>
                            </button>
                            <button onClick={(e) => handleDelete(game.id, e)} className="px-4 bg-slate-900 hover:bg-red-900/20 text-slate-500 hover:text-red-500 border-l border-slate-800 transition flex items-center justify-center" title="Delete Round">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};