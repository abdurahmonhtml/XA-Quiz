import { useState, useEffect, useCallback, useRef } from 'react';
import { useTests } from '../hooks/useTests';
import { useResults } from '../hooks/useResults';
import Navbar from '../components/Navbar';
import Leaderboard from '../components/Leaderboard';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
// Faylning boshiga qo'shing:
import { fonts } from '../utils/fonts';

// Barcha fontFamily: 'Space Grotesk, sans-serif' ni -> fontFamily: fonts.display ga almashtiring
// Barcha fontFamily: 'DM Sans, sans-serif' ni -> fontFamily: fonts.body ga almashtiring
// Barcha fontWeight: 700 ni -> fontWeight: 800 ga almashtiring (Outfit boldroq ko'rinadi)

const TIME_PER_Q = { easy: 30, medium: 25, hard: 20 };

export default function SolveTest() {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const { tests, loading: loadingTests, fetchByDifficulty } = useTests({ realtime: false, shuffle: true });
  const { saving, saveResult } = useResults();

  const [phase, setPhase] = useState('select');
  const [difficulty, setDifficulty] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [result, setResult] = useState(null);

  async function handleFetchTests(diff) {
    const data = await fetchByDifficulty(diff);
    if (data && data.length > 0) {
      setDifficulty(diff); setAnswers({}); setCurrentIndex(0);
      setTestStarted(false); setPhase('testing');
      setTimeLeft(data.length * TIME_PER_Q[diff]);
    }
  }

  const stopTimer = useCallback(() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => { if (prev <= 1) { clearInterval(timerRef.current); return 0; } return prev - 1; });
    }, 1000);
  }, [stopTimer]);

  const finishTest = useCallback(() => {
    stopTimer();
    let correct = 0, wrong = 0, unanswered = 0;
    tests.forEach((t, i) => {
      if (answers[i] === undefined) unanswered++;
      else if (answers[i] === t.correctIndex) correct++;
      else wrong++;
    });
    const pct = tests.length > 0 ? Math.round((correct / tests.length) * 100) : 0;
    const data = { difficulty, totalQuestions: tests.length, answeredQuestions: correct + wrong, correctAnswers: correct, wrongAnswers: wrong, unanswered, percentage: pct, timeUsed: tests.length * TIME_PER_Q[difficulty] - timeLeft };
    setResult(data); setPhase('result');
    saveResult(data);
  }, [tests, answers, difficulty, timeLeft, stopTimer, saveResult]);

  useEffect(() => { if (timeLeft === 0 && testStarted && phase === 'testing') finishTest(); }, [timeLeft, testStarted, phase, finishTest]);
  useEffect(() => { return () => stopTimer(); }, [stopTimer]);

  function restartTest() { setPhase('select'); setDifficulty(null); setAnswers({}); setCurrentIndex(0); setTimeLeft(0); setResult(null); setTestStarted(false); }

  function formatTime(s) { return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`; }

  const letters = ['A', 'B', 'C'];
  const diffLabels = { easy: 'Oson', medium: "O'rta", hard: 'Qiyin' };
  const diffColors = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };
  const diffEmojis = { easy: '🟢', medium: '🟡', hard: '🔴' };

  // ===== QIYINLIK TANLASH =====
  if (phase === 'select') {
    return (
      <div style={{ minHeight: '100vh', background: '#020617' }}>
        <Navbar />
        <div style={{ padding: '32px 16px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 32 }}>
            <p style={{ color: '#f59e0b', fontSize: 13, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>🧠 Test Yechish</p>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 36, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Qiyinlik darajasini tanlang</h1>
            <p style={{ color: '#64748b', fontSize: 18 }}>Har bir darajada savollar va vaqt farq qiladi</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 48 }}>
            {['easy', 'medium', 'hard'].map(d => (
              <div key={d} onClick={() => handleFetchTests(d)} style={{
                padding: 32, borderRadius: 20, cursor: 'pointer', background: 'rgba(30,41,59,0.6)', border: `1px solid ${diffColors[d]}40`,
                transition: 'all 0.3s ease'
              }} onMouseEnter={e => { e.currentTarget.style.borderColor = diffColors[d]; e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = `${diffColors[d]}40`; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{diffEmojis[d]}</div>
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{diffLabels[d]}</h3>
                <p style={{ color: '#64748b', marginBottom: 8 }}>{d === 'easy' ? 'Oddiy savollar' : d === 'medium' ? "O'rta qiyinlik" : 'Murakkab savollar'}</p>
                <p style={{ color: '#475569', fontSize: 14, marginBottom: 24 }}>⏱ Har bir savolga {TIME_PER_Q[d]} soniya</p>
                <span style={{ padding: '10px 20px', background: diffColors[d], color: '#020617', fontWeight: 600, borderRadius: 12, fontSize: 14, display: 'inline-block' }}>▶ Boshlash</span>
              </div>
            ))}
          </div>
          <Leaderboard />
        </div>
      </div>
    );
  }

  // ===== TEST YECHISH =====
  if (phase === 'testing') {
    const current = tests[currentIndex];
    const answeredCount = Object.keys(answers).length;
    const progress = tests.length > 0 ? (answeredCount / tests.length) * 100 : 0;
    const timerColor = timeLeft <= 10 ? '#ef4444' : timeLeft <= 30 ? '#f59e0b' : '#f1f5f9';

    return (
      <div style={{ minHeight: '100vh', background: '#020617' }}>
        <Navbar />
        <div style={{ padding: '32px 16px', maxWidth: 900, margin: '0 auto' }}>
          {/* Yuqori panel */}
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 20, padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', borderRadius: 12, background: timeLeft <= 10 ? 'rgba(239,68,68,0.1)' : timeLeft <= 30 ? 'rgba(245,158,11,0.1)' : 'rgba(51,65,85,0.5)', border: `1px solid ${timeLeft <= 10 ? 'rgba(239,68,68,0.3)' : timeLeft <= 30 ? 'rgba(245,158,11,0.3)' : 'rgba(51,65,85,0.3)'}` }}>
              <span style={{ fontSize: 16 }}>⏱</span>
              <span style={{ fontFamily: 'Space Grotesk, monospace', fontSize: 20, fontWeight: 700, color: timerColor }}>{formatTime(timeLeft)}</span>
            </div>
            <div style={{ flex: 1, maxWidth: 400 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                <span>{answeredCount}/{tests.length} javob berildi</span>
                <span>{currentIndex + 1} / {tests.length}</span>
              </div>
              <div style={{ height: 8, background: '#1e293b', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: 10, transition: 'width 0.5s ease', width: `${progress}%` }} />
              </div>
            </div>
            <button onClick={finishTest} style={{ padding: '12px 24px', background: '#10b981', color: '#020617', fontWeight: 600, fontSize: 14, borderRadius: 12, border: 'none', cursor: 'pointer' }}>🏆 Yakunlash</button>
          </div>

          {!testStarted ? (
            <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 20, padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: 64, marginBottom: 24 }}>▶</div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 24, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>Testga tayyormisiz?</h2>
              <p style={{ color: '#64748b', marginBottom: 8 }}><strong style={{ color: '#cbd5e1' }}>{tests.length}</strong> ta savol mavjud</p>
              <p style={{ color: '#475569', marginBottom: 24 }}>Umumiy vaqt: <strong style={{ color: '#cbd5e1' }}>{formatTime(tests.length * TIME_PER_Q[difficulty])}</strong></p>
              <button onClick={() => { setTestStarted(true); startTimer(); }} style={{ padding: '16px 32px', background: '#10b981', color: '#020617', fontWeight: 600, fontSize: 16, borderRadius: 12, border: 'none', cursor: 'pointer' }}>⚡ Boshlash</button>
            </div>
          ) : (
            <div key={currentIndex}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: `${diffColors[difficulty]}15`, color: diffColors[difficulty], border: `1px solid ${diffColors[difficulty]}30` }}>{diffLabels[difficulty]}</span>
                <span style={{ color: '#475569', fontSize: 14 }}>Savol {currentIndex + 1} / {tests.length}</span>
              </div>
              <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 20, padding: 32, marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.5 }}>{current.question}</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {current.options.map((opt, oi) => (
                  <button key={oi} onClick={() => setAnswers(p => ({ ...p, [currentIndex]: oi }))} style={{
                    width: '100%', textAlign: 'left', padding: '16px 20px', borderRadius: 12,
                    border: `2px solid ${answers[currentIndex] === oi ? '#10b981' : 'rgba(51,65,85,0.4)'}`,
                    background: answers[currentIndex] === oi ? 'rgba(16,185,129,0.1)' : 'rgba(15,23,42,0.5)',
                    color: answers[currentIndex] === oi ? '#34d399' : '#cbd5e1',
                    cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.3s ease'
                  }}>
                    <span style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${answers[currentIndex] === oi ? '#10b981' : 'rgba(51,65,85,0.5)'}`, background: answers[currentIndex] === oi ? 'rgba(16,185,129,0.1)' : 'transparent', fontSize: 13, fontWeight: 700, color: answers[currentIndex] === oi ? '#10b981' : '#64748b', flexShrink: 0 }}>{letters[oi]}</span>
                    {opt}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <button onClick={() => setCurrentIndex(p => p - 1)} disabled={currentIndex === 0} style={{ padding: '12px 24px', background: 'rgba(51,65,85,0.8)', color: '#f1f5f9', fontWeight: 500, borderRadius: 12, border: '1px solid rgba(51,65,85,0.5)', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentIndex === 0 ? 0.3 : 1, fontSize: 14 }}>← Oldingi</button>
                <div style={{ display: 'flex', gap: 4 }}>
                  {tests.map((_, i) => (
                    <button key={i} onClick={() => setCurrentIndex(i)} style={{
                      width: 32, height: 32, borderRadius: 8, fontSize: 12, fontWeight: 700,
                      background: i === currentIndex ? 'rgba(16,185,129,0.1)' : answers[i] !== undefined ? 'rgba(51,65,85,0.5)' : 'transparent',
                      color: i === currentIndex ? '#10b981' : answers[i] !== undefined ? '#cbd5e1' : '#475569',
                      border: i === currentIndex ? '1px solid rgba(16,185,129,0.3)' : 'none',
                      cursor: 'pointer'
                    }}>{i + 1}</button>
                  ))}
                </div>
                {currentIndex < tests.length - 1 ? (
                  <button onClick={() => setCurrentIndex(p => p + 1)} style={{ padding: '12px 24px', background: '#10b981', color: '#020617', fontWeight: 600, borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14 }}>Keyingi →</button>
                ) : (
                  <button onClick={finishTest} style={{ padding: '12px 24px', background: '#f59e0b', color: '#020617', fontWeight: 600, borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14 }}>🏆 Yakunlash</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== NATIJA =====
  if (phase === 'result' && result) {
    const level = result.percentage >= 80 ? 'excellent' : result.percentage >= 50 ? 'good' : 'poor';
    const levelEmoji = { excellent: '🏆', good: '👍', poor: '💪' };
    const levelMsg = { excellent: "A'lo natija!", good: 'Yaxshi natija!', poor: "Qayta urinib ko'ring!" };
    const levelColor = { excellent: '#10b981', good: '#f59e0b', poor: '#ef4444' };

    return (
      <div style={{ minHeight: '100vh', background: '#020617' }}>
        <Navbar />
        <div style={{ padding: '32px 16px', maxWidth: 800, margin: '0 auto' }}>
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 20, padding: 48, textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>{levelEmoji[level]}</div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 32, fontWeight: 700, color: levelColor[level], marginBottom: 8 }}>{levelMsg[level]}</h1>
            <p style={{ color: '#64748b', marginBottom: 32, fontSize: 15 }}>{diffLabels[difficulty]} darajadagi test yakunlandi</p>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 72, fontWeight: 700, color: levelColor[level], marginBottom: 8, lineHeight: 1 }}>{result.percentage}%</div>
            <p style={{ color: '#475569', marginBottom: 32 }}>To'g'ri javoblar foizi</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 32 }}>
              <div style={{ padding: 16, borderRadius: 12, background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.5)', textAlign: 'center' }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>{result.answeredQuestions}/{result.totalQuestions}</p>
                <p style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>Javob berildi</p>
              </div>
              <div style={{ padding: 16, borderRadius: 12, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>{result.correctAnswers}</p>
                <p style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>To'g'ri javoblar</p>
              </div>
              <div style={{ padding: 16, borderRadius: 12, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>{result.wrongAnswers}</p>
                <p style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>Noto'g'ri javoblar</p>
              </div>
              <div style={{ padding: 16, borderRadius: 12, background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.5)', textAlign: 'center' }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>{formatTime(result.timeUsed)}</p>
                <p style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>Sarflangan vaqt</p>
              </div>
            </div>

            {/* Batafsil */}
            <div style={{ textAlign: 'left', marginBottom: 32 }}>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 700, color: '#cbd5e1', marginBottom: 16 }}>📊 Batafsil natijalar</h3>
              {tests.map((test, i) => {
                const ua = answers[i];
                const isCorrect = ua === test.correctIndex;
                const isUnanswered = ua === undefined;
                const bg = isUnanswered ? 'rgba(30,41,59,0.3)' : isCorrect ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)';
                const bc = isUnanswered ? 'rgba(51,65,85,0.5)' : isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)';
                const tc = isUnanswered ? '#475569' : isCorrect ? '#10b981' : '#ef4444';
                const icon = isUnanswered ? '⚠️' : isCorrect ? '✅' : '❌';
                return (
                  <div key={i} style={{ padding: 16, borderRadius: 12, border: `1px solid ${bc}`, background: bg, marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: `${tc}20`, color: tc, flexShrink: 0 }}>{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#cbd5e1', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{test.question}</p>
                      <div style={{ fontSize: 13, color: '#64748b' }}>
                        {isUnanswered ? 'Javob berilmadi' : (
                          <span style={{ color: isCorrect ? '#10b981' : '#ef4444' }}>Sizning javobingiz: {test.options[ua]}</span>
                        )}
                        {!isCorrect && !isUnanswered && (
                          <span style={{ color: '#10b981', marginLeft: 12 }}>To'g'ri javob: {test.options[test.correctIndex]}</span>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              <button onClick={restartTest} style={{ padding: '12px 24px', background: '#10b981', color: '#020617', fontWeight: 600, borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14 }}>🔄 Qayta boshlash</button>
              <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 24px', background: 'rgba(51,65,85,0.8)', color: '#f1f5f9', fontWeight: 500, borderRadius: 12, border: '1px solid rgba(51,65,85,0.5)', cursor: 'pointer', fontSize: 14 }}>🏠 Boshqaruv paneli</button>
            </div>
            {saving && <p style={{ color: '#475569', fontSize: 14, marginTop: 16 }}>Natija saqlanmoqda...</p>}
          </div>
          <Leaderboard showDifficulty={difficulty} />
        </div>
      </div>
    );
  }

  return null;
}