import { useState, useEffect } from 'react';
import { doc, setDoc, collection, getDocs, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export function useAdmin() {
  const { currentUser } = useAuth();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Joriy foydalanuvchi rolini real-time kuzatish
  useEffect(() => {
    if (!currentUser) {
      setRole(null);
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setRole(snap.data().role);
      } else {
        setRole('user');
      }
      setLoading(false);
    }, () => {
      setRole('user');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Barcha foydalanuvchilarni olish (admin uchun)
  async function fetchAllUsers() {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('fetchAllUsers xatosi:', err);
      return [];
    }
  }

  // Foydalanuvchiga rol berish
  async function setUserRole(uid, newRole) {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, { role: newRole, updatedAt: serverTimestamp() }, { merge: true });
      return true;
    } catch (err) {
      console.error('setUserRole xatosi:', err);
      return false;
    }
  }

  // Foydalanuvchi rolini user ga qaytarish
  async function removeUserRole(uid) {
    try {
      await setDoc(doc(db, 'users', uid), { role: 'user', updatedAt: serverTimestamp() }, { merge: true });
      return true;
    } catch (err) {
      console.error('removeUserRole xatosi:', err);
      return false;
    }
  }

  // Ruxsatlar
  const canCreate = role === 'admin' || role === 'creator';
  const isAdmin = role === 'admin';

  return {
    role,
    loading,
    canCreate,
    isAdmin,
    fetchAllUsers,
    setUserRole,
    removeUserRole,
  };
}