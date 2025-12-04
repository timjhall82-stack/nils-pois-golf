import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  setDoc, 
  doc, 
  getDoc,
  writeBatch,
  addDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { 
  Trophy, 
  Plus, 
  Minus, 
  Flag, 
  ChevronRight, 
  ChevronLeft,
  Share2,
  Activity,
  LogOut,
  Search,
  Settings,
  MapPin,
  Save,
  BookOpen,
  X,
  Target,
  Swords, 
  Gem,     
  Users,
  UserPlus,
  Shuffle,
  Globe, 
  DownloadCloud,
  Contact, 
  Trash2,
  CheckSquare,
  Square,
  User,
  UserCheck,
  Eye,
  EyeOff,
  AlertCircle,
  History,
  Calendar,
  Check,    
  Loader2,  
  CloudOff, 
  FlagTriangleRight,
  Ban,
  LogIn,
  Edit,
  Camera // For Image Upload
} from 'lucide-react';

// --- CONFIGURATION & IMAGES ---
const APP_VERSION = "v4";

// 1. CUSTOM LOGO: Points to /public/Logo.png
const CUSTOM_LOGO_URL = "/Logo.png"; 

// 2. CUSTOM BACKGROUND: Dark Masters Green Texture
const BACKGROUND_IMAGE = "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2070&auto=format&fit=crop";

// --- Firebase Initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyCllkJmbTVFmCIzkyIHXIO24FKlJ9i4VQg",
  authDomain: "nilspoisgolf.firebaseapp.com",
  projectId: "nilspoisgolf",
  storageBucket: "nilspoisgolf.firebasestorage.app",
  messagingSenderId: "606422939116",
  appId: "1:606422939116:web:d2a51bd4a1d5606c787cc9",
  measurementId: "G-VZ8X10ZEC4"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'nils-pois-live-v4';

// --- Constants ---
const COLLECTION_NAME = 'golf_scores';
const DEFAULT_PARS = [4, 4, 3, 4, 4, 5, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 5, 4];
const DEFAULT_SI = [1, 3, 5, 7, 9, 11, 13, 15, 17, 2, 4, 6, 8, 10, 12, 14, 16, 18]; 

const PRESET_COURSES = {
  'olton_white': {
    name: "Olton GC (White)",
    slope: 135,
    rating: 71.5,
    pars: [4, 4, 4, 4, 3, 4, 4, 3, 4, 4, 5, 4, 3, 4, 3, 4, 4, 5], 
    si:   [5, 3, 17, 11, 7, 9, 1, 15, 13, 4, 10, 16, 18, 2, 12, 6, 14, 8]
  },
  'olton_yellow': {
    name: "Olton GC (Yellow)",
    slope: 132,
    rating: 70.0,
    pars: [4, 4, 4, 4, 3, 4, 4, 3, 4, 4, 5, 4, 3, 4, 3, 4, 4, 5], 
    si:   [5, 3, 17, 11, 7, 9, 1, 15, 13, 4, 10, 16, 18, 2, 12, 6, 14, 8]
  },
  'olton_red': {
    name: "Olton GC (Red)",
    slope: 136,
    rating: 73.7,
    pars: [5, 4, 4, 4, 3, 4, 5, 3, 4, 4, 5, 4, 3, 5, 3, 4, 4, 5], 
    si:   [11, 3, 13, 1, 15, 9, 5, 17, 7, 4, 14, 12, 18, 6, 8, 2, 16, 10]
  }
};

// --- Helper Functions ---
const calculateNetScore = (gross, holeIdx, ch, siList) => {
    if (gross === 'NR' || !gross) return 'NR';
    const holeSi = siList[holeIdx];
    let strokesReceived = 0;
    if (ch >= holeSi) strokesReceived = 1;
    if (ch >= holeSi + 18) strokesReceived = 2; 
    if (ch < 0 && Math.abs(ch) >= (19 - holeSi)) strokesReceived = -1;
    return gross - strokesReceived;
};

const calculateCourseHandicap = (index, slopeVal, ratingVal, parVal) => {
    if (!index || index === '') return 0;
    const idx = parseFloat(index);
    const slp = parseFloat(slopeVal) || 113;
    const rtg = parseFloat(ratingVal) || 72;
    const pr = parseInt(parVal) || 72;
    return Math.round(idx * (slp / 113) + (rtg - pr));
};

const getShotsOnHole = (playingHandicap, holeSi) => {
    let shots = 0;
    if (playingHandicap >= holeSi) shots = 1;
    if (playingHandicap >= holeSi + 18) shots = 2;
    if (playingHandicap >= holeSi + 36) shots = 3;
    if (playingHandicap < 0 && Math.abs(playingHandicap) >= (19 - holeSi)) shots = -1;
    return shots;
};

// --- Components ---

const SyncStatus = ({ status }) => {
    if (status === 'saving') return <div className="flex items-center text-yellow-500 text-[10px] font-medium bg-slate-800 px-2 py-1 rounded-full border border-slate-700"><Loader2 size={12} className="animate-spin mr-1" /> Saving...</div>;
    if (status === 'error') return <div className="flex items-center text-red-500 text-[10px] font-medium bg-slate-800 px-2 py-1 rounded-full border border-red-900/50"><CloudOff size={12} className="mr-1" /> Offline</div>;
    return <div className="flex items-center text-slate-500 text-[10px] font-medium bg-slate-800 px-2 py-1 rounded-full border border-slate-700 transition-all duration-500"><Check size={12} className="mr-1 text-emerald-500" /> Saved</div>;
};

const HistoryView = ({ userId, onClose, onLoadGame }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const q = query(collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME), where('userId', '==', userId), where('type', '==', 'player'));
                const querySnapshot = await getDocs(q);
                const promises = querySnapshot.docs.map(async (playerDoc) => {
                    const playerData = playerDoc.data();
                    const gameId = playerData.gameId;
                    if (!gameId) return null;
                    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, `SETTINGS_${gameId}`);
                    const settingsSnap = await getDoc(settingsRef);
                    if (settingsSnap.exists()) {
                        const settings = settingsSnap.data();
                        return { id: gameId, courseName: settings.courseName, date: settings.createdAt, myScore: playerData.scores, mode: settings.gameMode || 'stroke' };
                    }
                    return null;
                });
                const results = await Promise.all(promises);
                setHistory(results.filter(g => g !== null).sort((a, b) => new Date(b.date) - new Date(a.date)));
            } catch (err) { console.error("Error fetching history:", err); } finally { setLoading(false); }
        };
        fetchHistory();
    }, [userId]);

    return (
        <div className="fixed inset-0 bg-slate-950 z-[60] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                <h3 className="font-bold text-white flex items-center text-lg"><History size={20} className="mr-2 text-purple-400" /> Game History</h3>
                <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? <div className="flex justify-center pt-10 text-slate-500"><Activity className="animate-spin" /></div> : history.length === 0 ? <div className="text-center text-slate-500 py-10">No games played yet.</div> : history.map(game => (
                        <button key={game.id} onClick={() => onLoadGame(game.id)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center hover:bg-slate-800 transition text-left group">
                            <div><div className="font-bold text-white text-lg">{game.courseName}</div><div className="text-xs text-slate-500 flex items-center mt-1"><Calendar size={12} className="mr-1"/> {new Date(game.date).toLocaleDateString()}</div></div>
                            <div className="text-right"><span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded border border-slate-700 uppercase font-bold group-hover:border-slate-500">View</span></div>
                        </button>
                    ))
                }
            </div>
        </div>
    );
};

