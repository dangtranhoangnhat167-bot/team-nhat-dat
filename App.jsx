import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, query, onSnapshot, addDoc, 
  updateDoc, deleteDoc, doc, serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, onAuthStateChanged 
} from 'firebase/auth';
import { 
  Plus, Copy, CheckCircle2, Circle, Clock, Trash2, 
  Users, User, ShieldCheck, ClipboardList, Check, Bell, Calendar, LogOut
} from 'lucide-react';

// Cấu hình Firebase của gia đình ông Nhật
const firebaseConfig = {
  apiKey: "AIzaSyD-edPH5OKzgkTLoz4WpyltyLo0ahKKnjk",
  authDomain: "teamnhadatnhatnhi.firebaseapp.com",
  projectId: "teamnhadatnhatnhi",
  storageBucket: "teamnhadatnhatnhi.firebasestorage.app",
  messagingSenderId: "476226553016",
  appId: "1:476226553016:web:78fd6151200eedb7d5604d",
  measurementId: "G-WHFRJ40X1F"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'team-nha-dat-nhat-nhi-final';

const App = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(localStorage.getItem('userRole') || null);
  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const [newTask, setNewTask] = useState({ title: '', time: '09:00', platform: 'Zalo/Facebook', content: '' });

  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (e) { console.error(e); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'tasks');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(taskList.sort((a, b) => a.time.localeCompare(b.time)));
    }, (error) => {
      console.error("Firestore error:", error);
    });
    return () => unsubscribe();
  }, [user]);

  const addTask = async () => {
    if (!newTask.title || !user) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'tasks'), {
        ...newTask, completed: false, createdAt: serverTimestamp()
      });
      setNewTask({ title: '', time: '09:00', platform: 'Zalo/Facebook', content: '' });
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTask = async (task) => {
    if (!user) return;
    const taskRef = doc(db, 'artifacts', appId, 'public', 'data', 'tasks', task.id);
    await updateDoc(taskRef, {
      completed: !task.completed,
      completedAt: !task.completed ? serverTimestamp() : null
    });
  };

  const deleteTask = async (id) => {
    if (role !== 'manager' || !user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tasks', id));
  };

  const copyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopyStatus('Đã copy!');
    setTimeout(() => setCopyStatus(''), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold">Đang kết nối...</div>;

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-orange-600 p-4 rounded-3xl mb-6 shadow-xl"><Users size={48} className="text-white" /></div>
        <h1 className="text-2xl font-bold mb-2 text-center">Team Nhà Đất Nhật - Nhị</h1>
        <p className="text-slate-500 mb-10 text-center text-sm">Hệ thống đồng bộ lịch gia đình</p>
        <div className="w-full max-w-sm space-y-4">
          <button onClick={() => {setRole('manager'); localStorage.setItem('userRole', 'manager');}} className="w-full bg-white p-6 rounded-2xl shadow-sm flex items-center gap-4 active:scale-95 transition-transform border border-transparent hover:border-orange-500 text-left">
            <ShieldCheck className="text-orange-600" /> 
            <div><div className="font-bold text-slate-800">Ông Nhật</div><div className="text-xs text-slate-500">Chọn nhà, soạn tin giao cho vk</div></div>
          </button>
          <button onClick={() => {setRole('staff'); localStorage.setItem('userRole', 'staff');}} className="w-full bg-white p-6 rounded-2xl shadow-sm flex items-center gap-4 active:scale-95 transition-transform border border-transparent hover:border-green-500 text-left">
            <User className="text-green-600" /> 
            <div><div className="font-bold text-slate-800">Bà Nhị</div><div className="text-xs text-slate-500">Xem lịch đăng tin của ck</div></div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl relative">
      <header className="bg-white px-6 pt-8 pb-4 border-b flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-lg font-bold flex items-center gap-2">
          {role === 'manager' ? <ShieldCheck className="text-orange-600" /> : <User className="text-green-600" />}
          Team Nhật - Nhị
        </h1>
        <button onClick={() => { setRole(null); localStorage.removeItem('userRole'); }} className="p-2"><LogOut size={20} className="text-slate-400" /></button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {tasks.length === 0 ? (
          <div className="text-center py-20 opacity-30 flex flex-col items-center">
            <ClipboardList size={64} className="mb-4" />
            <p>Chưa có lịch đăng nào</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className={`p-4 mb-3 rounded-2xl border transition-all ${task.completed ? 'bg-green-50 border-green-100' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <button onClick={() => toggleTask(task)} className="mt-1">{task.completed ? <CheckCircle2 className="text-green-500 w-7 h-7" /> : <Circle className="text-slate-300 w-7 h-7" />}</button>
                  <div>
                    <h3 className={`font-bold text-base ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</h3>
                    <div className="flex gap-2 mt-2 text-[10px] font-bold">
                      <span className="bg-slate-100 p-1 rounded px-2"><Clock size={10} className="inline mr-1"/> {task.time}</span>
                      <span className="text-orange-600 border border-orange-100 p-1 rounded px-2">{task.platform}</span>
                    </div>
                  </div>
                </div>
                {role === 'manager' && <button onClick={() => deleteTask(task.id)} className="p-1"><Trash2 size={16} className="text-slate-300" /></button>}
              </div>
              {task.content && !task.completed && (
                <div className="mt-3 bg-slate-50 p-3 rounded-xl relative text-sm italic text-slate-600 pr-12 border border-slate-100">
                  {task.content}
                  <button onClick={() => copyToClipboard(task.content)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg shadow-sm border text-orange-600"><Copy size={16} /></button>
                </div>
              )}
              {task.completed && <div className="mt-2 text-[10px] text-green-600 font-bold text-right">✓ Xong lúc {task.completedAt?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>}
            </div>
          ))
        )}
      </main>

      {role === 'manager' && (
        <button onClick={() => setShowAddModal(true)} className="fixed bottom-10 right-6 w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-2xl z-20 active:scale-90 transition-transform"><Plus size={32} /></button>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end p-4 z-50">
          <div className="bg-white w-full rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <h2 className="font-bold text-xl mb-6 flex items-center gap-2"><Plus className="text-orange-600" /> Ông Nhật giao việc</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Tên căn nhà</label>
                <input type="text" placeholder="VD: Nhà hẻm Q1 giá 5 tỷ" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Giờ đăng</label>
                  <input type="time" className="w-full p-4 bg-slate-50 rounded-2xl border" value={newTask.time} onChange={e => setNewTask({...newTask, time: e.target.value})} />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Nền tảng</label>
                  <select className="w-full p-4 bg-slate-50 rounded-2xl border appearance-none" value={newTask.platform} onChange={e => setNewTask({...newTask, platform: e.target.value})}>
                    <option>Zalo/Facebook</option><option>Chợ Tốt</option><option>BDS.com.vn</option><option>TikTok/Reels</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Nội dung bà Nhị copy</label>
                <textarea placeholder="Dán nội dung tin đăng tại đây..." className="w-full p-4 bg-slate-50 rounded-2xl border text-sm" rows="4" value={newTask.content} onChange={e => setNewTask({...newTask, content: e.target.value})}></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-slate-400 font-bold">Bỏ qua</button>
                <button onClick={addTask} className="flex-2 py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-100">Giao ngay</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {copyStatus && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-medium animate-bounce z-50">{copyStatus}</div>}
    </div>
  );
};

export default App;
