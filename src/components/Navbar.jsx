import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fonts } from '../utils/fonts';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    try { await logout(); navigate('/login'); } catch (err) { console.error(err); }
  }

  const isActive = (path) => location.pathname === path;
  const links = [
    { to: '/dashboard', label: 'Boshqaruv', emoji: '🏠' },
    { to: '/create', label: 'Test Tuzish', emoji: '📝' },
    { to: '/solve', label: 'Test Yechish', emoji: '🧠' },
  ];

  if (!currentUser) return null;

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(51,65,85,0.5)', padding: '0 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#f1f5f9' }}>
          <div style={{ width: 36, height: 36, background: '#10b981', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏆</div>
          <span style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>Quiz<span style={{ color: '#34d399' }}>App</span></span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none', color: isActive(l.to) ? '#10b981' : '#64748b', background: isActive(l.to) ? 'rgba(16,185,129,0.1)' : 'transparent', border: isActive(l.to) ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent', fontFamily: fonts.display }}>
              <span>{l.emoji}</span> {l.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, background: 'rgba(16,185,129,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.3)', fontSize: 14, fontWeight: 700, color: '#10b981', fontFamily: fonts.display }}>
              {currentUser.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#cbd5e1', fontFamily: fonts.display }}>{currentUser.displayName || 'Foydalanuvchi'}</p>
              <p style={{ fontSize: 12, color: '#475569', fontFamily: fonts.body }}>{currentUser.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ padding: 8, borderRadius: 8, color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18 }} title="Chiqish">🚪</button>
        </div>
      </div>
    </nav>
  );
}