import { useState, useEffect } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fonts } from '../utils/fonts';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const { role, isAdmin, fetchAllUsers, setUserRole, removeUserRole } = useAdmin();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchAllUsers();
      setUsers(data);
      setLoading(false);
    }
    if (isAdmin) load();
  }, [isAdmin]);

  async function handleSetRole(uid, newRole) {
    const ok = await setUserRole(uid, newRole);
    if (ok) {
      toast.success(`Rol o'zgartirildi: ${newRole === 'admin' ? 'Admin' : 'Test Yaratuvchi'}`);
      const data = await fetchAllUsers();
      setUsers(data);
    } else {
      toast.error("Xatolik yuz berdi");
    }
  }

  async function handleRemoveRole(uid) {
    const ok = await removeUserRole(uid);
    if (ok) {
      toast.success("Ruxsat olib tashlandi");
      const data = await fetchAllUsers();
      setUsers(data);
    } else {
      toast.error("Xatolik yuz berdi");
    }
  }

  const roleLabels = { admin: 'Admin', creator: 'Test Yaratuvchi', user: 'Oddiy Foydalanuvchi' };
  const roleColors = { admin: '#ef4444', creator: '#10b981', user: '#64748b' };
  const roleBg = { admin: 'rgba(239,68,68,0.1)', creator: 'rgba(16,185,129,0.1)', user: 'rgba(100,116,139,0.1)' };
  const roleBorder = { admin: 'rgba(239,68,68,0.3)', creator: 'rgba(16,185,129,0.3)', user: 'rgba(100,116,139,0.3)' };

  // Admin bo'lmasa ruxsat yo'q
  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.body }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 64, marginBottom: 16 }}>🔒</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: 24, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Ruxsat yo'q</h2>
          <p style={{ color: '#64748b', marginBottom: 24 }}>Faqat adminlar bu sahifaga kira oladi</p>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 24px', background: '#10b981', color: '#020617', fontWeight: 700, borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: fonts.display }}>← Boshqaruv paneliga qaytish</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020617', fontFamily: fonts.body }}>
      <Navbar />
      <div style={{ padding: '32px 16px', maxWidth: 1000, margin: '0 auto' }}>
        {/* Sarlavha */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ color: '#ef4444', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, fontFamily: fonts.display }}>🔒 Admin Panel</p>
          <h1 style={{ fontFamily: fonts.display, fontSize: 36, fontWeight: 800, color: '#f1f5f9', marginBottom: 8, letterSpacing: '-1px' }}>Foydalanuvchilarni boshqarish</h1>
          <p style={{ color: '#64748b', fontSize: 16 }}>Test tuzishga ruxsat berish yoki olib tashlash</p>
        </div>

        {/* Ruxsat turlari */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>👑</p>
            <p style={{ fontFamily: fonts.display, fontWeight: 700, color: '#ef4444', fontSize: 14, marginBottom: 4 }}>Admin</p>
            <p style={{ color: '#64748b', fontSize: 12 }}>Barcha ruxsatlar + boshqarish</p>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>✍️</p>
            <p style={{ fontFamily: fonts.display, fontWeight: 700, color: '#10b981', fontSize: 14, marginBottom: 4 }}>Test Yaratuvchi</p>
            <p style={{ color: '#64748b', fontSize: 12 }}>Test tuzish + yechish</p>
          </div>
          <div style={{ background: 'rgba(100,116,139,0.05)', border: '1px solid rgba(100,116,139,0.2)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>👤</p>
            <p style={{ fontFamily: fonts.display, fontWeight: 700, color: '#64748b', fontSize: 14, marginBottom: 4 }}>Oddiy Foydalanuvchi</p>
            <p style={{ color: '#64748b', fontSize: 12 }}>Faqat test yechish</p>
          </div>
        </div>

        {/* Foydalanuvchilar ro'yxati */}
        <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 20, padding: 24 }}>
          <h2 style={{ fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>👥 Foydalanuvchilar ({users.length})</h2>

          {loading ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: 32 }}>Yuklanmoqda...</p>
          ) : users.length === 0 ? (
            <p style={{ color: '#475569', textAlign: 'center', padding: 32 }}>Hali foydalanuvchilar yo'q</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {users.map((u) => (
                <div key={u.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 16, borderRadius: 16, flexWrap: 'wrap', gap: 12,
                  background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(51,65,85,0.3)'
                }}>
                  {/* Foydalanuvchi ma'lumotlari */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: roleBg[u.role] || roleBg.user, border: `1px solid ${roleBorder[u.role] || roleBorder.user}`,
                      fontSize: 14, fontWeight: 700, color: roleColors[u.role] || roleColors.user, fontFamily: fonts.display
                    }}>
                      {u.displayName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p style={{ color: '#f1f5f9', fontWeight: 600, fontFamily: fonts.display, fontSize: 14 }}>{u.displayName || "Noma'lum"}</p>
                      <p style={{ color: '#475569', fontSize: 12, fontFamily: fonts.body }}>{u.email}</p>
                    </div>
                  </div>

                  {/* Rol va tugmalar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {/* Joriy rol */}
                    <span style={{
                      padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      background: roleBg[u.role] || roleBg.user, color: roleColors[u.role] || roleColors.user,
                      border: `1px solid ${roleBorder[u.role] || roleBorder.user}`, fontFamily: fonts.display
                    }}>
                      {roleLabels[u.role] || 'Oddiy Foydalanuvchi'}
                    </span>

                    {/* Admin bo'lmaganlar uchun tugmalar */}
                    {u.role !== 'admin' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        {u.role !== 'creator' && (
                          <button onClick={() => handleSetRole(u.id, 'creator')} style={{
                            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                            background: 'rgba(16,185,129,0.1)', color: '#10b981',
                            border: '1px solid rgba(16,185,129,0.3)', cursor: 'pointer',
                            fontFamily: fonts.display, transition: 'all 0.2s ease'
                          }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.2)'}
                             onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}>
                            ✍️ Test Yaratuvchi qilish
                          </button>
                        )}
                        {u.role === 'creator' && (
                          <button onClick={() => handleRemoveRole(u.id)} style={{
                            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                            background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                            border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer',
                            fontFamily: fonts.display, transition: 'all 0.2s ease'
                          }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                             onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                            🚫 Ruxsatni olib tashlash
                          </button>
                        )}
                        <button onClick={() => handleSetRole(u.id, 'admin')} style={{
                          padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                          background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                          border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer',
                          fontFamily: fonts.display, transition: 'all 0.2s ease'
                        }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                           onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                          👑 Admin qilish
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}