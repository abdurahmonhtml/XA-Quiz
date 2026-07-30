import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTests } from '../hooks/useTests';
import { useAdmin } from '../hooks/useAdmin';
import Navbar from '../components/Navbar';
import { fonts } from '../utils/fonts';
import toast from 'react-hot-toast';

export default function CreateTest() {
  const { tests, loading, addTest, updateTest, deleteTest } = useTests();
  const { canCreate } = useAdmin();
  const navigate = useNavigate();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [difficulty, setDifficulty] = useState('easy');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    const id = await addTest({ question, options, correctIndex, difficulty });
    if (id) { setQuestion(''); setOptions(['', '', '']); setCorrectIndex(0); setDifficulty('easy'); }
    setSubmitting(false);
  }

  function startEdit(test) {
    setEditingId(test.id);
    setEditForm({ question: test.question, options: [...test.options], correctIndex: test.correctIndex, difficulty: test.difficulty });
  }

  async function handleSaveEdit(id) {
    const ok = await updateTest(id, editForm);
    if (ok) { setEditingId(null); setEditForm(null); }
  }

  async function handleDelete(id) {
    const ok = await deleteTest(id);
    if (ok) setDeleteConfirm(null);
  }

  const inputStyle = { width: '100%', padding: '12px 16px', background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 12, color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: fonts.body };
  const letters = ['A', 'B', 'C'];
  const diffLabels = { easy: 'Oson', medium: "O'rta", hard: 'Qiyin' };
  const diffColors = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };

  // Ruxsat yo'q bo'lsa
  if (!canCreate) {
    return (
      <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.body }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 64, marginBottom: 16 }}>🔒</p>
          <h2 style={{ fontFamily: fonts.display, fontSize: 24, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Ruxsat yo'q</h2>
          <p style={{ color: '#64748b', marginBottom: 24, fontFamily: fonts.body }}>Faqat admin ruxsat bergan foydalanuvchilar test tuzishi mumkin</p>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 24px', background: '#10b981', color: '#020617', fontWeight: 700, borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: fonts.display }}>← Boshqaruv paneliga qaytish</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020617', fontFamily: fonts.body }}>
      <Navbar />
      <div style={{ padding: '32px 16px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ color: '#10b981', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, fontFamily: fonts.display }}>📝 Test Tuzish</p>
          <h1 style={{ fontFamily: fonts.display, fontSize: 36, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-1px' }}>Yangi test yarating</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 32, alignItems: 'start' }}>
          {/* Forma */}
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 20, padding: 24, position: 'sticky', top: 80 }}>
            <h2 style={{ fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 24 }}>❓ Savol qo'shish</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: 14, fontWeight: 500, marginBottom: 8, fontFamily: fonts.body }}>Test savoli</label>
                <textarea value={question} onChange={(e) => setQuestion(e.target.value)} style={{ ...inputStyle, resize: 'none' }} rows={3} placeholder="Savol matnini kiriting..." required />
              </div>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: 14, fontWeight: 500, marginBottom: 8, fontFamily: fonts.body }}>Javob variantlari</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {options.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button type="button" onClick={() => setCorrectIndex(i)} style={{
                        width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `2px solid ${correctIndex === i ? '#10b981' : 'rgba(51,65,85,0.5)'}`,
                        background: correctIndex === i ? 'rgba(16,185,129,0.1)' : 'transparent',
                        color: correctIndex === i ? '#10b981' : '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: fonts.display
                      }}>
                        {correctIndex === i ? '✓' : letters[i]}
                      </button>
                      <input type="text" value={opt} onChange={(e) => { const n = [...options]; n[i] = e.target.value; setOptions(n); }} style={inputStyle} placeholder={`Variant ${letters[i]}`} required />
                    </div>
                  ))}
                </div>
                <p style={{ color: '#475569', fontSize: 12, marginTop: 8, fontFamily: fonts.body }}>✓ To'g'ri javobni belgilash uchun chapdagi tugmani bosing</p>
              </div>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: 14, fontWeight: 500, marginBottom: 8, fontFamily: fonts.body }}>Qiyinlik darajasi</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['easy', 'medium', 'hard'].map(d => (
                    <button key={d} type="button" onClick={() => setDifficulty(d)} style={{
                      flex: 1, padding: '10px 12px', borderRadius: 12, border: `2px solid ${difficulty === d ? diffColors[d] : 'rgba(51,65,85,0.5)'}`,
                      background: difficulty === d ? `${diffColors[d]}15` : 'transparent',
                      color: difficulty === d ? diffColors[d] : '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: fonts.display
                    }}>
                      {diffLabels[d]}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={submitting} style={{ width: '100%', padding: '12px 24px', background: '#10b981', color: '#020617', fontWeight: 700, fontSize: 14, borderRadius: 12, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.5 : 1, fontFamily: fonts.display, letterSpacing: '0.5px' }}>
                {submitting ? 'Kutilmoqda...' : "➕ Testni qo'shish"}
              </button>
            </form>
          </div>

          {/* Testlar ro'yxati */}
          <div>
            <h2 style={{ fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 24 }}>📚 Barcha testlar ({tests.length})</h2>
            {loading ? <p style={{ color: '#64748b', textAlign: 'center' }}>Yuklanmoqda...</p> : tests.length === 0 ? (
              <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 20, padding: 48, textAlign: 'center' }}>
                <p style={{ fontSize: 48, marginBottom: 16 }}>❓</p>
                <h3 style={{ color: '#cbd5e1', fontSize: 18, fontWeight: 500, marginBottom: 8, fontFamily: fonts.display }}>Hali testlar yo'q</h3>
                <p style={{ color: '#475569', fontFamily: fonts.body }}>Yuqoridagi forma orqali birinchi testni qo'shing</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {tests.map((test) => (
                  <div key={test.id} style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 20, padding: 20 }}>
                    {editingId === test.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <textarea value={editForm.question} onChange={(e) => setEditForm({ ...editForm, question: e.target.value })} style={{ ...inputStyle, resize: 'none' }} rows={2} />
                        {editForm.options.map((opt, oi) => (
                          <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button onClick={() => setEditForm({ ...editForm, correctIndex: oi })} style={{
                              width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: `2px solid ${editForm.correctIndex === oi ? '#10b981' : 'rgba(51,65,85,0.5)'}`,
                              background: editForm.correctIndex === oi ? 'rgba(16,185,129,0.1)' : 'transparent',
                              color: editForm.correctIndex === oi ? '#10b981' : '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: fonts.display
                            }}>
                              {editForm.correctIndex === oi ? '✓' : letters[oi]}
                            </button>
                            <input type="text" value={opt} onChange={(e) => { const n = [...editForm.options]; n[oi] = e.target.value; setEditForm({ ...editForm, options: n }); }} style={inputStyle} />
                          </div>
                        ))}
                        <div style={{ display: 'flex', gap: 8 }}>
                          {['easy', 'medium', 'hard'].map(d => (
                            <button key={d} onClick={() => setEditForm({ ...editForm, difficulty: d })} style={{
                              flex: 1, padding: '10px 12px', borderRadius: 12, border: `2px solid ${editForm.difficulty === d ? diffColors[d] : 'rgba(51,65,85,0.5)'}`,
                              background: editForm.difficulty === d ? `${diffColors[d]}15` : 'transparent',
                              color: editForm.difficulty === d ? diffColors[d] : '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: fonts.display
                            }}>
                              {diffLabels[d]}
                            </button>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <button onClick={() => handleSaveEdit(test.id)} style={{ padding: '8px 16px', background: '#10b981', color: '#020617', fontWeight: 700, borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14, fontFamily: fonts.display }}>💾 Saqlash</button>
                          <button onClick={() => { setEditingId(null); setEditForm(null); }} style={{ padding: '8px 16px', background: 'rgba(51,65,85,0.8)', color: '#f1f5f9', fontWeight: 500, borderRadius: 12, border: '1px solid rgba(51,65,85,0.5)', cursor: 'pointer', fontSize: 14, fontFamily: fonts.display }}>✕ Bekor qilish</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                              <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: `${diffColors[test.difficulty]}15`, color: diffColors[test.difficulty], border: `1px solid ${diffColors[test.difficulty]}30`, fontFamily: fonts.display }}>
                                {diffLabels[test.difficulty]}
                              </span>
                              <span style={{ color: '#475569', fontSize: 12, fontFamily: fonts.body }}>{test.creatorName} tomonidan</span>
                            </div>
                            <h3 style={{ color: '#f1f5f9', fontWeight: 500, marginBottom: 12, fontSize: 15, fontFamily: fonts.body }}>{test.question}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {test.options.map((opt, oi) => (
                                <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, fontSize: 14, background: oi === test.correctIndex ? 'rgba(16,185,129,0.1)' : 'transparent', color: oi === test.correctIndex ? '#10b981' : '#64748b', border: oi === test.correctIndex ? '1px solid rgba(16,185,129,0.2)' : 'none', fontFamily: fonts.body }}>
                                  <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>{letters[oi]})</span>
                                  {opt}
                                  {oi === test.correctIndex && <span style={{ marginLeft: 'auto' }}>✓</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <button onClick={() => startEdit(test)} style={{ padding: 10, borderRadius: 8, color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16 }} title="Tahrirlash">✏️</button>
                            <button onClick={() => setDeleteConfirm(test.id)} style={{ padding: 10, borderRadius: 8, color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16 }} title="O'chirish">🗑️</button>
                          </div>
                        </div>
                        {deleteConfirm === test.id && (
                          <div style={{ marginTop: 16, padding: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12 }}>
                            <p style={{ color: '#ef4444', fontSize: 14, fontWeight: 500, marginBottom: 12, fontFamily: fonts.body }}>⚠️ Haqiqatanham o'chirmoqchimisiz?</p>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => handleDelete(test.id)} style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontWeight: 600, borderRadius: 12, border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontSize: 14, fontFamily: fonts.display }}>Ha, o'chirish</button>
                              <button onClick={() => setDeleteConfirm(null)} style={{ padding: '8px 16px', background: 'rgba(51,65,85,0.8)', color: '#f1f5f9', fontWeight: 500, borderRadius: 12, border: '1px solid rgba(51,65,85,0.5)', cursor: 'pointer', fontSize: 14, fontFamily: fonts.display }}>Bekor qilish</button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}