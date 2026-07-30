import { useState } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { fonts } from '../utils/fonts';

export default function Leaderboard({ showDifficulty = null }) {
  const [filter, setFilter] = useState(showDifficulty || 'all');
  const { results, loading } = useLeaderboard({ difficulty: filter === 'all' ? null : filter, limitCount: 20 });
  const [userPhotos, setUserPhotos] = useState({});

  // Foydalanuvchi rasmlarini yuklash
  useState(() => {
    async function loadPhotos() {
      try {
        const snapshot = await getDocs(collection(db, 'users'));
        const photos = {};
        snapshot.docs.forEach(d => {
          const data = d.data();
          if (data.photoURL) photos[d.id] = data.photoURL;
        });
        setUserPhotos(photos);
      } catch (err) {
        console.error('Photos xatosi:', err);
      }
    }
    loadPhotos();
  });

  const diffLabels = { easy: 'Oson', medium: "O'rta", hard: 'Qiyin' };
  const diffColors = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };
  const filters = [ { value: 'all', label: 'Hammasi' }, { value: 'easy', label: 'Oson' }, { value: 'medium', label: "O'rta" }, { value: 'hard', label: 'Qiyin' } ];
  const rankIcon = (i) => { if (i === 0) return '🥇'; if (i === 1) return '🥈'; if (i === 2) return '🥉'; return `${i + 1}`; };

  return (
    <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 20, padding: 24, fontFamily: fonts.body }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>🔥 Reyting</h3>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: filter === f.value ? 'rgba(16,185,129,0.1)' : 'transparent',
              color: filter === f.value ? '#10b981' : '#475569',
              border: filter === f.value ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
              cursor: 'pointer', fontFamily: fonts.display
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      {loading ? <p style={{ color: '#64748b', textAlign: 'center', padding: 32 }}>Yuklanmoqda...</p> : results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48 }}><p style={{ fontSize: 48, marginBottom: 12 }}>🏆</p><p style={{ color: '#475569' }}>Hali natijalar mavjud emas</p></div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(51,65,85,0.5)', fontFamily: fonts.display }}>#</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(51,65,85,0.5)', fontFamily: fonts.display }}>Foydalanuvchi</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(51,65,85,0.5)', fontFamily: fonts.display }}>Daraja</th>
              <th style={{ textAlign: 'center', padding: '12px 8px', color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(51,65,85,0.5)', fontFamily: fonts.display }}>Natija</th>
              <th style={{ textAlign: 'center', padding: '12px 8px', color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid rgba(51,65,85,0.5)', fontFamily: fonts.display }}>Foiz</th>
            </tr></thead>
            <tbody>{results.map((r, i) => {
              const photo = userPhotos[r.userId];
              return (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(30,41,59,0.5)' }}>
                  <td style={{ padding: '12px 8px', fontSize: 16 }}>{rankIcon(i)}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {photo ? (
                        <img src={photo} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(16,185,129,0.2)' }} />
                      ) : (
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.2)',
                          fontSize: 13, fontWeight: 700, color: '#10b981', fontFamily: fonts.display
                        }}>
                          {r.userName?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <span style={{ color: '#cbd5e1', fontWeight: 600, fontSize: 14, fontFamily: fonts.display }}>{r.userName || "Noma'lum"}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px' }}><span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: `${diffColors[r.difficulty]}15`, color: diffColors[r.difficulty], border: `1px solid ${diffColors[r.difficulty]}30`, fontFamily: fonts.display }}>{diffLabels[r.difficulty]}</span></td>
                  <td style={{ padding: '12px 8px', color: '#64748b', textAlign: 'center', fontSize: 14, fontFamily: fonts.body }}>{r.correctAnswers}/{r.totalQuestions}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, fontWeight: 700, color: r.percentage >= 80 ? '#10b981' : r.percentage >= 50 ? '#f59e0b' : '#ef4444', fontFamily: fonts.display }}>{r.percentage}%</td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}