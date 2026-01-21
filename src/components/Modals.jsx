import React, { useState, useEffect, useRef } from 'react';
// FIX: Add 'Trash2' to icons and 'writeBatch' to firebase imports
import { Users, UserPlus, Shuffle, X, User, HelpCircle, ChevronUp, ChevronDown, History, Calendar, Activity, Contact, Camera, Edit, Trash2, Plus } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { CUSTOM_LOGO_URL, APP_VERSION } from '../utils/constants';

// ... TeeSheetModal code (keep as is) ...
// ... InfoPage code (keep as is) ...

// --- UPDATED HISTORY VIEW WITH DELETE ---
export const HistoryView = ({ userId, onClose, onLoadGame, db, APP_ID, COLLECTION_NAME }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const q = query(collection(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME), where('userId', '==', userId), where('type', '==', 'player'));
                const querySnapshot = await getDocs(q);
                const promises = querySnapshot.docs.map(async (playerDoc) => {
                    const playerData = playerDoc.data();
                    const gameId = playerData.gameId;
                    if (!gameId) return null;
                    const settingsRef = doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, `SETTINGS_${gameId}`);
                    const settingsSnap = await getDoc(settingsRef);
                    if (settingsSnap.exists()) {
                        const settings = settingsSnap.data();
                        return { 
                            id: gameId, 
                            courseName: settings.courseName || `Game ${gameId}`, 
                            date: settings.createdAt, 
                            myScore: playerData.scores, 
                            mode: settings.gameMode || 'stroke' 
                        };
                    }
                    return null;
                });
                const results = await Promise.all(promises);
                setHistory(results.filter(g => g !== null).sort((a, b) => new Date(b.date) - new Date(a.date)));
            } catch (err) { console.error("Error fetching history:", err); } finally { setLoading(false); }
        };
        fetchHistory();
    }, [userId, db, APP_ID, COLLECTION_NAME]);

    const handleDelete = async (gameId, e) => {
        e.stopPropagation(); // Stop the click from loading the game
        if (!confirm("Are you sure you want to permanently delete this round? This cannot be undone.")) return;

        try {
            // Use batch to delete efficiently
            const batch = writeBatch(db);

            // 1. Delete the Game Settings
            const settingsRef = doc(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME, `SETTINGS_${gameId}`);
            batch.delete(settingsRef);

            // 2. Find and delete all players associated with this game
            const q = query(collection(db, 'artifacts', APP_ID, 'public', 'data', COLLECTION_NAME), where('gameId', '==', gameId));
            const playerSnaps = await getDocs(q);
            playerSnaps.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();

            // 3. Remove from local state immediately
            setHistory(prev => prev.filter(g => g.id !== gameId));
        } catch (err) {
            console.error("Error deleting game:", err);
            alert("Could not delete game. Check console.");
        }
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
                        <div key={game.id} className="w-full bg-slate-900 border border-slate-800 rounded-xl flex overflow-hidden group">
                            {/* Main clickable area to load game */}
                            <button 
                                onClick={() => onLoadGame(game.id)} 
                                className="flex-1 p-4 text-left hover:bg-slate-800 transition"
                            >
                                <div>
                                    <div className="font-bold text-white text-lg">{game.courseName}</div>
                                    <div className="text-xs text-slate-500 flex items-center mt-1">
                                        <Calendar size={12} className="mr-1"/> 
                                        {new Date(game.date).toLocaleDateString()}
                                    </div>
                                </div>
                            </button>
                            
                            {/* Delete Button */}
                            <button 
                                onClick={(e) => handleDelete(game.id, e)} 
                                className="px-4 bg-slate-900 hover:bg-red-900/20 text-slate-500 hover:text-red-500 border-l border-slate-800 transition flex items-center justify-center"
                                title="Delete Round"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// ... PlayerPortal code (keep as is) ...