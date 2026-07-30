import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { fonts } from '../utils/fonts';

export default function Register() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    if (!displayName || !email || !password || !confirmPass) { toast.error("Barcha maydonlarni to'ldiring"); setLoading(false); return; }
    if (password.length < 6) { toast.error("Parol kamida 6 ta belgi"); setLoading(false); return; }
    if (password !== confirmPass) { toast.error('Parollar mos kelmayapti'); setLoading(false); return; }
    try {
      await register(email, password, displayName);
      toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
      navigate('/dashboard');
    } catch (err) { toast.error("Ro'yxatdan o'tishda xatolik"); }
    finally { setLoading(false); }
  }

  const inputStyle = { width: '100%', padding: '12px 16px', background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 12, color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: fonts.body };
  const labelStyle = { display: 'block', color: '#cbd5e1', fontSize: 14, fontWeight: 500, marginBottom: 8, fontFamily: fonts.body };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', fontFamily: fonts.body }}>
      <div style={{ width: '100%', maxWidth: 400, margin: '0 16px', background: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: 20, padding: 32 }}>
        <h1 style={{ fontFamily: fonts.display, fontSize: 28, fontWeight: 800, color: '#f1f5f9', textAlign: 'center', marginBottom: 8, letterSpacing: '-0.5px' }}>
          Ro'yxatdan o'tish
        </h1>
        <p style={{ color: '#64748b', textAlign: 'center', marginBottom: 32, fontSize: 15, fontFamily: fonts.body }}>Yangi hisob yarating</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div><label style={labelStyle}>Ismingiz</label><input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={inputStyle} placeholder="Ismingizni kiriting" /></div>
          <div><label style={labelStyle}>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="email@misol.com" /></div>
          <div>
            <label style={labelStyle}>Parol</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass1 ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle, paddingRight: 48 }} placeholder="Kamida 6 ta belgi" />
              <button type="button" onClick={() => setShowPass1(!showPass1)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: 4, lineHeight: 1, opacity: showPass1 ? 1 : 0.6, transition: 'all 0.2s ease' }}>{showPass1 ? '🙈' : '👁️'}</button>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Parolni tasdiqlash</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass2 ? 'text' : 'password'} value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} style={{ ...inputStyle, paddingRight: 48 }} placeholder="Parolni qayta kiriting" />
              <button type="button" onClick={() => setShowPass2(!showPass2)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: 4, lineHeight: 1, opacity: showPass2 ? 1 : 0.6, transition: 'all 0.2s ease' }}>{showPass2 ? '🙈' : '👁️'}</button>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px 24px', background: '#10b981', color: '#020617', fontWeight: 700, fontSize: 14, borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, fontFamily: fonts.display, letterSpacing: '0.5px' }}>
            {loading ? 'Kutilmoqda...' : "Ro'yxatdan o'tish"}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', color: '#64748b', fontSize: 14, fontFamily: fonts.body }}>
          Hisobingiz bormi?{' '}
          <Link to="/login" style={{ color: '#10b981', fontWeight: 600, fontFamily: fonts.display }}>Tizimga kiring</Link>
        </p>
      </div>
    </div>
  );
}