const PlayerPortal = ({ onClose, userId, savedPlayers }) => {
    const [name, setName] = useState('');
    const [hcp, setHcp] = useState('');
    const [imgUrl, setImgUrl] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    // --- Handle Image Upload (Resize & Compress) ---
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
                
                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }
                
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
            const playerData = { 
                name: name, 
                handicap: hcp || 0, 
                avatarUrl: imgUrl, 
                createdAt: new Date().toISOString() 
            };

            if (editingId) {
                const playerRef = doc(db, 'artifacts', appId, 'users', userId, 'saved_players', editingId);
                await updateDoc(playerRef, { name: name, handicap: hcp || 0, avatarUrl: imgUrl });
                setEditingId(null);
            } else {
                const playersRef = collection(db, 'artifacts', appId, 'users', userId, 'saved_players');
                await addDoc(playersRef, playerData);
            }
            setName(''); setHcp(''); setImgUrl('');
        } catch (err) { alert("Error saving player: " + err.message); } finally { setSubmitting(false); }
    };

    const handleEdit = (player) => { 
        setName(player.name); 
        setHcp(player.handicap); 
        setImgUrl(player.avatarUrl || ''); 
        setEditingId(player.id); 
    };
    
    const handleCancelEdit = () => { setName(''); setHcp(''); setImgUrl(''); setEditingId(null); };

    const handleDelete = async (id) => {
        if (confirm("Remove player from portal?")) { try { await deleteDoc(doc(db, 'artifacts', appId, 'users', userId, 'saved_players', id)); } catch (err) { alert("Error deleting: " + err.message); } }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[70] flex flex-col p-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center"><Contact className="mr-2 text-blue-500" /> Player Portal</h2>
                <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-6">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase">{editingId ? 'Edit Player' : 'Add New Player'}</h3>
                        {editingId && (<button onClick={handleCancelEdit} className="text-[10px] text-red-400 hover:underline">Cancel</button>)}
                    </div>
                    
                    <div className="flex gap-3 items-start">
                        <div className="relative group">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                            />
                            <button 
                                onClick={() => fileInputRef.current.click()}
                                className="w-14 h-14 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center hover:border-blue-500 transition overflow-hidden"
                            >
                                {imgUrl ? (
                                    <img src={imgUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera size={20} className="text-slate-500 group-hover:text-blue-400" />
                                )}
                            </button>
                            {imgUrl && (
                                <button 
                                    onClick={() => setImgUrl('')} 
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                                >
                                    <X size={10}/>
                                </button>
                            )}
                        </div>

                        <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                                <input className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none w-0" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                                <input type="number" className="w-16 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-blue-500 outline-none" placeholder="HCP" value={hcp} onChange={(e) => setHcp(e.target.value)} />
                            </div>
                            <button type="button" onClick={handleSubmit} disabled={!name.trim() || submitting} className={`w-full text-white p-2 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center ${editingId ? 'bg-yellow-600' : 'bg-blue-600'}`}>{submitting ? <Activity className="animate-spin" size={16}/> : (editingId ? 'Update Player' : 'Save Player')}</button>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase ml-1">Saved Players</h3>
                    {savedPlayers.length === 0 ? <div className="text-center text-slate-600 py-8 text-sm">No players saved yet.</div> : savedPlayers.map(p => (
                            <div key={p.id} className={`bg-slate-900 border p-3 rounded-xl flex justify-between items-center ${editingId === p.id ? 'border-yellow-600/50 bg-yellow-900/10' : 'border-slate-800'}`}>
                                <div className="flex items-center gap-3 overflow-hidden flex-1">
                                    {p.avatarUrl ? (
                                        <img src={p.avatarUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover bg-slate-800 border border-slate-700 flex-shrink-0" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center text-slate-600"><User size={18}/></div>
                                    )}
                                    <div className="truncate pr-2">
                                        <div className="font-bold text-white truncate">{p.name}</div>
                                        <div className="text-xs text-slate-500">HCP: {p.handicap}</div>
                                    </div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    <button onClick={() => handleEdit(p)} className="p-2 text-slate-400 hover:text-yellow-500 transition flex-shrink-0"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-600 hover:text-red-500 transition flex-shrink-0"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

const LobbyView = ({ playerName, setPlayerName, joinCodeInput, setJoinCodeInput, handleJoinGame, courseName, setCourseName, startSetup, error, setShowPortal, setShowHistory, user, handleLogin, handleLogout }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-950 text-white space-y-6">
    <div className="text-center mb-4">
      <div className="mb-2 relative z-10">
          <img 
            src={CUSTOM_LOGO_URL} 
            alt="Logo" 
            className="w-48 h-48 mx-auto object-contain drop-shadow-2xl filter brightness-110" 
          />
      </div>
      <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-lg">Nils Pois Golf</h1>
      <p className="text-emerald-400 text-xs font-bold tracking-widest uppercase">&copy; 2025 Timah</p>
    </div>
    
    <div className="w-full max-w-sm bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-3 flex justify-between items-center shadow-2xl">
        <div className="flex items-center"><div className="bg-slate-800 p-2 rounded-full text-slate-400 mr-3"><User size={16} /></div><div><div className="text-xs font-bold text-slate-300">{user?.isAnonymous ? 'Guest User' : (user?.displayName || user?.email || 'Golfer')}</div><div className="text-[10px] text-slate-500">{user?.isAnonymous ? 'Data not saved' : (user?.email || 'Account Synced')}</div></div></div>
        {user?.isAnonymous ? <button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center transition-colors shadow-lg shadow-blue-600/20"><LogIn size={12} className="mr-1" /> Login</button> : <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 text-xs font-bold py-2 px-2 transition-colors">Sign Out</button>}
    </div>
    {error && <div className="w-full max-w-sm p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm text-center animate-in fade-in slide-in-from-top-2 flex items-center justify-center"><AlertCircle size={16} className="mr-2"/>{error}</div>}
    
    <div className="w-full max-w-sm bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/10 space-y-4">
      <div className="flex justify-between items-center"><h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Start New Round</h2></div>
      <div><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Course / Game Name</label><input type="text" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 focus:outline-none focus:border-emerald-500 transition-colors text-white" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="e.g. Sunday Medal" /></div>
      <button type="button" onClick={startSetup} disabled={!courseName.trim()} className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-bold text-white shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100">Setup Game</button>
    </div>
    
    <div className="w-full max-w-sm grid grid-cols-2 gap-3">
        <button onClick={() => setShowPortal(true)} className="bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-sm border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center group transition-all shadow-lg"><div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 mb-2 group-hover:bg-blue-500 group-hover:text-white transition-colors"><Contact size={20} /></div><div className="font-bold text-xs text-slate-300">Player Portal</div></button>
        <button onClick={() => setShowHistory(true)} className="bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-sm border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center group transition-all shadow-lg"><div className="bg-purple-500/20 p-2 rounded-lg text-purple-400 mb-2 group-hover:bg-purple-500 group-hover:text-white transition-colors"><History size={20} /></div><div className="font-bold text-xs text-slate-300">Game History</div></button>
    </div>
    
    <div className="w-full max-w-sm relative py-2"><div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-white/10"></div></div><div className="relative flex justify-center"><span className="bg-black/40 backdrop-blur px-2 text-xs text-slate-400 uppercase tracking-widest rounded">Or Join Existing</span></div></div>
    
    <div className="w-full max-w-sm bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-4 shadow-2xl">
        <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Your Name</label><input type="text" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white" value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Guest Name" /></div>
            <div><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Game Code</label><input type="text" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-center font-mono uppercase tracking-widest focus:outline-none focus:border-blue-500 transition-colors text-white" value={joinCodeInput} onChange={(e) => setJoinCodeInput(e.target.value)} maxLength={6} placeholder="CODE" /></div>
        </div>
        <button type="button" onClick={handleJoinGame} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-600/20 transition-all active:scale-95">Join Game</button>
    </div>
    <div className="mt-4 text-slate-400 text-[10px] font-mono opacity-60 bg-black/40 px-2 py-1 rounded backdrop-blur">Version {APP_VERSION}</div>
  </div>
);

const CourseBrowser = ({ onClose, onSelectCourse }) => {
    const [step, setStep] = useState('clubs'); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState([]);
    const [selectedClub, setSelectedClub] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const res = await fetch('https://api.bthree.uk/golf/v1/clubs');
                if (!res.ok) throw new Error("API Error");
                const data = await res.json();
                setItems(data || []);
            } catch (e) { console.error(e); setItems([]); } finally { setLoading(false); }
        };
        fetchClubs();
    }, []);

    const handleClubSelect = async (club) => {
        setLoading(true);
        setSelectedClub(club);
        try {
            const res = await fetch(`https://api.bthree.uk/golf/v1/clubs/${club.id}/courses`);
            const data = await res.json();
            setItems(data || []);
            setStep('courses');
            setSearchTerm('');
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleCourseSelect = async (course) => {
        setLoading(true);
        setSelectedCourse(course);
        try {
            const res = await fetch(`https://api.bthree.uk/golf/v1/courses/${course.id}/markers`);
            const data = await res.json();
            setItems(data || []);
            setStep('tees');
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleTeeSelect = async (tee) => {
        setLoading(true);
        try {
            const res = await fetch(`https://api.bthree.uk/golf/v1/markers/${tee.id}/holes`);
            const holes = await res.json();
            const pars = new Array(18).fill(4);
            const si = new Array(18).fill(18);
            if (Array.isArray(holes)) {
                holes.forEach(h => {
                    const idx = h.number - 1;
                    if (idx >= 0 && idx < 18) {
                        pars[idx] = h.par || 4;
                        si[idx] = h.stroke_index || (idx + 1);
                    }
                });
            }
            onSelectCourse({ name: `${selectedClub.name} - ${tee.colour}`, pars, si, slope: 113, rating: 72 });
            onClose();
        } catch (e) { alert("Could not load data."); } finally { setLoading(false); }
    };

    const filteredItems = items.filter(i => {
        const name = i.name || i.colour || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="fixed inset-0 bg-slate-950 z-[60] flex flex-col animate-in fade-in duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                <h3 className="font-bold text-white flex items-center">
                    <Globe size={18} className="mr-2 text-blue-400" />
                    {step === 'clubs' && "Select Club"}
                    {step === 'courses' && selectedClub?.name}
                    {step === 'tees' && selectedCourse?.name}
                </h3>
                <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-2 bg-slate-900 border-b border-slate-800">
                <div className="flex bg-slate-800 rounded-lg p-2 items-center">
                    <Search size={16} className="text-slate-500 mr-2" />
                    <input className="bg-transparent flex-1 text-sm text-white outline-none placeholder:text-slate-600" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} autoFocus />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loading ? <div className="flex justify-center pt-10 text-slate-500"><DownloadCloud className="animate-bounce" /></div> : filteredItems.map(item => (
                        <button key={item.id} onClick={() => {
                                if (step === 'clubs') handleClubSelect(item);
                                if (step === 'courses') handleCourseSelect(item);
                                if (step === 'tees') handleTeeSelect(item);
                            }} className="w-full text-left p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-slate-700 transition flex justify-between items-center group">
                            <span className="font-medium text-slate-200">{item.name || item.colour}</span>
                            <ChevronRight size={16} className="text-slate-600 group-hover:text-blue-400" />
                        </button>
                    ))
                }
            </div>
        </div>
    );
};

const SetupView = ({ courseName, setCourseName, slope, setSlope, rating, setRating, pars, setPars, gameMode, setGameMode, setSi, playerName, setPlayerName, handicapIndex, setHandicapIndex, performGoogleSearch, createGame, onCancel, savedPlayers, error }) => {
  const [showBrowser, setShowBrowser] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState(new Set());
  const [adhocName, setAdhocName] = useState('');
  const [adhocHcp, setAdhocHcp] = useState('');
  const [adhocGuests, setAdhocGuests] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [hostAvatar, setHostAvatar] = useState('');

  const handlePresetChange = (e) => {
    const key = e.target.value;
    if (key && PRESET_COURSES[key]) {
      const c = PRESET_COURSES[key];
      setCourseName(c.name); setSlope(c.slope); setRating(c.rating); setPars(c.pars); if (c.si) setSi(c.si);
    }
  };
  const toggleFriend = (id) => { const newSet = new Set(selectedFriends); if (newSet.has(id)) newSet.delete(id); else newSet.add(id); setSelectedFriends(newSet); };
  const addAdhoc = (e) => { e.preventDefault(); if (!adhocName.trim()) return; const newGuest = { id: `temp_${Date.now()}`, name: adhocName, handicap: adhocHcp || 0 }; setAdhocGuests(prev => [...prev, newGuest]); setAdhocName(''); setAdhocHcp(''); };
  const removeAdhoc = (id) => { setAdhocGuests(prev => prev.filter(g => g.id !== id)); };
  const handleStartGame = async () => {
      setIsCreating(true);
      try { const portalFriends = savedPlayers.filter(p => selectedFriends.has(p.id)); const fullRoster = [...portalFriends, ...adhocGuests]; await createGame(fullRoster, hostAvatar); } catch(e) { alert("Error creating game: " + e.message); setIsCreating(false); }
  };
  const ModeButton = ({ mode, icon: Icon, label }) => (<button onClick={() => setGameMode(mode)} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${gameMode === mode ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'}`}><Icon size={20} className="mb-1" /><span className="text-[10px] font-bold uppercase">{label}</span></button>);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 flex flex-col items-center">
        {showBrowser && <CourseBrowser onClose={() => setShowBrowser(false)} onSelectCourse={(data) => { setCourseName(data.name); setPars(data.pars); setSi(data.si); setSlope(data.slope); setRating(data.rating); }} />}
        <h2 className="text-xl font-bold mb-4 flex items-center"><Settings size={20} className="mr-2"/> Game Setup</h2>
        {error && <div className="w-full max-w-md p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm text-center mb-4 flex items-center justify-center animate-in fade-in"><AlertCircle size={16} className="mr-2"/>{error}</div>}
        <div className="w-full max-w-md bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-6">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-emerald-400 uppercase flex items-center"><User size={12} className="mr-1"/> Host Player (You)</label>
                    {savedPlayers && savedPlayers.length > 0 && (
                        <select className="bg-slate-800 text-xs text-blue-400 border border-slate-700 rounded px-2 py-1 outline-none max-w-[120px]" onChange={(e) => { const p = savedPlayers.find(sp => sp.id === e.target.value); if(p) { setPlayerName(p.name); setHandicapIndex(p.handicap); setHostAvatar(p.avatarUrl || ''); } }} value=""><option value="" disabled>Load Profile...</option>{savedPlayers.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select>
                    )}
                </div>
                <div className="flex gap-3">
                     {hostAvatar && <img src={hostAvatar} className="w-10 h-10 rounded-full object-cover border border-slate-500 flex-shrink-0" alt="Host" />}
                     <input className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500 w-0" placeholder="Your Name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
                     <input type="number" className="w-20 bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="HCP" value={handicapIndex} onChange={(e) => setHandicapIndex(e.target.value)} />
                </div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-4">
                <label className="text-xs font-bold text-emerald-400 uppercase flex items-center"><Users size={12} className="mr-1"/> Add Players</label>
                <div className="flex gap-2 items-center">
                    <input className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500 w-0" placeholder="Guest Name" value={adhocName} onChange={(e) => setAdhocName(e.target.value)} />
                    <input type="number" className="w-16 bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="HCP" value={adhocHcp} onChange={(e) => setAdhocHcp(e.target.value)} />
                    <button type="button" onClick={addAdhoc} disabled={!adhocName.trim()} className="bg-emerald-600 text-white px-3 rounded-lg font-bold disabled:opacity-50 active:scale-95 transition-transform h-10 flex items-center justify-center flex-shrink-0"><Plus size={16} /></button>
                </div>
                {savedPlayers && savedPlayers.length > 0 && (
                    <div className="space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">From Portal</div>
                        <div className="max-h-32 overflow-y-auto pr-1">
                            {savedPlayers.map(p => (
                                <button type="button" key={p.id} onClick={() => toggleFriend(p.id)} className={`w-full flex items-center justify-between p-2 rounded-lg border text-xs mb-1 transition-all ${selectedFriends.has(p.id) ? 'bg-emerald-600/20 border-emerald-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        {p.avatarUrl && <img src={p.avatarUrl} className="w-6 h-6 rounded-full object-cover" />}
                                        <span className="truncate">{p.name}</span>
                                    </div>
                                    <div className="flex-shrink-0">{selectedFriends.has(p.id) ? <CheckSquare size={14} className="text-emerald-500"/> : <Square size={14} />}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {(playerName || selectedFriends.size > 0 || adhocGuests.length > 0) && (
                    <div className="bg-slate-900 rounded-lg p-2 border border-slate-800">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Who's Playing?</div>
                        <div className="flex flex-wrap gap-2">
                            {playerName && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30 flex items-center gap-1">{hostAvatar && <img src={hostAvatar} className="w-4 h-4 rounded-full"/>} {playerName} <UserCheck size={10} className="ml-1"/></span>}
                            {savedPlayers.filter(p => selectedFriends.has(p.id)).map(p => <span key={p.id} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700 flex items-center gap-1">{p.avatarUrl && <img src={p.avatarUrl} className="w-4 h-4 rounded-full"/>}{p.name}</span>)}
                            {adhocGuests.map(g => <span key={g.id} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30 flex items-center group">{g.name} <button type="button" onClick={() => removeAdhoc(g.id)} className="ml-1 hover:text-white"><X size={10}/></button></span>)}
                        </div>
                    </div>
                )}
            </div>
            <div className="space-y-4">
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 space-y-3"><label className="text-xs font-bold text-slate-500 uppercase flex items-center"><BookOpen size={12} className="mr-1"/> Course</label><div className="flex gap-2"><input className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500 w-0" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="Course Name" /><button type="button" onClick={() => setShowBrowser(true)} className="px-3 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors flex-shrink-0"><Globe size={18} /></button></div><select className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-slate-400 focus:outline-none focus:border-emerald-500" onChange={handlePresetChange} defaultValue=""><option value="" disabled>Or select preset...</option><option value="olton_white">Olton GC - White (Men)</option><option value="olton_yellow">Olton GC - Yellow (Men)</option><option value="olton_red">Olton GC - Red (Ladies)</option></select></div>
                <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-slate-500 uppercase">Slope</label><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 focus:border-emerald-500 outline-none transition-colors" value={slope} onChange={(e) => setSlope(e.target.value)} /></div><div><label className="text-xs font-bold text-slate-500 uppercase">Rating</label><input type="number" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 focus:border-emerald-500 outline-none transition-colors" value={rating} onChange={(e) => setRating(e.target.value)} /></div></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Game Mode</label><div className="grid grid-cols-2 gap-2"><ModeButton mode="stroke" icon={Target} label="Stroke Play" /><ModeButton mode="stableford" icon={Activity} label="Stableford" /><ModeButton mode="match" icon={Swords} label="Match Play" /><ModeButton mode="skins" icon={Gem} label="Skins" /></div></div>
            </div>
            <button type="button" onClick={handleStartGame} disabled={isCreating} className="w-full bg-emerald-600 py-4 rounded-xl font-bold mt-2 flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-emerald-900/50 disabled:opacity-50">{isCreating ? <Activity className="animate-spin" /> : <><Save size={18}/> Start Game</>}</button>
            <button type="button" onClick={onCancel} className="w-full py-2 text-slate-500 text-sm hover:text-white">Cancel</button>
        </div>
    </div>
  );
};

const ScoreView = ({
  currentHole, setCurrentHole, currentHoleScore, updateScore,
  activePars, myData, activeGameMode, activeSi, players, user,
  syncStatus, leaveGame
}) => {
  const holePar = activePars[currentHole - 1];
  const holeSi = activeSi ? activeSi[currentHole - 1] : (currentHole);
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const myGroup = myData.teeGroup;
  const relevantPlayers = useMemo(() => {
      if (showAllPlayers) return players;
      if (myGroup) { const groupMembers = players.filter(p => p.teeGroup === myGroup); if (!groupMembers.find(p => p.userId === user.uid)) return [myData, ...groupMembers]; return groupMembers; }
      return players;
  }, [players, myGroup, showAllPlayers, user, myData]);

  return (
      <div className="flex flex-col h-full animate-in fade-in duration-300">
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl shadow-lg border border-slate-800 mb-4">
              <button onClick={() => setCurrentHole(h => Math.max(1, h - 1))} className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 active:scale-95 transition-all"><ChevronLeft /></button>
              <div className="text-center"><h2 className="text-xs text-slate-500 font-bold uppercase tracking-widest">Hole {currentHole}</h2><div className="flex items-center justify-center space-x-2 text-sm text-slate-400"><span>Par {holePar}</span><span className="text-slate-600">•</span><span>SI {holeSi}</span></div></div>
              <button onClick={() => setCurrentHole(h => Math.min(18, h + 1))} className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 active:scale-95 transition-all"><ChevronRight /></button>
          </div>
          <div className="flex justify-between items-center mb-4 px-2"><div className="text-xs font-bold text-slate-500 uppercase">{myGroup && !showAllPlayers ? `Group ${myGroup}` : 'All Players'}</div>{players.length > relevantPlayers.length || showAllPlayers ? (<button onClick={() => setShowAllPlayers(!showAllPlayers)} className="flex items-center text-xs text-blue-400 hover:text-white transition">{showAllPlayers ? <EyeOff size={14} className="mr-1"/> : <Eye size={14} className="mr-1"/>}{showAllPlayers ? 'Show Group' : 'Show All'}</button>) : null}</div>
          <div className="flex-1 overflow-y-auto space-y-3 pb-20">
              {relevantPlayers.map(p => {
                  const score = p.scores?.[currentHole];
                  const isNR = score === 'NR';
                  const displayVal = isNR ? 'NR' : (score || holePar);
                  const isEntered = score !== undefined && score !== 0;
                  const net = calculateNetScore(score || holePar, currentHole - 1, p.courseHandicap || 0, activeSi || DEFAULT_SI);
                  let statPreview = "";
                  if (activeGameMode === 'stableford') {
                      const pts = net === 'NR' ? 0 : Math.max(0, holePar - net + 2);
                      statPreview = `${pts} pts`;
                  } else { statPreview = `Net ${net}`; }
                  const diff = displayVal - holePar;
                  let colorClass = "text-slate-400";
                  if (isEntered && !isNR) {
                      if (diff < 0) colorClass = "text-red-400 font-bold";
                      else if (diff > 0) colorClass = "text-blue-400 font-bold";
                      else colorClass = "text-white font-bold";
                  } else if (isNR) colorClass = "text-orange-500 font-bold";

                  return (
                      <div key={p.id} className="bg-slate-800 p-2 rounded-xl flex items-center justify-between border border-slate-700 w-full max-w-full">
                          <div className="flex-1 min-w-0 pr-2 flex items-center">
                              {p.avatarUrl && <img src={p.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-slate-600 mr-3" alt={p.playerName}/>}
                              <div>
                                  <div className="font-bold text-sm text-slate-200 truncate">{p.playerName}</div>
                                  <div className="text-[10px] text-slate-500 truncate">CH: {p.courseHandicap} • {statPreview}</div>
                              </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                             <button onClick={() => {
                                 if (isNR) updateScore(p.userId, currentHole, holePar); 
                                 else updateScore(p.userId, currentHole, 'NR');
                             }} className={`w-8 h-10 rounded-lg border flex items-center justify-center font-bold text-[10px] ${isNR ? 'bg-orange-500/20 border-orange-500 text-orange-500' : 'bg-slate-900 border-slate-600 text-slate-500 hover:text-slate-300'}`}>{isNR ? <Ban size={14}/> : 'NR'}</button>
                              <button onClick={() => !isNR && updateScore(p.userId, currentHole, Math.max(1, displayVal - 1))} className="w-10 h-10 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center text-red-400 hover:bg-slate-700 active:scale-95 flex-shrink-0"><Minus size={18} /></button>
                              <div className={`w-8 text-center text-xl font-mono ${colorClass}`}>{displayVal}</div>
                              <button onClick={() => !isNR && updateScore(p.userId, currentHole, displayVal + 1)} className="w-10 h-10 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center text-green-400 hover:bg-slate-700 active:scale-95 flex-shrink-0"><Plus size={18} /></button>
                          </div>
                      </div>
                  );
              })}
              <div className="pt-6 pb-2"><button onClick={leaveGame} className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-emerald-500 font-bold flex items-center justify-center"><FlagTriangleRight size={18} className="mr-2" /> Finish Round</button></div>
          </div>
      </div>
  );
};

const LeaderboardView = ({ leaderboardData, user, activeGameMode }) => (
  <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl flex-1 flex flex-col">
          <div className="bg-slate-950 p-3 border-b border-slate-800 flex text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <div className="w-8 text-center">Pos</div><div className="flex-1 pl-2">Player</div><div className="w-8 text-center">Hls</div>
              {activeGameMode === 'stableford' && <div className="w-16 text-center">Pts</div>}
              {activeGameMode === 'match' && <div className="w-16 text-center">Status</div>}
              {activeGameMode === 'skins' && <div className="w-16 text-center">Skins</div>}
              {activeGameMode === 'stroke' && <><div className="w-12 text-center">Gross</div><div className="w-12 text-center">Net</div></>}
          </div>
          <div className="overflow-y-auto flex-1">
              {leaderboardData.map((player, index) => (
                  <div key={player.id} className={`flex items-center p-3 border-b border-slate-800/50 ${player.userId === user.uid ? 'bg-emerald-900/10' : ''}`}>
                      <div className="w-8 text-center font-mono text-slate-600 text-sm">{index + 1}</div>
                      <div className="flex-1 pl-2 truncate relative flex items-center">
                          {player.avatarUrl && <img src={player.avatarUrl} className="w-6 h-6 rounded-full mr-2 object-cover border border-slate-600" alt={player.playerName}/>}
                          <div className="truncate">
                              <div className="text-white font-medium text-sm flex items-center">{player.playerName}{player.teeGroup && <span className="ml-2 text-[8px] border border-slate-600 text-slate-400 px-1 rounded-sm font-mono">G{player.teeGroup}</span>}</div>
                              <div className="text-[10px] text-slate-500">CH: {player.courseHandicap}</div>
                          </div>
                      </div>
                      <div className="w-8 text-center text-slate-400 text-sm">{player.holesPlayed}</div>
                      {activeGameMode === 'stableford' && <div className="w-16 text-center font-bold font-mono text-lg text-emerald-400">{player.totalPoints}</div>}
                      {activeGameMode === 'match' && <div className={`w-16 text-center font-bold font-mono text-sm ${player.matchStatus === 'AS' ? 'text-slate-400' : (player.matchStatus.includes('UP') ? 'text-emerald-400' : 'text-red-400')}`}>{player.matchStatus}</div>}
                      {activeGameMode === 'skins' && <div className="w-16 text-center font-bold font-mono text-lg text-yellow-400 flex items-center justify-center gap-1"><Gem size={12} className="text-yellow-500" />{player.skinsWon}</div>}
                      {activeGameMode === 'stroke' && <><div className={`w-12 text-center font-bold font-mono text-base ${player.grossToPar === 999 ? 'text-orange-500' : (player.grossToPar < 0 ? 'text-red-400' : (player.grossToPar > 0 ? 'text-blue-400' : 'text-slate-200'))}`}>{player.displayScore}</div><div className="w-12 text-center font-mono text-sm text-emerald-400">{player.netTotal === 999 ? 'NR' : player.netTotal}</div></>}
                  </div>
              ))}
          </div>
          {activeGameMode === 'match' && <div className="p-2 text-[10px] text-center text-slate-500 bg-slate-950">Match status vs YOU (Shots from Difference)</div>}
          {activeGameMode === 'skins' && <div className="p-2 text-[10px] text-center text-slate-500 bg-slate-950">Skins with Carry-overs (Shots from Lowest)</div>}
      </div>
  </div>
);

const TeeSheetModal = ({ onClose, players, addGuest, randomize, newGuestName, setNewGuestName, newGuestHcp, setNewGuestHcp, savedPlayers }) => {
    const [targetGroupSize, setTargetGroupSize] = useState(4);
    const [guestAvatar, setGuestAvatar] = useState('');

    const groupedPlayers = useMemo(() => {
        const groups = {}; const unassigned = [];
        players.forEach(p => { if (p.teeGroup) { if (!groups[p.teeGroup]) groups[p.teeGroup] = []; groups[p.teeGroup].push(p); } else { unassigned.push(p); } });
        return { groups, unassigned };
    }, [players]);

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col p-4 animate-in fade-in duration-200">
             <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-white flex items-center"><Users className="mr-2 text-emerald-500" /> Tee Sheet</h2><button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={20} /></button></div>
            <div className="flex-1 overflow-y-auto space-y-6">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center"><UserPlus size={12} className="mr-1"/> Add Guest Player</h3>
                        {savedPlayers && savedPlayers.length > 0 && (<select className="bg-slate-800 text-xs text-blue-400 border border-slate-700 rounded px-2 py-1 outline-none" onChange={(e) => { const p = savedPlayers.find(sp => sp.id === e.target.value); if(p) { setNewGuestName(p.name); setNewGuestHcp(p.handicap); setGuestAvatar(p.avatarUrl || ''); } }} value=""><option value="" disabled>Pick Saved...</option>{savedPlayers.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select>)}
                    </div>
                    <div className="flex gap-2 mb-2">
                        <input className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500 outline-none" placeholder="Name" value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} />
                        <input type="number" className="w-16 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500 outline-none" placeholder="HCP" value={newGuestHcp} onChange={(e) => setNewGuestHcp(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                        <input className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500 outline-none" placeholder="Image URL (Optional)" value={guestAvatar} onChange={(e) => setGuestAvatar(e.target.value)} />
                        <button onClick={(e) => { e.preventDefault(); addGuest(guestAvatar); setGuestAvatar(''); }} className="bg-emerald-600 text-white p-2 rounded-lg font-bold disabled:opacity-50" disabled={!newGuestName.trim()}><Plus size={20} /></button>
                    </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center"><Shuffle size={12} className="mr-1"/> Shuffle Groups</h3>
                    
                    <div className="flex items-center justify-between mb-3">
                         <span className="text-xs text-slate-400">Size per group:</span>
                         <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-700">
                            {[2,3,4].map(size => (
                                <button 
                                    key={size} 
                                    onClick={() => setTargetGroupSize(size)}
                                    className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${targetGroupSize === size ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {size}
                                </button>
                            ))}
                         </div>
                    </div>

                    <button 
                        onClick={() => randomize(targetGroupSize)} 
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm text-emerald-500 font-bold flex justify-center items-center transition-all active:scale-95"
                    >
                        <Shuffle size={16} className="mr-2"/> 
                        Randomise All Players
                    </button>
                </div>

                <div className="space-y-4">
                    {groupedPlayers.unassigned.length > 0 && (
                        <div className="bg-slate-900 rounded-xl border border-slate-800 p-3"><div className="text-xs font-bold text-slate-500 uppercase mb-2">Unassigned / Lobby</div>{groupedPlayers.unassigned.map(p => (<div key={p.id} className="py-2 border-b border-slate-800/50 last:border-0 text-sm flex justify-between items-center">
                            <div className="flex items-center gap-2">{p.avatarUrl && <img src={p.avatarUrl} className="w-6 h-6 rounded-full object-cover" />}<span>{p.playerName}</span></div>
                            <span className="text-slate-500 font-mono text-xs">CH: {p.courseHandicap}</span></div>))}</div>
                    )}
                    {Object.keys(groupedPlayers.groups).sort().map(gNum => (
                        <div key={gNum} className="bg-slate-900 rounded-xl border border-slate-800 p-3 relative overflow-hidden"><div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500"></div><div className="text-xs font-bold text-emerald-400 uppercase mb-2 pl-2">Group {gNum}</div>{groupedPlayers.groups[gNum].map(p => (<div key={p.id} className="py-2 border-b border-slate-800/50 last:border-0 text-sm flex justify-between pl-2 items-center">
                            <div className="flex items-center gap-2">{p.avatarUrl && <img src={p.avatarUrl} className="w-6 h-6 rounded-full object-cover" />}<span>{p.playerName}</span></div>
                            <span className="text-slate-500 font-mono text-xs">CH: {p.courseHandicap}</span></div>))}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState(null);
  const [gameId, setGameId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [handicapIndex, setHandicapIndex] = useState('');
  const [savedPlayers, setSavedPlayers] = useState([]);
  const [syncStatus, setSyncStatus] = useState('saved'); // saved, saving, error
  
  const [players, setPlayers] = useState([]);
  const [gameSettings, setGameSettings] = useState(null);
  
  const [view, setView] = useState('lobby'); 
  const [currentHole, setCurrentHole] = useState(1);
  const [loading, setLoading] = useState(true);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [error, setError] = useState('');
  const [showExitModal, setShowExitModal] = useState(false);
  const [showTeeSheet, setShowTeeSheet] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestHcp, setNewGuestHcp] = useState('');
  
  const [courseName, setCourseName] = useState('');
  const [slope, setSlope] = useState('113');
  const [rating, setRating] = useState('72.0');
  const [pars, setPars] = useState(DEFAULT_PARS);
  const [si, setSi] = useState(DEFAULT_SI);
  const [gameMode, setGameMode] = useState('stroke'); 

  useEffect(() => {
    const initAuth = async () => {
      try { 
        await setPersistence(auth, browserLocalPersistence); 
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) { await signInWithCustomToken(auth, __initial_auth_token); } 
      } catch (err) { console.error("Auth error", err); setError("Failed to authenticate"); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const savedGame = localStorage.getItem('golf_game_id');
        const savedName = localStorage.getItem('golf_player_name');
        const savedHcp = localStorage.getItem('golf_player_hcp');
        if (savedGame && savedName) { setGameId(savedGame); setPlayerName(savedName); if (savedHcp) setHandicapIndex(savedHcp); setJoinCodeInput(savedGame); } else { setLoading(false); }
      } else {
        if (!user) { try { await signInAnonymously(auth); } catch (e) { console.error("Anon sign in failed", e); } }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
      if (!user) return;
      const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'saved_players'));
      const unsubscribe = onSnapshot(q, (snapshot) => { const sp = []; snapshot.forEach(doc => sp.push({id: doc.id, ...doc.data()})); setSavedPlayers(sp); }, (err) => { console.error("Error fetching players:", err); });
      return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !gameId) return;
    setLoading(true);
    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, `SETTINGS_${gameId}`);
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
        if (docSnap.exists()) { setGameSettings(docSnap.data()); if (view === 'lobby' || view === 'setup') setView('score'); } setLoading(false);
    }, (err) => console.error(err));
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME), where('gameId', '==', gameId.toUpperCase()), where('type', '==', 'player'));
    const unsubPlayers = onSnapshot(q, (snapshot) => { const playerData = []; snapshot.forEach((doc) => { playerData.push({ id: doc.id, ...doc.data() }); }); setPlayers(playerData); }, (err) => console.error(err));
    return () => { unsubSettings(); unsubPlayers(); };
  }, [user, gameId]);

  const performGoogleSearch = () => { if (!courseName) return; const query = `${courseName} golf course scorecard slope rating`; window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank'); };
  const startSetup = () => { if (!courseName.trim()) { setError("Name the game first"); return; } setView('setup'); };

  const createGame = async (friendsToAdd = [], hostAvatarUrl = '') => {
      if (!playerName) { throw new Error("Host name required"); }
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const settingsId = `SETTINGS_${newCode}`;
      const totalPar = pars.reduce((a, b) => a + b, 0);
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, settingsId), { courseName, slope, rating, pars, si, totalPar, gameMode, createdAt: new Date().toISOString() });
      await joinGameLogic(newCode, courseName, slope, rating, totalPar, hostAvatarUrl);
      if (friendsToAdd.length > 0) {
          const batch = writeBatch(db);
          friendsToAdd.forEach(friend => {
              const guestId = `guest_${Math.random().toString(36).substring(2, 9)}`;
              const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, `${newCode}_${guestId}`);
              const ch = calculateCourseHandicap(friend.handicap, slope, rating, totalPar);
              batch.set(docRef, { 
                  gameId: newCode, 
                  userId: guestId, 
                  playerName: friend.name, 
                  handicapIndex: friend.handicap, 
                  courseHandicap: ch, 
                  avatarUrl: friend.avatarUrl || '',
                  type: 'player', 
                  isGuest: true, 
                  teeGroup: null, 
                  lastActive: new Date().toISOString() 
              });
          });
          await batch.commit();
      }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim() || !joinCodeInput.trim()) { setError("Name and Code required"); return; }
    const code = joinCodeInput.toUpperCase();
    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, `SETTINGS_${code}`);
    const snap = await getDoc(settingsRef);
    if (!snap.exists()) { setError("Game code not found"); return; }
    const settings = snap.data();
    await joinGameLogic(code, settings.courseName, settings.slope, settings.rating, settings.totalPar);
  };

  const joinGameLogic = async (code, cName, cSlope, cRating, cTotalPar, avatarUrl = '') => {
    setLoading(true);
    setGameId(code);
    localStorage.setItem('golf_game_id', code);
    localStorage.setItem('golf_player_name', playerName);
    localStorage.setItem('golf_player_hcp', handicapIndex);
    const ch = calculateCourseHandicap(handicapIndex, cSlope, cRating, cTotalPar);
    const playerDocId = `${code}_${user.uid}`;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, playerDocId), { 
        gameId: code, 
        userId: user.uid, 
        playerName: playerName, 
        handicapIndex: handicapIndex, 
        courseHandicap: ch, 
        avatarUrl: avatarUrl, 
        type: 'player', 
        lastActive: new Date().toISOString() 
    }, { merge: true });
    setView('score');
    setLoading(false);
  };

  const updateScore = async (targetUserId, hole, strokes) => {
    if (!user || !gameId) return;
    setSyncStatus('saving');
    const playerDocId = `${gameId}_${targetUserId}`;
    const targetPlayer = players.find(p => p.userId === targetUserId) || {};
    const currentScores = targetPlayer.scores || {};
    const newScores = { ...currentScores, [hole]: strokes };
    try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, playerDocId), { scores: newScores }, { merge: true }); setSyncStatus('saved'); } catch (e) { console.error("Sync error:", e); setSyncStatus('error'); }
  };
  
  const leaveGame = () => { setShowExitModal(true); };
  const confirmLeave = () => { localStorage.removeItem('golf_game_id'); setGameId(''); setPlayers([]); setGameSettings(null); setView('lobby'); setJoinCodeInput(''); setShowExitModal(false); };
  const loadHistoricalGame = (oldGameId) => { if(!oldGameId) return; setGameId(oldGameId); setShowHistory(false); setView('leaderboard'); };

  const addGuestPlayer = async (avatarUrl = '') => {
      if (!newGuestName.trim()) return;
      if (!gameId) return;
      const guestId = `guest_${Math.random().toString(36).substring(2, 9)}`;
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, `${gameId}_${guestId}`);
      const cSettings = gameSettings || {};
      const ch = calculateCourseHandicap(newGuestHcp, cSettings.slope, cSettings.rating, cSettings.totalPar);
      await setDoc(docRef, { 
          gameId: gameId, 
          userId: guestId, 
          playerName: newGuestName, 
          handicapIndex: newGuestHcp || 0, 
          courseHandicap: ch, 
          avatarUrl: avatarUrl,
          type: 'player', 
          isGuest: true, 
          teeGroup: null, 
          lastActive: new Date().toISOString() 
      });
      setNewGuestName(''); setNewGuestHcp('');
  };

  const randomizeGroups = async (groupSize) => {
      if (players.length === 0) return;
      const shuffled = [...players];
      for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
      const batch = writeBatch(db);
      shuffled.forEach((p, index) => { const groupNum = Math.floor(index / groupSize) + 1; const docRef = doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, p.id); batch.update(docRef, { teeGroup: groupNum }); });
      await batch.commit();
  };
  
  const handleLogin = async () => { const provider = new GoogleAuthProvider(); try { if (user && user.isAnonymous) { await linkWithPopup(user, provider); } else { await signInWithPopup(auth, provider); } } catch (error) { if (error.code === 'auth/credential-already-in-use') { await signInWithPopup(auth, provider); } else if (error.code === 'auth/popup-closed-by-user') { /* Ignore */ } else { alert("Login failed: " + error.message + "\nCheck domain whitelist in Firebase."); } } };
  const handleLogout = async () => { await signOut(auth); await signInAnonymously(auth); };

  const activePars = gameSettings?.pars || DEFAULT_PARS;
  const activeSi = gameSettings?.si || DEFAULT_SI;
  const activeGameMode = gameSettings?.gameMode || 'stroke';

  const leaderboardData = useMemo(() => {
    let lowestHcp = 999;
    players.forEach(p => { if(p.courseHandicap < lowestHcp) lowestHcp = p.courseHandicap; });
    if (lowestHcp === 999) lowestHcp = 0;

    const playerDetails = players.map(p => {
        const scores = p.scores || {};
        const ch = p.courseHandicap || 0;
        const netScores = {};
        activePars.forEach((_, idx) => { const h = idx + 1; if (scores[h]) { netScores[h] = calculateNetScore(scores[h], idx, ch, activeSi); } });
        return { ...p, netScores, scores, ch };
    });

    const skinsWon = {};
    if (activeGameMode === 'skins') {
        let pot = 1;
        playerDetails.forEach(p => skinsWon[p.id] = 0);
        for (let i = 1; i <= 18; i++) {
            const holeScores = playerDetails.map(p => {
                 const s = p.scores[i];
                 if (!s || s === 'NR') return { id: p.id, net: 'NR' }; 
                 const strokesRec = getShotsOnHole(p.ch - lowestHcp, activeSi[i-1]);
                 return { id: p.id, net: s - strokesRec };
            }).filter(s => s.net !== 'NR');

            if (holeScores.length === 0) continue; 
            const minVal = Math.min(...holeScores.map(s => s.net));
            const winners = holeScores.filter(s => s.net === minVal);
            if (winners.length === 1) { skinsWon[winners[0].id] += pot; pot = 1; } else { pot += 1; }
        }
    }

    const myPlayer = playerDetails.find(p => p.userId === user?.uid);
    const matchStatus = {};
    if (activeGameMode === 'match' && myPlayer) {
        playerDetails.forEach(opponent => {
            if (opponent.userId === user.uid) { matchStatus[opponent.id] = "-"; return; }
            let myWins = 0; let opWins = 0;
            const lowerCH = Math.min(myPlayer.ch, opponent.ch);
            const myPlayingHcp = myPlayer.ch - lowerCH;
            const opPlayingHcp = opponent.ch - lowerCH;

            for (let i = 1; i <= 18; i++) {
                const myGross = myPlayer.scores[i];
                const opGross = opponent.scores[i];
                const myIsNR = myGross === 'NR' || !myGross;
                const opIsNR = opGross === 'NR' || !opGross;

                if (!myIsNR && !opIsNR) {
                     const myNet = myGross - getShotsOnHole(myPlayingHcp, activeSi[i-1]);
                     const opNet = opGross - getShotsOnHole(opPlayingHcp, activeSi[i-1]);
                     if (myNet < opNet) myWins++; else if (opNet < myNet) opWins++;
                } else if (myIsNR && !opIsNR) { opWins++; } else if (!myIsNR && opIsNR) { myWins++; }
            }
            const diff = myWins - opWins;
            if (diff === 0) matchStatus[opponent.id] = "AS"; else if (diff > 0) matchStatus[opponent.id] = `${diff} DN`; else matchStatus[opponent.id] = `${Math.abs(diff)} UP`;
        });
    }

    return playerDetails.map(player => {
        let gross = 0; let holesPlayed = 0; let totalPoints = 0;
        activePars.forEach((par, idx) => {
            const holeNum = idx + 1; const s = player.scores[holeNum];
            if (s && s !== 'NR') { 
                gross += s; holesPlayed++; 
                const net = player.netScores[holeNum]; 
                if (net !== null && net !== 'NR') { 
                    const pts = Math.max(0, par - net + 2); 
                    totalPoints += pts; 
                } 
            } else if (s === 'NR') { holesPlayed++; } 
        });
        
        let parForHolesPlayed = 0; Object.keys(player.scores).forEach(holeKey => { parForHolesPlayed += activePars[parseInt(holeKey)-1]; });
        const grossToPar = (gross === 0 && holesPlayed > 0) ? 999 : (gross - parForHolesPlayed);
        const netTotal = (gross === 0 && holesPlayed > 0) ? 999 : (gross - Math.round(player.ch * (holesPlayed/18)));

        return { 
            ...player, gross, holesPlayed, grossToPar, netTotal, totalPoints, 
            matchStatus: matchStatus[player.id] || '-', 
            skinsWon: skinsWon[player.id] || 0, 
            displayScore: holesPlayed === 0 ? 'E' : (grossToPar === 999 ? 'NR' : (grossToPar === 0 ? 'E' : (grossToPar > 0 ? `+${grossToPar}` : grossToPar))) 
        };
    }).sort((a, b) => { 
        if (activeGameMode === 'stableford') return b.totalPoints - a.totalPoints; 
        if (activeGameMode === 'skins') return b.skinsWon - a.skinsWon; 
        return a.grossToPar - b.grossToPar; 
    });
  }, [players, activePars, activeSi, activeGameMode, user]);

  const myData = players.find(p => p.userId === user?.uid) || {};
  const myScores = myData.scores || {};
  const currentHoleScore = myScores[currentHole] || activePars[currentHole-1];

  if (loading) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-500 space-y-4"><Activity className="animate-spin text-emerald-600" size={32} /><p className="text-xs uppercase tracking-widest">Loading Course Data...</p></div>;

  return (
    <div 
      className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden flex flex-col"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.95)), url("${BACKGROUND_IMAGE}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
        {view === 'lobby' && (
            <LobbyView 
                courseName={courseName} setCourseName={setCourseName}
                startSetup={startSetup}
                playerName={playerName} setPlayerName={setPlayerName}
                joinCodeInput={joinCodeInput} setJoinCodeInput={setJoinCodeInput}
                handleJoinGame={handleJoinGame}
                error={error} 
                setShowPortal={setShowPortal}
                setShowHistory={setShowHistory}
                user={user} handleLogin={handleLogin} handleLogout={handleLogout}
            />
        )}
        
        {view === 'setup' && (
            <SetupView 
                courseName={courseName} setCourseName={setCourseName}
                slope={slope} setSlope={setSlope}
                rating={rating} setRating={setRating}
                pars={pars} setPars={setPars}
                gameMode={gameMode} setGameMode={setGameMode}
                setSi={setSi}
                playerName={playerName} setPlayerName={setPlayerName}
                handicapIndex={handicapIndex} setHandicapIndex={setHandicapIndex}
                performGoogleSearch={performGoogleSearch}
                createGame={createGame}
                onCancel={() => setView('lobby')}
                savedPlayers={savedPlayers} 
                error={error} 
            />
        )}

        {(view === 'score' || view === 'leaderboard') && (
            <>
                <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 h-14 flex items-center justify-between px-4 z-20 sticky top-0">
                    <div className="flex items-center space-x-2">
                        <MapPin size={16} className="text-emerald-500" />
                        <span className="font-bold text-sm truncate max-w-[120px]">{gameSettings?.courseName || 'Nils Pois'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <SyncStatus status={syncStatus} />
                        <button onClick={() => setShowTeeSheet(true)} className="bg-slate-800 p-2 rounded-full text-emerald-500 hover:text-emerald-400 hover:bg-slate-700 transition"><Users size={16} /></button>
                        <div className="flex items-center bg-slate-950 rounded-full px-3 py-1 border border-slate-800" onClick={() => {navigator.clipboard.writeText(gameId);}}><span className="font-mono font-bold text-emerald-400 tracking-widest mr-2">{gameId}</span><Share2 size={12} className="text-slate-500"/></div>
                    </div>
                </header>

                <main className="flex-1 p-4 max-w-lg mx-auto w-full overflow-hidden flex flex-col">
                    {view === 'score' ? (
                        <ScoreView 
                            currentHole={currentHole} setCurrentHole={setCurrentHole}
                            currentHoleScore={currentHoleScore} updateScore={updateScore}
                            activePars={activePars} myData={myData}
                            activeGameMode={activeGameMode} activeSi={activeSi}
                            players={players}
                            user={user}
                            syncStatus={syncStatus}
                            leaveGame={leaveGame}
                        />
                    ) : (
                        <LeaderboardView leaderboardData={leaderboardData} user={user} activeGameMode={activeGameMode} />
                    )}
                    
                    <div className="mt-2 flex justify-between items-center px-1">
                         <button onClick={leaveGame} className="text-[10px] text-red-500/50 hover:text-red-400 flex items-center gap-1 uppercase tracking-wider"><LogOut size={10}/> Exit</button>
                    </div>
                </main>

                <nav className="bg-slate-900 border-t border-slate-800 h-16 pb-2 z-20">
                    <div className="flex justify-around items-center h-full">
                        <button onClick={() => setView('score')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${view === 'score' ? 'text-emerald-500' : 'text-slate-600'}`}><Activity size={20} /><span className="text-[10px] font-bold uppercase">Score</span></button>
                        <button onClick={() => setView('leaderboard')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${view === 'leaderboard' ? 'text-blue-500' : 'text-slate-600'}`}><Trophy size={20} /><span className="text-[10px] font-bold uppercase">Leaderboard</span></button>
                    </div>
                </nav>
            </>
        )}

        {/* Player Portal Modal */}
        {showPortal && user && (
            <PlayerPortal onClose={() => setShowPortal(false)} userId={user.uid} savedPlayers={savedPlayers} />
        )}

        {/* History Modal */}
        {showHistory && user && (
            <HistoryView userId={user.uid} onClose={() => setShowHistory(false)} onLoadGame={loadHistoricalGame} />
        )}

        {/* Tee Sheet Modal */}
        {showTeeSheet && (
            <TeeSheetModal onClose={() => setShowTeeSheet(false)} players={players} addGuest={addGuestPlayer} randomize={randomizeGroups} newGuestName={newGuestName} setNewGuestName={setNewGuestName} newGuestHcp={newGuestHcp} setNewGuestHcp={setNewGuestHcp} savedPlayers={savedPlayers} />
        )}

        {showExitModal && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-xs w-full">
                    <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-white">Exit Game?</h3><button onClick={() => setShowExitModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button></div>
                    <p className="text-slate-400 text-sm mb-6">You will leave the lobby. Scores are saved online.</p>
                    <div className="flex gap-3"><button onClick={() => setShowExitModal(false)} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition">Cancel</button><button onClick={confirmLeave} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition">Exit</button></div>
                </div>
            </div>
        )}
    </div>
  );
}