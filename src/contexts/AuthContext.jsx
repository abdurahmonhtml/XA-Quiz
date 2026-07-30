import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  async function register(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });

    // Firestore ga foydalanuvchi yozish
    await setDoc(doc(db, 'users', cred.user.uid), {
      email: cred.user.email,
      displayName: displayName,
      role: 'user',
      createdAt: serverTimestamp(),
    });

    return cred;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function loginAsGuest() {
    const cred = await signInAnonymously(auth);
    await updateProfile(cred.user, { displayName: 'Mehmon' });

    // Firestore ga mehmon yozish
    await setDoc(doc(db, 'users', cred.user.uid), {
      email: 'mehmon',
      displayName: 'Mehmon',
      role: 'user',
      createdAt: serverTimestamp(),
    }, { merge: true });

    return cred;
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setLoading(false);
      }, (error) => {
        console.error('Auth xatosi:', error);
        setAuthError(error.message);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (error) {
      console.error('AuthContext xatosi:', error);
      setAuthError(error.message);
      setLoading(false);
    }
  }, []);

  const value = { currentUser, register, login, loginAsGuest, logout, loading, authError };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}