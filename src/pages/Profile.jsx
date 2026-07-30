import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { updateProfile } from 'firebase/auth';
import Navbar from '../components/Navbar';
import { fonts } from '../utils/fonts';
import toast from 'react-hot-toast';

export default function Profile() {
  const { currentUser } = useAuth();
  const { role, isAdmin, canCreate } = useAdmin();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalTests: 0, correctAnswers: 0, wrongAnswers: 0, bestScore: 0 });
  const [editing, setEditing] = useState(false);

  // Statistikani yuklash
  useEffect(() => {
    async function loadStats() {
      if (!currentUser) return;
      try {
        const q = query(collection(db, 'results'), where('userId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        let total = 0, correct = 0, wrong = 0, best = 0;
        snapshot.docs.forEach(d => {
          const data = d.data();
          total += data.totalQuestions || 0;
          correct += data.correctAnswers || 0;
          wrong += data.wrongAnswers || 0;
          if (data.percentage > best) best = data.percentage;
        });
        setStats({ totalTests: snapshot.size, correctAnswers: correct, wrongAnswers: wrong, bestScore: best });
      } catch (err) {
        console.error('Stats xatosi:', err);
      }
    }
    loadStats();
  }, [currentUser]);

  // Profilni saqlash
  async function handleSave() {
    setLoading(true);
    try {
      await updateProfile(currentUser, { displayName: displayName });
      await setDoc(doc(db, 'users', currentUser.uid), {
        displayName: displayName,
        role: role,
        email: currentUser.email,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setEditing(false);
      toast.success('Profil yangilandi!');
    } catch (err) {
      console.error(err);
      toast.error('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }

  const roleLabels = { admin: 'Admin', creator: 'Test Yaratuvchi', user: 'Foydalanuvchi' };
  const roleColors = { admin: '#ef4444', creator: '#10b981', user: '#64748b' };
  const roleBg = { admin: 'rgba(239,68,68,0.1)', creator: 'rgba(16,185,129,0.1)', user: 'rgba(100,116,139,0.1)' };
  const roleBorder = { admin: 'rgba(239,68,68,0.3)', creator: 'rgba(16,185,129,0.3)', user: 'rgba(100,116,139,0.3)' };

  return (
    <div style={{ minHeight: '100vh', background: '#020617', fontFamily: fonts.body }}>
      <Navbar />
      <div style={{ padding: '32px 16px', maxWidth: 800, margin: '0 auto' }}>

        {/* Profil kartasi */}
        <div style={{
          background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)',
          borderRadius: 24, padding: 32, marginBottom: 32, textAlign: 'center'
        }}>
          {/* Avatar harf */}
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            border: '4px solid rgba(16,185,129,0.3)',
            background: 'rgba(16,185,129,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 48, fontWeight: 800, color: '#10b981',
            fontFamily: fonts.display, margin: '0 auto 16px'
          }}>
            {displayName?.[0]?.toUpperCase() || 'U'}
          </div>

          <h1 style={{ fontFamily: fonts.display, fontSize: 28, fontWeight: 800, color: '#f1f5f9', marginBottom: 8, letterSpacing: '-0.5px' }}>
            {displayName || 'Foydalanuvchi'}
          </h1>

          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16, fontFamily: fonts.body }}>
            {currentUser?.email}
          </p>

          <span style={{
            padding: '6px 16px', borderRadius: 10, fontSize: 14, fontWeight: 700,
            background: roleBg[role] || roleBg.user,
            color: roleColors[role] || roleColors.user,
            border: `1px solid ${roleBorder[role] || roleBorder.user}`,
            fontFamily: fonts.display, display: 'inline-block'
          }}>
            {role === 'admin' ? '👑' : role === 'creator' ? '✍️' : '👤'} {roleLabels[role] || 'Foydalanuvchi'}
          </span>
        </div>

        {/* Statistika */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 16, marginBottom: 32
        }}>
          <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#10b981', fontFamily: fonts.display }}>{stats.totalTests}</p>
            <p style={{ color: '#64748b', fontSize: 13, fontFamily: fonts.body }}>Testlar soni</p>
          </div>
          <div style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#34d399', fontFamily: fonts.display }}>{stats.correctAnswers}</p>
            <p style={{ color: '#64748b', fontSize: 13, fontFamily: fonts.body }}>To'g'ri javoblar</p>
          </div>
          <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#ef4444', fontFamily: fonts.display }}>{stats.wrongAnswers}</p>
            <p style={{ color: '#64748b', fontSize: 13, fontFamily: fonts.body }}>Noto'g'ri javoblar</p>
          </div>
          <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b', fontFamily: fonts.display }}>{stats.bestScore}%</p>
            <p style={{ color: '#64748b', fontSize: 13, fontFamily: fonts.body }}>Eng yaxshi natija</p>
          </div>
        </div>

        {/* Tahrirlash */}
        <div style={{
          background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)',
          borderRadius: 20, padding: 24
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>✏️ Profilni tahrirlash</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} style={{
                padding: '8px 16px', background: 'rgba(16,185,129,0.1)', color: '#10b981',
                border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, cursor: 'pointer',
                fontWeight: 600, fontSize: 13, fontFamily: fonts.display
              }}>Tahrirlash</button>
            )}
          </div>

          {editing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: 14, fontWeight: 500, marginBottom: 8, fontFamily: fonts.body }}>Ismingiz</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{
                  width: '100%', padding: '12px 16px', background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(51,65,85,0.5)',
                  borderRadius: 12, color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: fonts.body
                }} placeholder="Ismingizni kiriting" />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={handleSave} disabled={loading} style={{
                  padding: '12px 24px', background: '#10b981', color: '#020617',
                  fontWeight: 700, fontSize: 14, borderRadius: 12, border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, fontFamily: fonts.display
                }}>{loading ? 'Saqlanmoqda...' : '💾 Saqlash'}</button>
                <button onClick={() => { setEditing(false); setDisplayName(currentUser?.displayName || ''); }} style={{
                  padding: '12px 24px', background: 'rgba(51,65,85,0.8)', color: '#f1f5f9',
                  fontWeight: 500, fontSize: 14, borderRadius: 12, border: '1px solid rgba(51,65,85,0.5)', cursor: 'pointer', fontFamily: fonts.display
                }}>Bekor qilish</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}