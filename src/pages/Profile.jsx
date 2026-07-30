import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import { updateProfile } from 'firebase/auth';
import Navbar from '../components/Navbar';
import { fonts } from '../utils/fonts';
import toast from 'react-hot-toast';

export default function Profile() {
  const { currentUser } = useAuth();
  const { role, isAdmin, canCreate } = useAdmin();
  const fileInputRef = useRef(null);

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [photoURL, setPhotoURL] = useState('');
  const [savedPhotoURL, setSavedPhotoURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stats, setStats] = useState({ totalTests: 0, correctAnswers: 0, wrongAnswers: 0, bestScore: 0 });
  const [editing, setEditing] = useState(false);

  // Ma'lumotlarni yuklash
  useEffect(() => {
    async function loadProfile() {
      if (!currentUser) return;
      try {
        const userDoc = await getDocs(collection(db, 'users'));
        userDoc.docs.forEach(d => {
          if (d.id === currentUser.uid) {
            const data = d.data();
            if (data.photoURL) {
              setPhotoURL(data.photoURL);
              setSavedPhotoURL(data.photoURL);
            }
          }
        });
      } catch (err) {
        console.error('loadProfile xatosi:', err);
      }
    }
    loadProfile();
  }, [currentUser]);

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

  // Rasm yuklash
  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Fayl turini tekshirish
    if (!file.type.startsWith('image/')) {
      toast.error('Faqat rasm fayllarini yuklang');
      return;
    }

    // Hajmni tekshirish (5MB gacha)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Rasm hajmi 5MB dan oshmasligi kerak');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Firebase Storage ga yuklash
      const storageRef = ref(storage, `profiles/${currentUser.uid}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      setUploadProgress(50);

      // Yuklangan rasm URL ni olish
      const url = await getDownloadURL(snapshot.ref);
      setUploadProgress(100);

      setPhotoURL(url);
      toast.success('Rasm yuklandi! Saqlash tugmasini bosing');
    } catch (err) {
      console.error('Upload xatosi:', err);
      toast.error('Rasm yuklashda xatolik yuz berdi');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  // Profilni saqlash
  async function handleSave() {
    setLoading(true);
    try {
      await updateProfile(currentUser, { displayName: displayName, photoURL: photoURL });
      await setDoc(doc(db, 'users', currentUser.uid), {
        displayName: displayName,
        photoURL: photoURL,
        role: role,
        email: currentUser.email,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setSavedPhotoURL(photoURL);
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
          {/* Avatar */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
            {savedPhotoURL ? (
              <img src={savedPhotoURL} alt="Avatar"
                style={{
                  width: 120, height: 120, borderRadius: '50%',
                  border: '4px solid rgba(16,185,129,0.3)',
                  objectFit: 'cover', background: 'rgba(16,185,129,0.1)'
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : null}
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              border: '4px solid rgba(16,185,129,0.3)',
              background: 'rgba(16,185,129,0.1)',
              display: savedPhotoURL ? 'none' : 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 48, fontWeight: 800, color: '#10b981',
              fontFamily: fonts.display
            }}>
              {displayName?.[0]?.toUpperCase() || 'U'}
            </div>

            {/* Rasm o'zgartirish tugmasi — avatar ustida */}
            <button onClick={() => fileInputRef.current?.click()} style={{
              position: 'absolute', bottom: 4, right: 4,
              width: 36, height: 36, borderRadius: '50%',
              background: '#10b981', border: '3px solid #020617',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 16, color: '#020617'
            }} title="Rasm yuklash">
              📷
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Yuklanmoqda */}
          {uploading && (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                width: '100%', maxWidth: 200, margin: '0 auto',
                height: 6, background: 'rgba(51,65,85,0.5)', borderRadius: 10, overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%', background: '#10b981', borderRadius: 10,
                  transition: 'width 0.3s ease',
                  width: `${uploadProgress}%`
                }} />
              </div>
              <p style={{ color: '#10b981', fontSize: 12, marginTop: 8, fontFamily: fonts.body }}>
                Rasm yuklanmoqda...
              </p>
            </div>
          )}

          {/* Ism */}
          <h1 style={{ fontFamily: fonts.display, fontSize: 28, fontWeight: 800, color: '#f1f5f9', marginBottom: 8, letterSpacing: '-0.5px' }}>
            {displayName || 'Foydalanuvchi'}
          </h1>

          {/* Email */}
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16, fontFamily: fonts.body }}>
            {currentUser?.email}
          </p>

          {/* Rol badge */}
          <span style={{
            padding: '6px 16px', borderRadius: 10, fontSize: 14, fontWeight: 700,
            background: roleBg[role] || roleBg.user,
            color: roleColors[role] || roleColors.user,
            border: `1px solid ${roleBorder[role] || roleBorder.user}`,
            fontFamily: fonts.display, display: 'inline-block', marginBottom: 8
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
              {/* Ism */}
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: 14, fontWeight: 500, marginBottom: 8, fontFamily: fonts.body }}>Ismingiz</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{
                  width: '100%', padding: '12px 16px', background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(51,65,85,0.5)',
                  borderRadius: 12, color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: fonts.body
                }} placeholder="Ismingizni kiriting" />
              </div>

              {/* Rasm yuklash */}
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: 14, fontWeight: 500, marginBottom: 8, fontFamily: fonts.body }}>Profil rasmi</label>

                {/* Rasmni ko'rish */}
                {photoURL && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                    <img src={photoURL} alt="Preview" style={{
                      width: 64, height: 64, borderRadius: '50%', objectFit: 'cover',
                      border: '2px solid rgba(16,185,129,0.3)'
                    }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div>
                      <p style={{ color: '#cbd5e1', fontSize: 13, fontFamily: fonts.body }}>Joriy rasm</p>
                      <button onClick={() => setPhotoURL('')} style={{
                        padding: '4px 10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                        border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, cursor: 'pointer',
                        fontSize: 11, fontWeight: 600, fontFamily: fonts.display, marginTop: 4
                      }}>🗑️ Olib tashlash</button>
                    </div>
                  </div>
                )}

                {/* Yuklash tugmasi */}
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{
                  width: '100%', padding: '14px 16px', background: 'rgba(16,185,129,0.08)',
                  border: '2px dashed rgba(16,185,129,0.3)', borderRadius: 12, cursor: uploading ? 'not-allowed' : 'pointer',
                  color: '#10b981', fontWeight: 600, fontSize: 14, fontFamily: fonts.display,
                  opacity: uploading ? 0.5 : 1, transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}>
                  {uploading ? '⏳ Yuklanmoqda...' : '📁 Rasm yuklash'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <p style={{ color: '#475569', fontSize: 11, marginTop: 6, fontFamily: fonts.body }}>
                  PNG, JPG, GIF — 5MB gacha
                </p>

                {/* Yuklash progress */}
                {uploading && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{
                      height: 4, background: 'rgba(51,65,85,0.5)', borderRadius: 10, overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%', background: '#10b981', borderRadius: 10,
                        transition: 'width 0.3s ease', width: `${uploadProgress}%`
                      }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Yoki URL orqali */}
              <div>
                <label style={{ display: 'block', color: '#64748b', fontSize: 12, fontWeight: 500, marginBottom: 6, fontFamily: fonts.body }}>
                  Yoki rasm URL manzilini kiriting:
                </label>
                <input type="url" value={photoURL} onChange={(e) => setPhotoURL(e.target.value)} style={{
                  width: '100%', padding: '10px 16px', background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(51,65,85,0.5)',
                  borderRadius: 12, color: '#f1f5f9', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: fonts.body
                }} placeholder="https://misol.com/rasm.jpg" />
              </div>

              {/* Saqlash */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={handleSave} disabled={loading} style={{
                  padding: '12px 24px', background: '#10b981', color: '#020617',
                  fontWeight: 700, fontSize: 14, borderRadius: 12, border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, fontFamily: fonts.display
                }}>{loading ? 'Saqlanmoqda...' : '💾 Saqlash'}</button>
                <button onClick={() => { setEditing(false); setDisplayName(currentUser?.displayName || ''); setPhotoURL(savedPhotoURL); }} style={{
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