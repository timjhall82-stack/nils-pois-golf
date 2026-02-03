import React, { useState, useEffect, useRef } from 'react';
import { 
    Users, UserPlus, Shuffle, X, User, HelpCircle, ChevronUp, ChevronDown, 
    History, Calendar, Activity, Contact, Camera, Edit, Trash2, Plus, AlertTriangle, 
    Trophy, Flag, Map, Download // Added Download icon
} from 'lucide-react';
import { 
    collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, 
    deleteDoc, writeBatch 
} from 'firebase/firestore';
// FIX: Added PRESET_COURSES to imports
import { CUSTOM_LOGO_URL, APP_VERSION, DEFAULT_PARS, DEFAULT_SI, PRESET_COURSES } from '../utils/constants';

// ... TeeSheetModal (unchanged) ...
export const TeeSheetModal = ({ onClose, players, addGuest, randomize, newGuestName, setNewGuestName, newGuestHcp, setNewGuestHcp, savedPlayers, updatePlayerGroup, teamMode }) => {
    const sortedPlayers = players ? [...players].sort((a,b) => (a.teeGroup || 99) - (b.teeGroup || 99)) : [];
    const isPairs = teamMode === 'pairs';

    return (
        <div className="fixed inset-0 bg-slate-950 z-[80] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                <h3 className="font-bold text-white flex items-center text-lg"><Users size={20} className="mr-2 text-emerald-400" /> Tee Sheet</h3>
                <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {isPairs && (
                    <div className="bg-yellow-500/10 border border-yellow-500/50 p-3 rounded-xl flex items-start gap-3">
                        <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-yellow-500">Pairs Format Active</h4>
                            <p className="text-xs text-slate-400 mt-1">
                                Players <strong>must</strong> be assigned to groups of 2 (e.g. Group 1, Group 2) for Better Ball scoring to calculate correctly.
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center"><UserPlus size={14} className="mr-1"/> Add Guest Player</h4>
                    <div className="flex gap-2">
                        <input className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500 outline-none w-0" placeholder="Name" value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)}/>
                        <input type="number" className="w-16 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500 outline-none" placeholder="HCP" value={newGuestHcp} onChange={(e) => setNewGuestHcp(e.target.value)}/>
                        <button onClick={() => addGuest()} disabled={!newGuestName} className="bg-emerald-600 text-white px-3 rounded-lg font-bold disabled:opacity-50 flex items-center"><Plus size={18}/></button>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-500 uppercase">Groups & Order</h4>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => randomize(2)} 
                                className={`text-[10px] px-2 py-1 rounded border flex items-center transition-colors ${isPairs ? 'bg-yellow-600 border-yellow-500 text-white shadow-lg animate-pulse' : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'}`}
                            >
                                <Shuffle size={10} className="mr-1"/> 2s {isPairs && '(Required)'}
                            </button>
                            <button onClick={() => randomize(3)} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700 hover:text-white flex items-center"><Shuffle size={10} className="mr-1"/> 3s</button>
                            <button onClick={() => randomize(4)} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700 hover:text-white flex items-center"><Shuffle size={10} className="mr-1"/> 4s</button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {sortedPlayers.map(p => (
                            <div key={p.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                                        {p.avatarUrl ? <img src={p.avatarUrl} className="w-full h-full object-cover" alt={p.playerName}/> : <User size={16} className="text-slate-500"/>}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-sm">{p.playerName}</div>
                                        <div className="text-[10px] text-slate-500">HCP {p.handicapIndex} • CH {p.courseHandicap}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase mr-1">Group</span>
                                    <select 
                                        className={`text-white text-xs border rounded p-1 outline-none focus:border-emerald-500 ${isPairs && !p.teeGroup ? 'bg-red-900/30 border-red-500' : 'bg-slate-800 border-slate-600'}`}
                                        value={p.teeGroup || ""}
                                        onChange={(e) => updatePlayerGroup(p.id, parseInt(e.target.value))}
                                    >
                                        <option value="">-</option>
                                        {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ... InfoPage (unchanged) ...
export const InfoPage = ({ onClose }) => {
    const [openSection, setOpenSection] = useState(null);
    const toggle = (sec) => setOpenSection(openSection === sec ? null : sec);

    const FAQItem = ({ title, id, children }) => (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-2">
            <button onClick={() => toggle(id)} className="w-full flex justify-between items-center p-4 text-left font-bold text-slate-200 hover:bg-slate-800/50">
                {title} {openSection === id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            </button>
            {openSection === id && <div className="p-4 pt-0 text-sm text-slate-400 bg-slate-900/50 border-t border-slate-800/50">{children}</div>}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-slate-950 z-[70] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                <h3 className="font-bold text-white flex items-center text-lg"><HelpCircle size={20} className="mr-2 text-blue-400" /> User Guide</h3>
                <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-emerald-900/20 border border-emerald-900/50 p-4 rounded-xl text-center">
                    <img src={CUSTOM_LOGO_URL} className="w-16 h-16 mx-auto mb-2 object-contain" alt="Logo"/>
                    <h2 className="font-bold text-emerald-400 text-lg">Nils Pois Golf Scorer</h2>
                    <p className="text-xs text-emerald-600 font-mono mt-1">{APP_VERSION}</p>
                </div>
                <FAQItem title="Getting Started" id="start"><p className="mb-2">1. <strong>Create Game:</strong> Enter a course name and set up the details. Tap "Setup Game".</p><p className="mb-2">2. <strong>Add Players:</strong> Add yourself (Host) and any friends. Use the Player Portal to save friends for next time.</p><p>3. <strong>Join Game:</strong> Friends can join on their own phones using the 6-letter <strong>Game Code</strong> displayed at the top of the scorecard.</p></FAQItem>
                <FAQItem title="Scoring & Saving" id="scoring"><p className="mb-2">Scores are <strong>saved automatically</strong> to the cloud instantly.</p><p><strong>Sync Status:</strong> Check the icon in the top header. <span className="text-emerald-500">Green Check</span> means data is safe.</p></FAQItem>
                <FAQItem title="Game Modes" id="modes"><ul className="list-disc pl-4 space-y-2"><li><strong>Stroke Play:</strong> Classic Net & Gross scoring.</li><li><strong>Stableford:</strong> Points calculated based on Net Score vs Par.</li><li><strong>Match Play:</strong> Tracks holes Won/Lost vs Par (Net).</li><li><strong>Skins:</strong> Lowest unique Net Score wins the hole.</li></ul></FAQItem>
            </div>
        </div>
    );
};

// ... HistoryView (unchanged) ...
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
                        let totalStrokes = 0;
                        if (playerData.scores) { Object.values(playerData.scores).forEach(s => { if (s && s !== 'NR') totalStrokes += parseInt(s); }); }
                        return { id: gameId, gameTitle: settings.gameTitle || settings.courseName || `Game ${gameId}`, courseName: settings.courseName, date: settings.createdAt, totalScore: totalStrokes, mode: settings.gameMode || 'stroke' };
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
        } catch (err) { console.error("Error deleting game:", err); alert("Could not delete game. Check console."); }
    };

    const formatMode = (mode) => { if (!mode) return 'Stroke'; return mode.charAt(0).toUpperCase() + mode.slice(1); };

    return (
        <div className="fixed inset-0 bg-slate-950 z-[60] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                <h3 className="font-bold text-white flex items-center text-lg"><History size={20} className="mr-2 text-purple-400" /> Game History</h3>
                <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? <div className="flex justify-center pt-10 text-slate-500"><Activity className="animate-spin" /></div> : history.length === 0 ? <div className="text-center text-slate-500 py-10">No games played yet.</div> : history.map(game => (
                        <div key={game.id} className="w-full bg-slate-900 border border-slate-800 rounded-xl flex overflow-hidden group shadow-sm">
                            <button onClick={() => onLoadGame(game.id)} className="flex-1 p-4 text-left hover:bg-slate-800 transition">
                                <div className="flex justify-between items-start mb-2"><div><div className="font-bold text-white text-lg leading-tight">{game.gameTitle}</div>{game.courseName && game.courseName !== game.gameTitle && (<div className="text-xs text-slate-500 font-bold mt-0.5 uppercase tracking-wide">{game.courseName}</div>)}</div><div className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800 uppercase tracking-widest">{game.id}</div></div>
                                <div className="flex items-center gap-3 text-xs text-slate-400"><span className="flex items-center"><Calendar size={12} className="mr-1 opacity-70"/> {new Date(game.date).toLocaleDateString()}</span><span className="w-1 h-1 rounded-full bg-slate-700"></span><span className="flex items-center text-emerald-400 font-bold"><Flag size={12} className="mr-1 opacity-70"/> {formatMode(game.mode)}</span>{game.totalScore > 0 && (<><span className="w-1 h-1 rounded-full bg-slate-700"></span><span className="flex items-center text-white"><Trophy size={12} className="mr-1 text-yellow-500 opacity-70"/> {game.totalScore}</span></>)}</div>
                            </button>
                            <button onClick={(e) => handleDelete(game.id, e)} className="px-4 bg-slate-900 hover:bg-red-900/20 text-slate-500 hover:text-red-500 border-l border-slate-800 transition flex items-center justify-center" title="Delete Round"><Trash2 size={18} /></button>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

// --- COURSE MANAGER ---
export const CourseManagerModal = ({ onClose, userId, savedCourses, db, APP_ID }) => {
    const [cName, setCName] = useState('');
    const [cSlope, setCSlope] = useState('');
    const [cRating, setCRating] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!cName.trim() || !cSlope || !cRating) return;
        setSubmitting(true);
        try {
            const courseData = { 
                name: cName, 
                slope: parseInt(cSlope), 
                rating: parseFloat(cRating), 
                pars: DEFAULT_PARS,
                si: DEFAULT_SI,
                createdAt: new Date().toISOString() 
            };
            const coursesRef = collection(db, 'artifacts', APP_ID, 'users', userId, 'saved_courses');
            await addDoc(coursesRef, courseData);
            setCName(''); setCSlope(''); setCRating('');
        } catch (err) { alert("Error saving course: " + err.message); } finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (confirm("Delete this custom course?")) { 
            try { await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', userId, 'saved_courses', id)); } 
            catch (err) { alert("Error: " + err.message); } 
        }
    };

    // NEW: Function to batch import all hardcoded presets
    const handleImportPresets = async () => {
        if(!confirm("Import all default courses? This might create duplicates if you run it twice.")) return;
        setSubmitting(true);
        try {
            const batch = writeBatch(db);
            const collectionRef = collection(db, 'artifacts', APP_ID, 'users', userId, 'saved_courses');
            
            Object.values(PRESET_COURSES).forEach(course => {
                 // Create a new doc reference for each course
                 const newRef = doc(collectionRef);
                 batch.set(newRef, {
                     ...course,
                     createdAt: new Date().toISOString()
                 });
            });
            
            await batch.commit();
            alert("Success! All courses imported.");
        } catch(e) { 
            console.error(e); 
            alert("Error importing: " + e.message); 
        } finally { 
            setSubmitting(false); 
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[70] flex flex-col p-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center"><Map className="mr-2 text-orange-500" /> Course Manager</h2>
                <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-6">
                
                {/* IMPORT BUTTON */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div className="text-xs text-slate-400">Load defaults into database?</div>
                    <button 
                        onClick={handleImportPresets} 
                        disabled={submitting}
                        className="bg-slate-800 hover:bg-slate-700 text-xs text-white px-3 py-2 rounded-lg border border-slate-700 flex items-center transition-colors"
                    >
                        <Download size={14} className="mr-1"/> Import Defaults
                    </button>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Add Custom Course</h3>
                    <div className="space-y-2">
                        <input className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-orange-500 outline-none" placeholder="Course Name" value={cName} onChange={(e) => setCName(e.target.value)} />
                        <div className="flex gap-2">
                            <input type="number" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-orange-500 outline-none" placeholder="Slope" value={cSlope} onChange={(e) => setCSlope(e.target.value)} />
                            <input type="number" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-orange-500 outline-none" placeholder="Rating" value={cRating} onChange={(e) => setCRating(e.target.value)} />
                        </div>
                        <button onClick={handleSubmit} disabled={!cName || submitting} className="w-full bg-orange-600 text-white p-2 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center">
                            {submitting ? <Activity className="animate-spin" size={16}/> : 'Save Course'}
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase ml-1">My Courses</h3>
                    {savedCourses.length === 0 ? <div className="text-center text-slate-600 py-8 text-sm">No custom courses saved.</div> : savedCourses.map(c => (
                        <div key={c.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
                            <div>
                                <div className="font-bold text-white">{c.name}</div>
                                <div className="text-xs text-slate-500">Slope: {c.slope} • Rating: {c.rating}</div>
                            </div>
                            <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-600 hover:text-red-500 transition"><Trash2 size={16}/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ... PlayerPortal (unchanged) ...
export const PlayerPortal = ({ onClose, userId, savedPlayers, db, APP_ID }) => {
    const [name, setName] = useState('');
    const [hcp, setHcp] = useState('');
    const [imgUrl, setImgUrl] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const maxSize = 150;
                let width = img.width;
                let height = img.height;
                if (width > height) { if (width > maxSize) { height *= maxSize / width; width = maxSize; } } else { if (height > maxSize) { width *= maxSize / height; height = maxSize; } }
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                setImgUrl(dataUrl);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setSubmitting(true);
        try {
            const playerData = { name: name, handicap: hcp || 0, avatarUrl: imgUrl, createdAt: new Date().toISOString() };
            if (editingId) {
                const playerRef = doc(db, 'artifacts', APP_ID, 'users', userId, 'saved_players', editingId);
                await updateDoc(playerRef, { name: name, handicap: hcp || 0, avatarUrl: imgUrl });
                setEditingId(null);
            } else {
                const playersRef = collection(db, 'artifacts', APP_ID, 'users', userId, 'saved_players');
                await addDoc(playersRef, playerData);
            }
            setName(''); setHcp(''); setImgUrl('');
        } catch (err) { alert("Error saving player: " + err.message); } finally { setSubmitting(false); }
    };

    const handleEdit = (player) => { setName(player.name); setHcp(player.handicap); setImgUrl(player.avatarUrl || ''); setEditingId(player.id); };
    const handleCancelEdit = () => { setName(''); setHcp(''); setImgUrl(''); setEditingId(null); };
    const handleDelete = async (id) => { if (confirm("Remove player from portal?")) { try { await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', userId, 'saved_players', id)); } catch (err) { alert("Error deleting: " + err.message); } } };

    return (
        <div className="fixed inset-0 bg-black/90 z-[70] flex flex-col p-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-white flex items-center"><Contact className="mr-2 text-blue-500" /> Player Portal</h2><button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={20} /></button></div>
            <div className="flex-1 overflow-y-auto space-y-6">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-3"><h3 className="text-xs font-bold text-slate-500 uppercase">{editingId ? 'Edit Player' : 'Add New Player'}</h3>{editingId && (<button onClick={handleCancelEdit} className="text-[10px] text-red-400 hover:underline">Cancel</button>)}</div>
                    <div className="flex gap-3 items-start">
                        <div className="relative group"><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} /><button onClick={() => fileInputRef.current.click()} className="w-14 h-14 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center hover:border-blue-500 transition overflow-hidden">{imgUrl ? (<img src={imgUrl} alt="Preview" className="w-full h-full object-cover" />) : (<Camera size={20} className="text-slate-500 group-hover:text-blue-400" />)}</button>{imgUrl && (<button onClick={() => setImgUrl('')} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"><X size={10}/></button>)}</div>
                        <div className="flex-1 space-y-2">
                            <div className="flex gap-2"><input className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none w-0" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} /><input type="number" className="w-16 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none" placeholder="HCP" value={hcp} onChange={(e) => setHcp(e.target.value)} /></div>
                            <button type="button" onClick={handleSubmit} disabled={!name.trim() || submitting} className={`w-full text-white p-2 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center ${editingId ? 'bg-yellow-600' : 'bg-blue-600'}`}>{submitting ? <Activity className="animate-spin" size={16}/> : (editingId ? 'Update Player' : 'Save Player')}</button>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase ml-1">Saved Players</h3>
                    {savedPlayers.length === 0 ? <div className="text-center text-slate-600 py-8 text-sm">No players saved yet.</div> : savedPlayers.map(p => (
                            <div key={p.id} className={`bg-slate-900 border p-3 rounded-xl flex justify-between items-center ${editingId === p.id ? 'border-yellow-600/50 bg-yellow-900/10' : 'border-slate-800'}`}>
                                <div className="flex items-center gap-3 overflow-hidden flex-1">{p.avatarUrl ? (<img src={p.avatarUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover bg-slate-800 border border-slate-700 flex-shrink-0" />) : (<div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center text-slate-600"><User size={18}/></div>)}<div className="truncate pr-2"><div className="font-bold text-white truncate">{p.name}</div><div className="text-xs text-slate-500">HCP: {p.handicap}</div></div></div>
                                <div className="flex gap-1 flex-shrink-0"><button onClick={() => handleEdit(p)} className="p-2 text-slate-400 hover:text-yellow-500 transition flex-shrink-0"><Edit size={16} /></button><button onClick={() => handleDelete(p.id)} className="p-2 text-slate-600 hover:text-red-500 transition flex-shrink-0"><Trash2 size={16} /></button></div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};