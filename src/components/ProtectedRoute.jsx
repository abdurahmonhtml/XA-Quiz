import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: '#64748b' }}>
        Yuklanmoqda...
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}