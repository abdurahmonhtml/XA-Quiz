import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { fonts } from '../utils/fonts';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [photoURL, setPhotoURL] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
      if (snap.exists() && snap.data().photoURL) {
        setPhotoURL(snap.data().photoURL);
      } else {
        setPhotoURL('');
      }
    }, () => setPhotoURL(''));
    return () => unsub();
  }, [currentUser]);

  async function handleLogout() {
    try { await logout(); navigate('/login'); } catch (err) { console.error(err); }
  }

  const isActive = (path) => location.pathname === path;

  const links = [
    { to: '/dashboard', label: 'Boshqaruv', emoji: '🏠' },
    { to: '/create', label: 'Test Tuzish', emoji: '📝' },
    { to: '/solve', label: 'Test Yechish', emoji: '🧠' },
  ];

  if (isAdmin) {
    links.push({ to: '/admin', label: 'Admin', emoji: '👑' });
  }

  if (!currentUser) return null;

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(51,65,85,0.5)', padding: '0 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, flexWrap: 'wrap', gap: 8 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#f1f5f9' }}>
          <div style={{ width: 36, height: 36, background: '#10b981', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏆</div>
          <span style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>Quiz<span style={{ color: '#34d399' }}>App</span></span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          {links.map((l) => {
            const isAdminLink = l.to === '/admin';
            const activeColor = isAdminLink ? '#ef4444' : '#10b981';
            const activeBg = isAdminLink ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)';
            const activeBorder = isAdminLink ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)';
            return (
              <Link key={l.to} to={l.to} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10,
                fontSize: 14, fontWeight: 500, textDecoration: 'none',
                color: isActive(l.to) ? activeColor : '#64748b',
                background: isActive(l.to) ? activeBg : 'transparent',
                border: isActive(l.to) ? `1px solid ${activeBorder}` : '1px solid transparent',
                fontFamily: fonts.display
              }}>
                <span>{l.emoji}</span> {l.label}
              </Link>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/profile')} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '4px 12px 4px 4px',
            borderRadius: 50, background: isActive('/profile') ? 'rgba(16,185,129,0.1)' : 'rgba(30,41,59,0.5)',
            border: isActive('/profile') ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(51,65,85,0.3)',
            cursor: 'pointer', transition: 'all 0.2s ease'
          }}>
            {photoURL ? (
              <img src={photoURL} alt="Avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                onError={(e) => { e.target.style.display = 'none'; }} />
            ) : null}
            <div style={{
              width: 32, height: 32, borderRadius: '50%', display: photoURL ? 'none' : 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              fontSize: 14, fontWeight: 700, color: '#10b981', fontFamily: fonts.display
            }}>
              {currentUser.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600, fontFamily: fonts.display }}>
              {currentUser.displayName || 'Profil'}
            </span>
          </button>
          <button onClick={handleLogout} style={{ padding: 8, borderRadius: 8, color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18 }} title="Chiqish">🚪</button>
        </div>
      </div>
    </nav>
  );
}