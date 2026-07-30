import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import CreateTest from '../pages/CreateTest';
import SolveTest from '../pages/SolveTest';

export default function AppRoutes() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#020617',
        color: '#64748b',
        fontSize: 18
      }}>
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/register"
        element={currentUser ? <Navigate to="/dashboard" /> : <Register />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <CreateTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/solve"
        element={
          <ProtectedRoute>
            <SolveTest />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}