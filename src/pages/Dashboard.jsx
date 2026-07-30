import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Leaderboard from '../components/Leaderboard';
import { fonts } from '../utils/fonts';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { canCreate, isAdmin } = useAdmin();
  const navigate = useNavigate();

  const cardStyle = {
    padding: 32, cursor: 'pointer', borderRadius: 20,
    background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#020617', fontFamily: fonts.body }}>
      <Navbar />
      <div style={{ padding: '32px 16px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <p style={{ color: '#10b981', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, fontFamily: fonts.display }}>⚡ Boshqaruv Paneli</p>
          <h1 style={{ fontFamily: fonts.display, fontSize: 36, fontWeight: 800, color: '#f1f5f9', marginBottom: 8, letterSpacing: '-1px' }}>
            Xush kelibsiz, <span style={{ color: '#34d399' }}>{currentUser?.displayName || 'Foydalanuvchi'}</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 18, fontFamily: fonts.body }}>
            {isAdmin ? '👑 Siz adminsiz — barcha ruxsatlar mavjud' :
             canCreate ? '✍️ Siz test tuzish huquqiga egasiz' :
             '👤 Test yechish uchun quyidagi tugmani bosing'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 40 }}>
          {canCreate ? (
            <div onClick={() => navigate('/create')} style={cardStyle}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(51,65,85,0.5)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📝</div>
              <h2 style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 8, letterSpacing: '-0.3px' }}>Test Tuzish</h2>
              <p style={{ color: '#64748b', marginBottom: 24, fontFamily: fonts.body }}>Yangi test savollari yarating va Firebase'ga yuboring</p>
              <span style={{ padding: '10px 20px', background: '#10b981', color: '#020617', fontWeight: 700, borderRadius: 12, fontSize: 14, display: 'inline-block', fontFamily: fonts.display, letterSpacing: '0.5px' }}>Boshlash →</span>
            </div>
          ) : (
            <div style={{ ...cardStyle, cursor: 'default', opacity: 0.5 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
              <h2 style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 700, color: '#475569', marginBottom: 8, letterSpacing: '-0.3px' }}>Test Tuzish</h2>
              <p style={{ color: '#475569', marginBottom: 24, fontFamily: fonts.body }}>Admin ruxsat bergan foydalanuvchilar test tuzishi mumkin</p>
              <span style={{ padding: '10px 20px', background: 'rgba(100,116,139,0.2)', color: '#64748b', fontWeight: 600, borderRadius: 12, fontSize: 14, display: 'inline-block', fontFamily: fonts.display }}>Ruxsat yo'q</span>
            </div>
          )}
          <div onClick={() => navigate('/solve')} style={cardStyle}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(51,65,85,0.5)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🧠</div>
            <h2 style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 8, letterSpacing: '-0.3px' }}>Test Yechish</h2>
            <p style={{ color: '#64748b', marginBottom: 24, fontFamily: fonts.body }}>Mavjud testlarni yeching, vaqt bilan bahslashing</p>
            <span style={{ padding: '10px 20px', background: '#f59e0b', color: '#020617', fontWeight: 700, borderRadius: 12, fontSize: 14, display: 'inline-block', fontFamily: fonts.display, letterSpacing: '0.5px' }}>Boshlash →</span>
          </div>
        </div>

        <Leaderboard />
      </div>
    </div>
  );
}