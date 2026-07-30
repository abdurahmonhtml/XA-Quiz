import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export function useResults() {
  const { currentUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const saveResult = async (resultData) => {
    if (!currentUser) return null;
    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, 'results'), {
        ...resultData,
        userId: currentUser.uid,
        userName: currentUser.displayName || "Noma'lum",
        userEmail: currentUser.email,
        completedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      console.error('saveResult xatosi:', err);
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { saving, saveResult };
}