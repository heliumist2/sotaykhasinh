import React, { useState, useEffect } from 'react';
import { 
  User, Award, CheckCircle2, Circle, Clock, LogOut, Search,
  ChevronRight, ShieldCheck, Lock, Unlock, ArrowLeft, 
  Calendar, Medal, Star, Target, BookOpen, FileText, Plus, 
  Link as LinkIcon, Upload, Trash2, Edit3, Loader2, HeartHandshake
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

// =====================================================================
const firebaseConfig = {
  apiKey: "ĐIỀN_VÀO_ĐÂY",
  authDomain: "ĐIỀN_VÀO_ĐÂY",
  projectId: "ĐIỀN_VÀO_ĐÂY",
  storageBucket: "ĐIỀN_VÀO_ĐÂY",
  messagingSenderId: "ĐIỀN_VÀO_ĐÂY",
  appId: "ĐIỀN_VÀO_ĐÂY"
};
// =====================================================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'kha-doan-bac-dau'; 

// --- DỮ LIỆU MẪU ĐỂ KHỞI TẠO LẦN ĐẦU ---
const INITIAL_TUANS = [
  { id: 't1', name: 'Tuần Sói', logo: 'https://placehold.co/100x100/475569/white?text=Soi' },
  { id: 't2', name: 'Tuần Hổ', logo: 'https://placehold.co/100x100/475569/white?text=Ho' },
];

const MOCK_USERS = [
  { id: 'k1', name: 'Nguyễn Văn A', tuanId: 't1', dob: '15/05/2006', currentRank: 'Thuần Kha', avatar: 'https://placehold.co/150x150/0f172a/white?text=A' },
  { id: 'k2', name: 'Trần Thị B', tuanId: 't1', dob: '22/08/2007', currentRank: 'Dự Kha', avatar: 'https://placehold.co/150x150/0f172a/white?text=B' },
];

const INITIAL_LAWS = [
  { id: 'l1', category: 'Lời Hứa', content: 'Tôi xin lấy danh dự hứa cố gắng hết sức:\n1. Làm bổn phận đối với tín ngưỡng tâm linh, quốc gia và xã hội.\n2. Giúp đỡ mọi người bất cứ lúc nào.\n3. Tuân theo Luật Hướng Đạo.' },
  { id: 'l2', category: 'Châm Ngôn', content: 'KHAI PHÁ' },
  { id: 'l3', category: 'Luật Hướng Đạo', content: '1. Kha sinh trọng danh dự...\n2. Kha sinh trung thành...\n3. Kha sinh giúp ích...' }
];

const INITIAL_DOC_CATEGORIES = [
  { id: 'cat1', name: 'Kỹ năng chuyên môn', avatar: 'https://placehold.co/100x100/dc2626/white?text=KN' }
];

const INITIAL_DOCS = [
  { id: 'd1', categoryId: 'cat1', title: 'Tài liệu Nút Dây Cơ Bản', description: 'Hướng dẫn các nút dây cơ bản ngành Kha (Nút ghế đơn, nút dẹt...)', link: 'https://vi.wikipedia.org/wiki/N%C3%BAt_d%C3%A2y' },
];

const RANKS = [
  { id: 'r1', name: 'Tân Kha', logo: 'https://placehold.co/100x100/3b82f6/white?text=TK', criteria: ['Luật - Lời Hứa - Châm ngôn', 'Hiểu biết phong trào', 'Trình diện và Chào', 'Khéo tay tháo vát', 'Dấu đường', 'Sức khỏe (Đi bộ 10km/5km)', 'Ca hát'] },
  { id: 'r2', name: 'Dự Kha', logo: 'https://placehold.co/100x100/3b82f6/white?text=DK', criteria: ['Hiểu biết phong trào (nâng cao)', 'Ca hát (10 bài)', 'Vệ sinh sức khỏe', 'Cứu thương', 'Quan sát', 'Đời sống trại', 'Truyền tin', 'Phương hướng', 'Công dân trách nhiệm'] },
  { id: 'r3', name: 'Chuyển Tiếp', logo: 'https://placehold.co/100x100/3b82f6/white?text=CT', criteria: ['Cắm trại 10 đêm / Sức khỏe', 'Cấp cứu và vệ sinh', 'Thám du 24h', 'Truyền tin (Morse/Semaphore)'] },
  { id: 'r4', name: 'Thuần Kha', logo: 'https://placehold.co/100x100/800020/white?text=Thuan+Kha', criteria: ['Qua đẳng thứ Thuần Kha', 'Đạt năng hiệu loại I', 'Đạt năng hiệu loại II', 'Đạt năng hiệu loại III', 'Hội đồng luật thông qua'] },
  { id: 'r5', name: 'Kha Tiền Phong', logo: 'https://placehold.co/100x100/10b981/white?text=KTP', criteria: ['Kiện toàn loại I, II, III', 'Đạt năng hiệu loại IV', 'Xuất du 24h một mình', 'Qua trại huấn luyện cơ bản', 'Phục vụ 3-6 tháng', 'Hội đồng luật thông qua'] },
  { id: 'r6', name: 'Kha Nghĩa Sĩ', logo: 'https://placehold.co/100x100/ef4444/white?text=KNS', criteria: ['Kiện toàn I, II, III, IV', 'Đạt năng hiệu loại V', 'Phục vụ thêm 6 tháng', 'Thành tích cao', 'Hội đồng luật thông qua'] }
];

const CATEGORIES = [
  {
    id: 'c1', name: 'Loại I: Thiên nhiên - Cắm trại', color: 'emerald', logo: 'https://placehold.co/100x100/10b981/white?text=Loai+I',
    skills: ['Hiểu biết & bảo tồn ĐV', 'Thảo mộc học', 'Côn trùng học', 'Bảo vệ môi trường', 'Hải dương học', 'Địa chất học', 'Thiên văn & Khí tượng', 'Canh nông', 'Bò sát & Lưỡng cư', 'Quan sát & Tìm vết', 'Vẽ địa đồ', 'Cắm trại', 'Sử dụng bản đồ', 'Tìm phương hướng', 'Tạo tác tiền phong', 'Thám hiểm - Thám du', 'Hỏa đầu quân', 'Kỹ thuật sông nước', 'Truyền tin liên lạc', 'Ước đạc']
  },
  {
    id: 'c2', name: 'Loại II: Thể lực - Thích ứng', color: 'orange', logo: 'https://placehold.co/100x100/f97316/white?text=Loai+II',
    skills: ['Huấn luyện thể dục', 'Bơi lội', 'Võ thuật', 'Xe đạp', 'Liên lạc viên', 'Tay nỏ', 'Kỵ mã', 'Quản tượng', 'Cầu thủ', 'Leo núi', 'Vận động viên', 'Điền kinh']
  },
  {
    id: 'c3', name: 'Loại III: Hướng nghiệp', color: 'fuchsia', logo: 'https://placehold.co/100x100/d946ef/white?text=Loai+III',
    skills: ['Khéo tay tháo vát', 'Họa viên', 'Sưu tập tem', 'Thợ đan', 'Thợ mộc', 'Thợ nề', 'Thợ giày', 'Thợ dệt', 'Thợ tre', 'Thợ rèn sắt', 'Thợ nguội', 'Thợ sơn', 'Thợ may', 'Thợ máy', 'Thợ in', 'Thợ điện', 'Chăn nuôi', 'Nuôi ong', 'Nuôi cá', 'Đánh cá', 'Làm vườn', 'Trồng cây', 'Vô tuyến điện', 'Hóa học viên', 'Thợ ống nước', 'Thợ đóng sách', 'Thợ khắc', 'Máy bay mô hình', 'Vi tính', 'Gốm sứ', 'Kinh doanh', 'Nghề làm giấy', 'Thợ máy NN']
  },
  {
    id: 'c4', name: 'Loại IV: Phục vụ', color: 'blue', logo: 'https://placehold.co/100x100/3b82f6/white?text=Loai+IV',
    skills: ['Cứu thương', 'Cấp cứu', 'Cứu hỏa', 'Dẫn đường', 'Quản trò', 'Bạn năm châu', 'Thông dịch viên', 'Thư ký', 'Luật viên']
  },
  {
    id: 'c5', name: 'Loại V: Văn hóa - Tín ngưỡng', color: 'yellow', logo: 'https://placehold.co/100x100/eab308/white?text=Loai+V',
    skills: ['Ca sĩ', 'Nhạc sĩ', 'Họa sĩ', 'Văn sĩ', 'Điêu khắc', 'Ảo thuật', 'Nhiếp ảnh', 'Đạo diễn', 'Diễn viên', 'Quay phim', 'Kịch tác gia', 'Quái kiệt']
  }
];

const getSkillLogo = (skillName) => `https://placehold.co/100x100/f8fafc/64748b?text=${encodeURIComponent(skillName.substring(0, 3))}`;
const STATUS = { UNREGISTERED: 'unregistered', IN_PROGRESS: 'in_progress', COMPLETED: 'completed' };

export default function App() {
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);

  const [tuans, setTuans] = useState([]);
  const [users, setUsers] = useState([]);
  const [laws, setLaws] = useState([]);
  const [docCategories, setDocCategories] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [customLogos, setCustomLogos] = useState({});
  
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  // States Modals Thêm mới
  const [showAddTuanModal, setShowAddTuanModal] = useState(false);
  const [newTuan, setNewTuan] = useState({ name: '', logo: '' });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', tuanId: '', dob: '', avatar: '' });
  const [showAddLawModal, setShowAddLawModal] = useState(false);
  const [newLaw, setNewLaw] = useState({ category: 'Lời Hứa', content: '' });
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', avatar: '' });
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', description: '', link: '', categoryId: '' });

  // States Modals Chỉnh sửa & Ảnh Bìa
  const [editingTuan, setEditingTuan] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditCoverModal, setShowEditCoverModal] = useState(false);
  const [coverForm, setCoverForm] = useState({ type: 'image', url: '' });

  // 1. Khởi tạo Auth
  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } 
      catch (err) { console.error("Auth Error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, user => setAuthUser(user));
    return () => unsubscribe();
  }, []);

  // 2. Lắng nghe Dữ liệu Đám mây (Firestore)
  useEffect(() => {
    if (!authUser) return;

    const listeners = [];
    const listenToCollection = (collName, setFn, isMap = false) => {
      const q = collection(db, 'artifacts', appId, 'public', 'data', collName);
      return onSnapshot(q, (snapshot) => {
        if (isMap) {
          const dataMap = {};
          snapshot.docs.forEach(d => dataMap[d.id] = d.data());
          setFn(dataMap);
        } else {
          setFn(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      }, console.error);
    };

    listeners.push(listenToCollection('tuans', setTuans));
    listeners.push(listenToCollection('users', setUsers));
    listeners.push(listenToCollection('laws', setLaws));
    listeners.push(listenToCollection('docCategories', setDocCategories));
    listeners.push(listenToCollection('documents', setDocuments));
    listeners.push(listenToCollection('progressData', setProgressData, true));
    listeners.push(listenToCollection('customLogos', setCustomLogos, true));

    const checkAndSeedData = async () => {
      try {
        const metaRef = doc(db, 'artifacts', appId, 'public', 'data', 'metadata', 'init');
        const metaSnap = await getDoc(metaRef);
        if (!metaSnap.exists()) {
          INITIAL_TUANS.forEach(t => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tuans', t.id), t));
          MOCK_USERS.forEach(u => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', u.id), u));
          INITIAL_LAWS.forEach(l => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'laws', l.id), l));
          INITIAL_DOC_CATEGORIES.forEach(c => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docCategories', c.id), c));
          INITIAL_DOCS.forEach(d => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'documents', d.id), d));
          MOCK_USERS.forEach(u => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'progressData', u.id), { badges: {}, ranks: {}, info: { currentRank: u.currentRank } }));
          await setDoc(metaRef, { initialized: true });
        }
      } catch(e) { console.error("Seeding error:", e); }
      finally { setLoading(false); }
    };
    checkAndSeedData();

    return () => listeners.forEach(unsub => unsub());
  }, [authUser]);

  const handleFileUpload = (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
       const reader = new FileReader();
       reader.onloadend = () => callback(reader.result);
       reader.readAsDataURL(file);
       return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400; 
        let width = img.width;
        let height = img.height;
        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width; width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height; height = MAX_SIZE;
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectUser = (user) => { setCurrentUser(user); setCurrentView('profile'); window.scrollTo(0, 0); };

  // --- ẢNH BÌA ---
  const handleUpdateCover = async (e) => {
    e.preventDefault();
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'customLogos', 'main_cover'), coverForm);
    setShowEditCoverModal(false);
  };

  const renderCoverMedia = () => {
    const coverData = customLogos['main_cover'];
    if (!coverData || !coverData.url) {
      return <img src="https://placehold.co/1200x400/94a3b8/ffffff?text=Anh+Bia+Kha+Doan" alt="Cover" className="absolute inset-0 w-full h-full object-cover" />;
    }
    if (coverData.type === 'video') {
      const ytMatch = coverData.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (ytMatch) {
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none bg-black">
            <iframe 
              className="absolute top-1/2 left-1/2 w-[300%] sm:w-[150%] h-[300%] sm:h-[150%] max-w-none -translate-x-1/2 -translate-y-1/2 pointer-events-none" 
              src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytMatch[1]}&controls=0&showinfo=0&rel=0`} 
              title="Cover Video" 
              frameBorder="0" 
              allow="autoplay; encrypted-media" 
              allowFullScreen>
            </iframe>
          </div>
        );
      }
      return <video src={coverData.url} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover pointer-events-none"></video>;
    }
    return <img src={coverData.url} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />;
  };

  // --- TUẦN ---
  const handleAddTuan = async (e) => {
    e.preventDefault(); if (!newTuan.name.trim()) return;
    const id = 't' + Date.now();
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tuans', id), { name: newTuan.name, logo: newTuan.logo || `https://placehold.co/100x100/475569/white?text=${encodeURIComponent(newTuan.name.charAt(0))}` });
    setShowAddTuanModal(false); setNewTuan({ name: '', logo: '' });
  };

  const handleUpdateTuan = async (e) => {
    e.preventDefault();
    if (!editingTuan.name.trim()) return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tuans', editingTuan.id), {
      name: editingTuan.name,
      logo: editingTuan.logo
    }, { merge: true });
    setEditingTuan(null);
  };

  const handleDeleteTuan = async (tuanId, tuanName) => {
    const hasUsers = users.some(u => u.tuanId === tuanId);
    if (hasUsers) { alert(`Không thể xóa ${tuanName} vì vẫn còn Kha sinh. Vui lòng chuyển các Kha sinh sang Tuần khác trước!`); return; }
    if (window.confirm(`Bạn có chắc muốn xóa ${tuanName}?`)) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tuans', tuanId));
  };

  // --- KHA SINH ---
  const handleAddUser = async (e) => {
    e.preventDefault(); if (!newUser.name.trim() || tuans.length === 0) return;
    const id = 'k' + Date.now(); const defaultTuanId = newUser.tuanId || tuans[0].id;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', id), { name: newUser.name, tuanId: defaultTuanId, dob: newUser.dob, currentRank: 'Tân Kha', avatar: newUser.avatar || `https://placehold.co/150x150/0f172a/white?text=${encodeURIComponent(newUser.name.charAt(0))}` });
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'progressData', id), { badges: {}, ranks: {}, info: { currentRank: 'Tân Kha' } });
    setShowAddUserModal(false); setNewUser({ name: '', tuanId: '', dob: '', avatar: '' });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser.name.trim()) return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', editingUser.id), {
      name: editingUser.name,
      dob: editingUser.dob,
      avatar: editingUser.avatar
    }, { merge: true });
    if (currentUser?.id === editingUser.id) {
      setCurrentUser({ ...currentUser, ...editingUser });
    }
    setEditingUser(null);
  };

  const handleChangeUserTuan = async (newTuanId) => {
    if (!isAdmin) return;
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', currentUser.id), { tuanId: newTuanId }, { merge: true });
    setCurrentUser({ ...currentUser, tuanId: newTuanId });
  };

  const handleDeleteUser = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn XÓA Kha sinh ${currentUser.name} khỏi hệ thống không? Dữ liệu không thể phục hồi.`)) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', currentUser.id));
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'progressData', currentUser.id));
      setCurrentUser(null);
    }
  };

  // --- LUẬT LỜI HỨA ---
  const handleAddLaw = async (e) => {
    e.preventDefault(); if (!newLaw.content.trim()) return;
    const id = 'l' + Date.now();
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'laws', id), newLaw);
    setShowAddLawModal(false); setNewLaw({ category: 'Lời Hứa', content: '' });
  };

  const handleDeleteLaw = async (lawId) => {
    if (window.confirm('Bạn có muốn xóa nội dung này?')) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'laws', lawId));
  };

  // --- TÀI LIỆU ---
  const handleAddCategory = async (e) => {
    e.preventDefault(); if (!newCategory.name.trim()) return;
    const id = 'cat' + Date.now();
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docCategories', id), newCategory);
    setShowAddCategoryModal(false); setNewCategory({ name: '', avatar: '' });
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    const hasDocs = documents.some(d => d.categoryId === categoryId);
    if (hasDocs) { alert(`Không thể xóa danh mục "${categoryName}" vì vẫn còn tài liệu bên trong.`); return; }
    if (window.confirm(`Bạn có chắc muốn xóa danh mục "${categoryName}"?`)) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docCategories', categoryId));
  };

  const handleAddDoc = async (e) => {
    e.preventDefault(); if (!newDoc.title.trim()) return;
    const id = 'd' + Date.now(); const categoryId = newDoc.categoryId || (docCategories.length > 0 ? docCategories[0].id : '');
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'documents', id), { ...newDoc, categoryId });
    setShowAddDocModal(false); setNewDoc({ title: '', description: '', link: '', categoryId: '' });
  };

  const handleDeleteDoc = async (docId, docTitle) => {
    if (window.confirm(`Bạn có chắc muốn xóa tài liệu "${docTitle}"?`)) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'documents', docId));
  };

  // --- TIẾN TRÌNH RÈN LUYỆN ---
  const updateBadge = async (skillName, status) => {
    if (!currentUser) return;
    const currentProg = progressData[currentUser.id] || { badges: {}, ranks: {}, info: { currentRank: currentUser.currentRank } };
    const currentStatus = currentProg.badges[skillName] || STATUS.UNREGISTERED;
    if (!isAdmin) {
      if (status === STATUS.COMPLETED) { alert('Chỉ Huynh trưởng mới được đánh dấu Đã đạt!'); return; }
      if (currentStatus === STATUS.COMPLETED) { alert('Năng hiệu này đã được HT duyệt, bạn không thể thay đổi!'); return; }
    }
    const newProg = { ...currentProg, badges: { ...currentProg.badges, [skillName]: status } };
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'progressData', currentUser.id), newProg);
  };

  const updateRankCriteria = async (rankId, criteriaIdx) => {
    if (!isAdmin) return; 
    const key = `${rankId}_${criteriaIdx}`;
    const currentProg = progressData[currentUser.id] || { badges: {}, ranks: {}, info: { currentRank: currentUser.currentRank } };
    const currentRanks = currentProg.ranks || {};
    const newProg = { ...currentProg, ranks: { ...currentRanks, [key]: !currentRanks[key] } };
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'progressData', currentUser.id), newProg);
  };

  const updateCurrentRank = async (newRank) => {
    if (!isAdmin) return;
    const currentProg = progressData[currentUser.id] || { badges: {}, ranks: {}, info: { currentRank: currentUser.currentRank } };
    const newProg = { ...currentProg, info: { ...currentProg.info, currentRank: newRank } };
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'progressData', currentUser.id), newProg);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', currentUser.id), { currentRank: newRank }, { merge: true });
  };

  const handleCustomLogoUpload = async (id, base64) => {
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'customLogos', id), { logo: base64 });
  };

  const getEarnedCategories = (userId) => {
    const userBadges = progressData[userId]?.badges || {};
    return CATEGORIES.filter(cat => {
      const completedCount = cat.skills.filter(skill => userBadges[skill] === STATUS.COMPLETED).length;
      return completedCount >= 2;
    });
  };

  const getCompletedSkills = (userId) => {
    const userBadges = progressData[userId]?.badges || {};
    return Object.keys(userBadges).filter(skill => userBadges[skill] === STATUS.COMPLETED);
  };


  // ==========================================
  // --- GIAO DIỆN CHÍNH ---
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-red-800 mb-4" size={48} />
        <h2 className="text-xl font-bold text-slate-800">Đang kết nối hệ thống...</h2>
      </div>
    );
  }

  // ==========================================
  // MÀN HÌNH DASHBOARD (TRANG CHỦ)
  // ==========================================
  if (!currentUser) {
    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-3xl flex flex-col items-center mt-2 sm:mt-8 mb-8">
          
          {/* KHU VỰC ẢNH/VIDEO BÌA VÀ LOGO */}
          <div className="relative w-full h-48 sm:h-64 md:h-80 rounded-3xl shadow-lg mb-16 bg-slate-200">
            <div className="w-full h-full rounded-3xl overflow-hidden relative">
              {renderCoverMedia()}
            </div>
            
            {isAdmin && (
              <button onClick={() => { 
                const existingCover = customLogos['main_cover'] || { type: 'image', url: '' };
                setCoverForm(existingCover); 
                setShowEditCoverModal(true); 
              }} className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-xl backdrop-blur-sm transition-all shadow-md" title="Đổi Ảnh/Video Bìa">
                <Edit3 size={20} />
              </button>
            )}

            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-30">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-red-800 flex items-center justify-center text-white shadow-xl overflow-hidden border-4 border-slate-100">
                  {customLogos['main_logo']?.logo ? (
                    <img src={customLogos['main_logo'].logo} alt="Logo Kha Đoàn" className="w-full h-full object-cover bg-white" />
                  ) : (
                    <ShieldCheck size={48} />
                  )}
                </div>
                {isAdmin && (
                  <label className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center cursor-pointer rounded-full text-white transition-all backdrop-blur-sm" title="Đổi Logo Kha Đoàn">
                    <Upload size={24} />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (base64) => handleCustomLogoUpload('main_logo', base64))} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Sổ Tay Kha Sinh</h1>
            <p className="text-slate-600 font-medium uppercase tracking-widest text-sm leading-relaxed">
              Kha Đoàn Bắc Đẩu - Liên Đoàn Hội An<br />Đạo Quảng Nam - Châu Liên Quảng
            </p>
          </div>

          {isAdmin ? (
            <div className="mt-6 flex flex-col items-center space-y-3">
              <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-800 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm border border-amber-200">
                <Unlock size={18} /><span>Chế độ Huynh Trưởng</span>
                <button onClick={() => setIsAdmin(false)} className="ml-3 text-amber-600 hover:text-amber-900 underline">Thoát</button>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => setShowAddTuanModal(true)} className="inline-flex items-center space-x-2 bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-slate-900 transition-colors">
                  <Plus size={18} /><span>Thêm Tuần</span>
                </button>
                <button onClick={() => {
                  if (tuans.length === 0) { alert('Vui lòng tạo ít nhất 1 Tuần trước khi thêm Kha sinh!'); return; }
                  setShowAddUserModal(true);
                }} className="inline-flex items-center space-x-2 bg-red-800 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-red-900 transition-colors">
                  <Plus size={18} /><span>Thêm Kha Sinh</span>
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAdminLogin(true)} className="mt-6 inline-flex items-center space-x-2 text-slate-500 hover:text-red-800 transition-colors text-sm font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
              <Lock size={16} /><span>Đăng nhập Huynh Trưởng</span>
            </button>
          )}
        </div>

        {/* MODAL: ĐĂNG NHẬP HUYNH TRƯỞNG */}
        {showAdminLogin && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Xác thực Huynh trưởng</h3>
              <form onSubmit={(e) => { e.preventDefault(); if(adminPassword === '123456') { setIsAdmin(true); setShowAdminLogin(false); setAdminPassword(''); } else alert('Sai mật khẩu!'); }}>
                <input type="password" placeholder="Mật khẩu..." className="w-full px-4 py-3 border border-slate-300 rounded-xl mb-4 focus:ring-2 focus:ring-red-800 outline-none" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} autoFocus />
                <div className="flex space-x-3">
                  <button type="button" onClick={() => setShowAdminLogin(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Hủy</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-red-800 text-white rounded-xl font-bold hover:bg-red-900 shadow-md">Vào</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: SỬA ẢNH/VIDEO BÌA */}
        {showEditCoverModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl my-8">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Cập Nhật Ảnh/Video Bìa</h3>
              <form onSubmit={handleUpdateCover} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Định dạng bìa</label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-800 outline-none" value={coverForm.type} onChange={e => setCoverForm({...coverForm, type: e.target.value, url: ''})}>
                    <option value="image">Ảnh Bìa tĩnh</option>
                    <option value="video">Video Bìa (Nền động)</option>
                  </select>
                </div>
                
                {coverForm.type === 'image' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tải ảnh lên hoặc dùng link</label>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-3">
                        <label className="cursor-pointer bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 border border-slate-300 flex items-center">
                          <Upload size={16} className="mr-2" /> Chọn ảnh
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (base64) => setCoverForm({...coverForm, url: base64}))} />
                        </label>
                        <span className="text-xs text-slate-500">Tối ưu dung lượng</span>
                      </div>
                      <input type="text" placeholder="Hoặc dán link ảnh (https://...)" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-800 outline-none text-sm" value={coverForm.url} onChange={e => setCoverForm({...coverForm, url: e.target.value})} />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Link Video (YouTube hoặc MP4)</label>
                    <input type="text" required placeholder="VD: https://www.youtube.com/watch?v=..." className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-800 outline-none text-sm" value={coverForm.url} onChange={e => setCoverForm({...coverForm, url: e.target.value})} />
                    <p className="text-xs text-slate-500 mt-2">Gợi ý: Copy đường dẫn từ Youtube dán vào đây. Hệ thống sẽ tự động phát ngầm làm video nền chuyên nghiệp (Không có tiếng).</p>
                  </div>
                )}
                
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setShowEditCoverModal(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Hủy</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md">Lưu Thay Đổi</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: THÊM TUẦN */}
        {showAddTuanModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl my-8">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Tạo Tuần Mới</h3>
              <form onSubmit={handleAddTuan} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên Tuần</label>
                  <input type="text" required placeholder="VD: Tuần Sói, Tuần Đại Bàng..." className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-800 outline-none" value={newTuan.name} onChange={e => setNewTuan({...newTuan, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cờ / Logo Tuần</label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                      <label className="cursor-pointer bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 border border-slate-300 flex items-center">
                        <Upload size={16} className="mr-2" /> Chọn ảnh từ máy
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (base64) => setNewTuan({...newTuan, logo: base64}))} />
                      </label>
                    </div>
                  </div>
                  {newTuan.logo && (
                    <div className="mt-2 w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm flex items-center justify-center bg-white">
                      <img src={newTuan.logo} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setShowAddTuanModal(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Hủy</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-red-800 text-white rounded-xl font-bold hover:bg-red-900 shadow-md">Tạo Tuần</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: SỬA TUẦN */}
        {editingTuan && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl my-8">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Sửa Thông Tin Tuần</h3>
              <form onSubmit={handleUpdateTuan} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên Tuần</label>
                  <input type="text" required className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-800 outline-none" value={editingTuan.name} onChange={e => setEditingTuan({...editingTuan, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cờ / Logo Tuần</label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                      <label className="cursor-pointer bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 border border-slate-300 flex items-center">
                        <Upload size={16} className="mr-2" /> Chọn ảnh từ máy
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (base64) => setEditingTuan({...editingTuan, logo: base64}))} />
                      </label>
                    </div>
                  </div>
                  {editingTuan.logo && (
                    <div className="mt-2 w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm flex items-center justify-center bg-white">
                      <img src={editingTuan.logo} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setEditingTuan(null)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Hủy</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md">Lưu Thay Đổi</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: THÊM KHA SINH */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl my-8">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Thêm Kha Sinh Mới</h3>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
                  <input type="text" required className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-800 outline-none" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Thuộc Tuần</label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-800 outline-none" value={newUser.tuanId} onChange={e => setNewUser({...newUser, tuanId: e.target.value})}>
                    {tuans.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày sinh (DD/MM/YYYY)</label>
                  <input type="text" placeholder="Ví dụ: 15/05/2006" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-800 outline-none" value={newUser.dob} onChange={e => setNewUser({...newUser, dob: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ảnh Đại Diện</label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                      <label className="cursor-pointer bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 border border-slate-300 flex items-center">
                        <Upload size={16} className="mr-2" /> Chọn ảnh
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (base64) => setNewUser({...newUser, avatar: base64}))} />
                      </label>
                    </div>
                  </div>
                  {newUser.avatar && (
                    <div className="mt-2 w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm flex items-center justify-center bg-white">
                      <img src={newUser.avatar} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setShowAddUserModal(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Hủy</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-red-800 text-white rounded-xl font-bold hover:bg-red-900 shadow-md">Thêm</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- DANH SÁCH THEO TUẦN --- */}
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input type="text" placeholder="Tìm Kha sinh..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-800 outline-none shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <div className="p-4">
            {tuans.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-medium">Chưa có Tuần nào được tạo.</div>
            ) : (
              tuans.map(tuan => {
                const tuanUsers = filteredUsers.filter(u => u.tuanId === tuan.id);
                return (
                  <div key={tuan.id} className="mb-8">
                    <div className="flex items-center justify-between mb-3 px-2">
                      <div className="flex items-center space-x-3">
                        {tuan.logo && <img src={tuan.logo} alt={tuan.name} className="w-8 h-8 rounded-full border border-slate-200 object-cover bg-white" />}
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{tuan.name}</h3>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center space-x-1">
                          <button onClick={() => setEditingTuan(tuan)} className="p-1.5 text-slate-300 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors" title="Sửa Tuần">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDeleteTuan(tuan.id, tuan.name)} className="p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Xóa Tuần">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {tuanUsers.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">Chưa có thành viên</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {tuanUsers.map(user => {
                          const userProg = progressData[user.id] || { info: { currentRank: user.currentRank } };
                          return (
                            <button key={user.id} onClick={() => handleSelectUser(user)} className="flex items-center p-3 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100 group text-left shadow-sm bg-white ring-1 ring-slate-100">
                              <div className="w-12 h-12 bg-slate-100 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 flex items-center justify-center">
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="text-slate-400 group-hover:text-red-800 transition-colors">
                                    <User size={20} />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4 flex-1">
                                <p className="font-bold text-slate-800">{user.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{userProg.info?.currentRank || user.currentRank}</p>
                              </div>
                              <ChevronRight size={18} className="text-slate-300 group-hover:text-red-800" />
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MÀN HÌNH BÊN TRONG HỒ SƠ KHA SINH
  // ==========================================
  const userData = progressData[currentUser.id] || { badges: {}, ranks: {}, info: { currentRank: currentUser.currentRank } };
  const activeRank = userData.info?.currentRank || currentUser.currentRank || 'Tân Kha';
  const currentTuan = tuans.find(t => t.id === currentUser.tuanId);

  const earnedCats = getEarnedCategories(currentUser.id);
  const completedSkills = getCompletedSkills(currentUser.id);

  return (
    <div className="min-h-screen bg-slate-100 pb-24 font-sans selection:bg-red-200">
      
      <div className="bg-red-800 text-white sticky top-0 z-20 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => setCurrentUser(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors flex items-center space-x-2">
            <ArrowLeft size={20} /> <span className="hidden sm:inline font-medium">Danh sách</span>
          </button>
          <div className="flex-1 text-center font-bold text-lg">{currentUser.name}</div>
          <div className="w-10"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 flex space-x-1 overflow-x-auto no-scrollbar pb-2">
          {[
            { id: 'profile', label: 'Hồ Sơ' },
            { id: 'laws', label: 'Luật & Lời Hứa' },
            { id: 'ranks', label: 'Đẳng Thứ' },
            { id: 'badges', label: 'Năng Hiệu' },
            { id: 'documents', label: 'Tài Liệu' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setCurrentView(tab.id)} className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${currentView === tab.id ? 'bg-white text-red-800 shadow-sm' : 'text-red-100 hover:bg-white/10'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">

        {/* --- VIEW: HỒ SƠ KHA SINH --- */}
        {currentView === 'profile' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldCheck size={150} />
              </div>
              <div className="flex items-start space-x-6 relative z-10">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-md text-slate-400 overflow-hidden shrink-0">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover bg-white" />
                  ) : (
                    <User size={40} />
                  )}
                </div>
                <div className="flex-1 pt-2">
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    {currentUser.name}
                    {isAdmin && (
                      <button onClick={() => setEditingUser(currentUser)} className="text-slate-300 hover:text-blue-600 transition-colors" title="Sửa thông tin Kha sinh">
                        <Edit3 size={20} />
                      </button>
                    )}
                  </h2>
                  <div className="flex flex-wrap gap-4 mt-3 items-center">
                    {isAdmin ? (
                      <div className="flex items-center text-slate-600 text-sm font-medium bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                        <Target size={16} className="mr-2 text-slate-400" />
                        <select className="bg-transparent border-none outline-none font-bold text-slate-700 cursor-pointer" value={currentUser.tuanId} onChange={(e) => handleChangeUserTuan(e.target.value)}>
                          {tuans.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          <option value="">(Bỏ trống)</option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-center text-slate-600 text-sm font-medium bg-slate-100 px-3 py-1 rounded-lg">
                        {currentTuan?.logo ? (
                          <img src={currentTuan.logo} alt={currentTuan.name} className="w-5 h-5 mr-2 rounded-full object-cover border border-slate-300 bg-white" />
                        ) : (
                          <Target size={16} className="mr-2 text-slate-400" /> 
                        )}
                        {currentTuan ? currentTuan.name : 'Chưa phân Tuần'}
                      </div>
                    )}

                    <div className="flex items-center text-slate-600 text-sm font-medium bg-slate-100 px-3 py-1 rounded-lg">
                      <Calendar size={16} className="mr-2 text-slate-400" /> {currentUser.dob}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Đẳng thứ hiện tại</p>
                  <div className="text-xl font-bold text-red-800 flex items-center">
                    {(() => {
                      const currentRankData = RANKS.find(r => r.name === activeRank);
                      const rankLogo = currentRankData ? (customLogos[currentRankData.id]?.logo || currentRankData.logo) : null;
                      
                      return rankLogo ? (
                        <img src={rankLogo} alt={activeRank} className="w-8 h-8 mr-3 object-contain drop-shadow-sm bg-white rounded-full" />
                      ) : (
                        <Medal size={24} className="mr-2" /> 
                      );
                    })()}
                    {activeRank}
                  </div>
                </div>
                {isAdmin && (
                  <select 
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-red-800 focus:border-red-800 block p-2.5 font-medium"
                    value={activeRank}
                    onChange={(e) => updateCurrentRank(e.target.value)}
                  >
                    {RANKS.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                  </select>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  <Award className="mr-2 text-amber-500" /> Chuyên Hiệu Đã Đạt
                </h3>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">{earnedCats.length}/5</span>
              </div>
              
              {earnedCats.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Star className="mx-auto mb-2 opacity-50" size={32} />
                  <p className="text-sm font-medium">Hoàn thành 2 năng hiệu cùng nhóm<br/>để nhận Chuyên hiệu tương ứng.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {earnedCats.map(cat => {
                    const catLogo = customLogos[cat.id]?.logo || cat.logo;
                    return (
                      <div key={cat.id} className={`p-4 rounded-2xl border-2 flex items-center space-x-4 bg-${cat.color}-50 border-${cat.color}-200`}>
                        <div className={`w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden p-1 border border-${cat.color}-200 shrink-0`}>
                          {catLogo ? (
                            <img src={catLogo} alt={cat.name} className="w-full h-full object-contain" />
                          ) : (
                            <div className={`p-3 rounded-full bg-${cat.color}-500 text-white shadow-md`}><Award size={24} /></div>
                          )}
                        </div>
                        <div>
                          <p className={`font-bold text-${cat.color}-900 text-sm`}>{cat.name}</p>
                          <p className={`text-xs font-medium text-${cat.color}-700 mt-1`}>Đã đủ điều kiện</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
               <h3 className="text-lg font-bold text-slate-800 flex items-center mb-6">
                  <CheckCircle2 className="mr-2 text-emerald-500" /> Năng Hiệu Đã Đạt ({completedSkills.length})
               </h3>
               <div className="flex flex-wrap gap-2">
                 {completedSkills.length === 0 ? (
                   <p className="text-sm text-slate-400 italic">Chưa có năng hiệu nào hoàn thành.</p>
                 ) : (
                   completedSkills.map(skill => (
                     <span key={skill} className="bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-xl">
                       {skill}
                     </span>
                   ))
                 )}
               </div>
            </div>

            {isAdmin && (
               <div className="pt-8 flex justify-center">
                 <button onClick={handleDeleteUser} className="flex items-center space-x-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-6 py-3 rounded-xl font-bold transition-colors">
                   <Trash2 size={20} /> <span>Xóa Kha sinh này khỏi hệ thống</span>
                 </button>
               </div>
            )}
          </div>
        )}

        {/* MODAL: SỬA HỒ SƠ KHA SINH */}
        {editingUser && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl my-8">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Sửa Hồ Sơ Kha Sinh</h3>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
                  <input type="text" required className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-800 outline-none" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày sinh (DD/MM/YYYY)</label>
                  <input type="text" placeholder="Ví dụ: 15/05/2006" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-800 outline-none" value={editingUser.dob} onChange={e => setEditingUser({...editingUser, dob: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ảnh Đại Diện</label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                      <label className="cursor-pointer bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 border border-slate-300 flex items-center">
                        <Upload size={16} className="mr-2" /> Chọn ảnh
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (base64) => setEditingUser({...editingUser, avatar: base64}))} />
                      </label>
                    </div>
                  </div>
                  {editingUser.avatar && (
                    <div className="mt-2 w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm flex items-center justify-center bg-white">
                      <img src={editingUser.avatar} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setEditingUser(null)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Hủy</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md">Lưu Thay Đổi</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- VIEW: LUẬT VÀ LỜI HỨA --- */}
        {currentView === 'laws' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center">
                  <HeartHandshake className="mr-2 text-red-800" /> Luật & Lời Hứa
                </h3>
                <p className="text-sm text-slate-500 mt-1">Các giá trị cốt lõi và điều cần ghi nhớ của một Kha sinh.</p>
              </div>
              {isAdmin && (
                <button onClick={() => setShowAddLawModal(true)} className="flex items-center space-x-2 bg-red-800 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-red-900 transition-colors">
                  <Plus size={16} /><span>Thêm Nội Dung</span>
                </button>
              )}
            </div>

            {['Lời Hứa', 'Luật Hướng Đạo', 'Châm Ngôn', 'Điều Cần Nhớ'].map(cat => {
              const items = laws.filter(l => l.category === cat);
              if (items.length === 0 && !isAdmin) return null; 
              
              return (
                <div key={cat} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 p-5 border-b border-slate-100 flex items-center justify-between">
                     <h3 className="text-lg font-black text-slate-800">{cat}</h3>
                  </div>
                  <div className="p-2 sm:p-4 divide-y divide-slate-100">
                     {items.length === 0 ? (
                       <p className="p-4 text-sm text-slate-400 italic">Chưa có nội dung.</p>
                     ) : (
                       items.map(item => (
                         <div key={item.id} className="p-4 flex justify-between items-start group hover:bg-slate-50 rounded-2xl transition-colors">
                           <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                             {item.content}
                           </div>
                           {isAdmin && (
                             <button onClick={() => handleDeleteLaw(item.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all" title="Xóa nội dung này">
                               <Trash2 size={18} />
                             </button>
                           )}
                         </div>
                       ))
                     )}
                  </div>
                </div>
              );
            })}

            {showAddLawModal && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                  <h3 className="text-xl font-bold mb-4 text-slate-800">Thêm Nội Dung Mới</h3>
                  <form onSubmit={handleAddLaw} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phân loại</label>
                      <select className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-800 outline-none" value={newLaw.category} onChange={e => setNewLaw({...newLaw, category: e.target.value})}>
                        <option value="Lời Hứa">Lời Hứa</option>
                        <option value="Luật Hướng Đạo">Luật Hướng Đạo</option>
                        <option value="Châm Ngôn">Châm Ngôn</option>
                        <option value="Điều Cần Nhớ">Điều Cần Nhớ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung</label>
                      <textarea rows="5" required className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-800 outline-none" value={newLaw.content} onChange={e => setNewLaw({...newLaw, content: e.target.value})}></textarea>
                    </div>
                    <div className="flex space-x-3 pt-4">
                      <button type="button" onClick={() => setShowAddLawModal(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Hủy</button>
                      <button type="submit" className="flex-1 px-4 py-3 bg-red-800 text-white rounded-xl font-bold hover:bg-red-900 shadow-md">Thêm</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW: ĐẲNG THỨ --- */}
        {currentView === 'ranks' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-blue-50 text-blue-800 p-4 rounded-2xl border border-blue-200 flex items-start space-x-3 text-sm">
              <BookOpen size={20} className="shrink-0 mt-0.5" />
              <p>Phần này dành cho <strong>Huynh trưởng</strong> đánh giá tiến độ rèn luyện tổng quát của Kha sinh. Kha sinh chỉ có thể xem.</p>
            </div>

            {RANKS.map(rank => {
              const rankLogo = customLogos[rank.id]?.logo || rank.logo;
              return (
                <div key={rank.id} className={`bg-white rounded-3xl overflow-hidden shadow-sm border ${activeRank === rank.name ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'}`}>
                  <div className={`px-6 py-4 flex items-center justify-between ${activeRank === rank.name ? 'bg-red-50' : 'bg-slate-50'}`}>
                    <div className="flex items-center space-x-3">
                      <div className="relative group shrink-0 flex items-center justify-center w-12 h-12 rounded-full overflow-hidden bg-white shadow-sm border-2 border-slate-100">
                        {rankLogo && <img src={rankLogo} alt={rank.name} className="w-10 h-10 object-contain drop-shadow-sm" />}
                        {isAdmin && (
                          <label className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center cursor-pointer text-white transition-all backdrop-blur-sm" title="Đổi Logo Đẳng Thứ">
                            <Upload size={16} />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (base64) => handleCustomLogoUpload(rank.id, base64))} />
                          </label>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-slate-800">{rank.name}</h3>
                    </div>
                    {activeRank === rank.name && <span className="bg-red-800 text-white text-xs font-bold px-3 py-1 rounded-full">Đang rèn luyện</span>}
                  </div>
                  <div className="p-2">
                    {rank.criteria.map((cri, idx) => {
                      const isChecked = (userData.ranks || {})[`${rank.id}_${idx}`];
                      return (
                        <div key={idx} 
                          onClick={() => updateRankCriteria(rank.id, idx)}
                          className={`flex items-start space-x-4 p-4 rounded-2xl transition-colors ${isAdmin ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                        >
                          <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-transparent'}`}>
                            <CheckCircle2 size={16} />
                          </div>
                          <p className={`text-sm sm:text-base font-medium ${isChecked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {cri}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- VIEW: NĂNG HIỆU --- */}
        {currentView === 'badges' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {CATEGORIES.map(cat => {
              const completedInCat = cat.skills.filter(s => userData.badges[s] === STATUS.COMPLETED).length;
              const hasEarnedMainBadge = completedInCat >= 2;
              const catLogo = customLogos[cat.id]?.logo || cat.logo;

              return (
                <div key={cat.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className={`p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${hasEarnedMainBadge ? `bg-${cat.color}-50` : 'bg-slate-50'}`}>
                    <div className="flex items-center space-x-4">
                      <div className="relative group shrink-0">
                        <div className={`w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden p-1 border border-${cat.color}-200`}>
                          <img src={catLogo} alt={cat.name} className="w-full h-full object-contain" />
                        </div>
                        {isAdmin && (
                          <label className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center cursor-pointer rounded-full text-white transition-all backdrop-blur-sm" title="Đổi Logo Chuyên Hiệu">
                            <Upload size={20} />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (base64) => handleCustomLogoUpload(cat.id, base64))} />
                          </label>
                        )}
                      </div>
                      
                      <div>
                        <h2 className={`text-xl font-black ${hasEarnedMainBadge ? `text-${cat.color}-800` : 'text-slate-800'}`}>
                          {cat.name}
                        </h2>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                          Tiến độ: <span className={hasEarnedMainBadge ? `text-${cat.color}-600 font-bold` : ''}>{completedInCat}</span> / {cat.skills.length} Năng hiệu
                        </p>
                      </div>
                    </div>
                    
                    {hasEarnedMainBadge && (
                      <div className={`flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-${cat.color}-200`}>
                        <Award className={`text-${cat.color}-500`} size={20} />
                        <span className={`text-sm font-bold text-${cat.color}-700`}>Đã đạt Chuyên Hiệu</span>
                      </div>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100">
                    {cat.skills.map(skill => {
                      const status = userData.badges[skill] || STATUS.UNREGISTERED;
                      const skillLogo = customLogos[skill]?.logo || getSkillLogo(skill);
                      
                      return (
                        <div key={skill} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="relative group">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 overflow-hidden bg-white
                                ${status === STATUS.COMPLETED ? 'border-emerald-500 shadow-sm' : 
                                  status === STATUS.IN_PROGRESS ? 'border-amber-400 border-dashed' : 
                                  'border-slate-200 opacity-50 grayscale'}`}
                              >
                                <img src={skillLogo} alt={skill} className="w-full h-full object-cover p-1" />
                              </div>

                              {isAdmin && (
                                <label className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center cursor-pointer rounded-2xl text-white transition-all backdrop-blur-sm" title="Đổi Logo Năng Hiệu">
                                  <Upload size={20} />
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (base64) => handleCustomLogoUpload(skill, base64))} />
                                </label>
                              )}

                              {status === STATUS.COMPLETED && (
                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white pointer-events-none">
                                  <CheckCircle2 size={14} />
                                </div>
                              )}
                              {status === STATUS.IN_PROGRESS && (
                                <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white rounded-full p-0.5 border-2 border-white pointer-events-none">
                                  <Clock size={14} />
                                </div>
                              )}
                            </div>
                            <h3 className={`font-bold text-base sm:text-lg ${status === STATUS.COMPLETED ? 'text-slate-800' : 'text-slate-600'}`}>
                              {skill}
                            </h3>
                          </div>

                          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto ml-14 sm:ml-0">
                            {!isAdmin && status === STATUS.COMPLETED ? (
                              <div className="px-6 py-2 text-sm font-bold text-emerald-600 w-full text-center">
                                Đã được xác nhận
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => updateBadge(skill, STATUS.UNREGISTERED)}
                                  className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                                    status === STATUS.UNREGISTERED ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                  }`}
                                >
                                  Chưa ĐK
                                </button>
                                <button
                                  onClick={() => updateBadge(skill, STATUS.IN_PROGRESS)}
                                  className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                                    status === STATUS.IN_PROGRESS ? 'bg-amber-400 text-amber-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                  }`}
                                >
                                  Đang rèn
                                </button>
                                
                                {isAdmin && (
                                  <button
                                    onClick={() => updateBadge(skill, STATUS.COMPLETED)}
                                    className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                                      status === STATUS.COMPLETED ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                  >
                                    Đã đạt
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- VIEW: TÀI LIỆU --- */}
        {currentView === 'documents' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center">
                  <FileText className="mr-2 text-red-800" /> Thư Viện Tài Liệu
                </h3>
                <p className="text-sm text-slate-500 mt-1">Nơi lưu trữ các tài liệu học tập, chuyên hiệu của Kha Đoàn.</p>
              </div>
              {isAdmin && (
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button onClick={() => setShowAddCategoryModal(true)} className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors border border-slate-200">
                    <Plus size={16} /><span>Thêm Danh Mục</span>
                  </button>
                  <button onClick={() => setShowAddDocModal(true)} className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-red-800 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-red-900 transition-colors">
                    <Plus size={16} /><span>Thêm Tài Liệu</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-8">
              {docCategories.length === 0 && documents.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-sm">
                  <BookOpen className="mx-auto mb-3 opacity-50" size={40} />
                  <p className="font-medium">Chưa có tài liệu nào.</p>
                </div>
              ) : (
                docCategories.map(cat => {
                  const catDocs = documents.filter(d => d.categoryId === cat.id);
                  return (
                    <div key={cat.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden p-0.5 border border-slate-200 shrink-0">
                            {cat.avatar ? (
                              <img src={cat.avatar} alt={cat.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <div className="p-2 rounded-full bg-slate-200 text-slate-500"><BookOpen size={20} /></div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-slate-800">{cat.name}</h3>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">{catDocs.length} tài liệu</p>
                          </div>
                        </div>
                        {isAdmin && (
                          <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Xóa danh mục này">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {catDocs.length === 0 ? (
                          <div className="col-span-full py-6 text-center text-sm text-slate-400 italic">
                            Chưa có tài liệu trong danh mục này.
                          </div>
                        ) : (
                          catDocs.map(doc => (
                            <div key={doc.id} className="relative bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-md transition-all group">
                              <div className="flex items-start space-x-4 pr-6">
                                <div className="p-3 bg-red-100 text-red-800 rounded-xl shrink-0">
                                  <FileText size={20} />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-slate-800 line-clamp-1">{doc.title}</h4>
                                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{doc.description}</p>
                                  <a href={doc.link !== '#' ? doc.link : undefined} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center text-xs font-bold text-blue-600 hover:underline">
                                    <LinkIcon size={14} className="mr-1" /> Xem tài liệu
                                  </a>
                                </div>
                              </div>
                              {isAdmin && (
                                <button onClick={() => handleDeleteDoc(doc.id, doc.title)} className="absolute top-3 right-3 p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors" title="Xóa tài liệu này">
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              
              {documents.filter(d => !d.categoryId || !docCategories.find(c => c.id === d.categoryId)).length > 0 && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden p-0.5 border border-slate-200 shrink-0">
                      <div className="p-2 rounded-full bg-slate-200 text-slate-500"><BookOpen size={20} /></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800">Chưa phân loại</h3>
                    </div>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.filter(d => !d.categoryId || !docCategories.find(c => c.id === d.categoryId)).map(doc => (
                      <div key={doc.id} className="relative bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-md transition-all group">
                        <div className="flex items-start space-x-4 pr-6">
                          <div className="p-3 bg-red-100 text-red-800 rounded-xl shrink-0">
                            <FileText size={20} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 line-clamp-1">{doc.title}</h4>
                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{doc.description}</p>
                            <a href={doc.link !== '#' ? doc.link : undefined} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center text-xs font-bold text-blue-600 hover:underline">
                              <LinkIcon size={14} className="mr-1" /> Xem tài liệu
                            </a>
                          </div>
                        </div>
                        {isAdmin && (
                          <button onClick={() => handleDeleteDoc(doc.id, doc.title)} className="absolute top-3 right-3 p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors" title="Xóa tài liệu này">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {showAddDocModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl my-8">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Thêm Tài Liệu Mới</h3>
              <form onSubmit={handleAddDoc} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên tài liệu</label>
                  <input type="text" required className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-800 outline-none" value={newDoc.title} onChange={e => setNewDoc({...newDoc, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục</label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-800 outline-none" value={newDoc.categoryId} onChange={e => setNewDoc({...newDoc, categoryId: e.target.value})}>
                    {docCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    {docCategories.length === 0 && <option value="">(Chưa có danh mục)</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả ngắn</label>
                  <textarea rows="2" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-800 outline-none" value={newDoc.description} onChange={e => setNewDoc({...newDoc, description: e.target.value})}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Đính kèm File</label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                      <label className="cursor-pointer bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 border border-slate-300 flex items-center">
                        <Upload size={16} className="mr-2" /> Chọn File từ máy
                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, (base64) => setNewDoc({...newDoc, link: base64}))} />
                      </label>
                    </div>
                    <input type="text" placeholder="https://..." className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-800 outline-none text-sm" value={newDoc.link} onChange={e => setNewDoc({...newDoc, link: e.target.value})} />
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setShowAddDocModal(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Hủy</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-red-800 text-white rounded-xl font-bold hover:bg-red-900 shadow-md">Thêm</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAddCategoryModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl my-8">
              <h3 className="text-xl font-bold mb-4 text-slate-800">Thêm Danh Mục Tài Liệu</h3>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên danh mục</label>
                  <input type="text" required placeholder="VD: Kỹ năng sinh tồn..." className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-800 outline-none" value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ảnh đại diện (Avatar)</label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                      <label className="cursor-pointer bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 border border-slate-300 flex items-center">
                        <Upload size={16} className="mr-2" /> Chọn ảnh
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (base64) => setNewCategory({...newCategory, avatar: base64}))} />
                      </label>
                    </div>
                  </div>
                  {newCategory.avatar && (
                    <div className="mt-2 w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm">
                      <img src={newCategory.avatar} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setShowAddCategoryModal(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Hủy</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-red-800 text-white rounded-xl font-bold hover:bg-red-900 shadow-md">Thêm</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
