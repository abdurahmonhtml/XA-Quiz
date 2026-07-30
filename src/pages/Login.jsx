import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { fonts } from '../utils/fonts';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    if (!email || !password) {
      toast.error("Maydonlarni to'ldiring");
      setLoading(false);
      return;
    }
    try {
      await login(email, password);
      toast.success('Muvaffaqiyatli kirdingiz!');
      navigate('/dashboard');
    } catch (err) {
      let msg = 'Kirishda xatolik yuz berdi';
      if (err.code === 'auth/user-not-found') msg = "Bunday foydalanuvchi topilmadi. Avval ro'yxatdan o'ting";
      else if (err.code === 'auth/wrong-password') msg = "Parol noto'g'ri";
      else if (err.code === 'auth/invalid-credential') msg = "Email yoki parol noto'g'ri";
      console.error('Login xatosi:', err.code, err.message);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(51, 65, 85, 0.5)',
    borderRadius: 12, color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: fonts.body
  };
  const labelStyle = { display: 'block', color: '#cbd5e1', fontSize: 14, fontWeight: 500, marginBottom: 8, fontFamily: fonts.body };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', fontFamily: fonts.body }}>
      <div style={{ width: '100%', maxWidth: 400, margin: '0 16px', background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: 20, padding: 32 }}>
        <h1 style={{ fontFamily: fonts.display, fontSize: 28, fontWeight: 800, color: '#f1f5f9', textAlign: 'center', marginBottom: 8, letterSpacing: '-0.5px' }}>
          Quiz<span style={{ color: '#34d399' }}>App</span>
        </h1>
        <p style={{ color: '#64748b', textAlign: 'center', marginBottom: 32, fontSize: 15, fontFamily: fonts.body }}>
          Tizimga kiring
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="email@misol.com" />
          </div>

          <div>
            <label style={labelStyle}>Parol</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle, paddingRight: 48 }} placeholder="Parolingizni kiriting" />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: 4, lineHeight: 1, opacity: showPass ? 1 : 0.6, transition: 'all 0.2s ease' }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px 24px', background: '#10b981', color: '#020617', fontWeight: 700, fontSize: 14, borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, fontFamily: fonts.display, letterSpacing: '0.5px' }}>
            {loading ? 'Kiritilmoqda...' : 'Kirish'}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', color: '#64748b', fontSize: 14, fontFamily: fonts.body }}>
          Hisobingiz yo'qmi?{' '}
          <Link to="/register" style={{ color: '#10b981', fontWeight: 600, fontFamily: fonts.display }}>Ro'yxatdan o'ting</Link>
        </p>
      </div>
    </div>
  );
}