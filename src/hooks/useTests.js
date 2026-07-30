import { useState, useEffect } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, where, getDocs, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
// Faylning boshiga qo'shing:
import { fonts } from '../utils/fonts';

// Barcha fontFamily: 'Space Grotesk, sans-serif' ni -> fontFamily: fonts.display ga almashtiring
// Barcha fontFamily: 'DM Sans, sans-serif' ni -> fontFamily: fonts.body ga almashtiring
// Barcha fontWeight: 700 ni -> fontWeight: 800 ga almashtiring (Outfit boldroq ko'rinadi)

export function useTests(options = {}) {
  const { difficulty = null, realtime = true, shuffle = false } = options;
  const { currentUser } = useAuth();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!realtime) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    let q;
    if (difficulty) {
      q = query(collection(db, 'tests'), where('difficulty', '==', difficulty), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'tests'), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (shuffle) data = [...data].sort(() => Math.random() - 0.5);
      setTests(data);
      setLoading(false);
    }, (err) => {
      console.error('useTests xatosi:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [difficulty, realtime, shuffle]);

  const addTest = async (testData) => {
    if (!currentUser) { toast.error('Avval tizimga kiring'); return null; }
    if (!testData.question?.trim()) { toast.error('Savol matnini kiriting'); return null; }
    if (testData.options.some((o) => !o?.trim())) { toast.error("Barcha variantlarni to'ldiring"); return null; }
    try {
      const docRef = await addDoc(collection(db, 'tests'), {
        question: testData.question.trim(),
        options: testData.options.map((o) => o.trim()),
        correctIndex: testData.correctIndex,
        difficulty: testData.difficulty,
        createdBy: currentUser.uid,
        creatorName: currentUser.displayName || "Noma'lum",
        creatorEmail: currentUser.email,
        createdAt: serverTimestamp(),
      });
      toast.success("Test muvaffaqiyatli qo'shildi!");
      return docRef.id;
    } catch (err) {
      console.error('addTest xatosi:', err);
      toast.error("Test qo'shishda xatolik yuz berdi");
      return null;
    }
  };

  const updateTest = async (testId, testData) => {
    if (!testData.question?.trim()) { toast.error('Savol matnini kiriting'); return false; }
    if (testData.options.some((o) => !o?.trim())) { toast.error("Barcha variantlarni to'ldiring"); return false; }
    try {
      await updateDoc(doc(db, 'tests', testId), {
        question: testData.question.trim(),
        options: testData.options.map((o) => o.trim()),
        correctIndex: testData.correctIndex,
        difficulty: testData.difficulty,
      });
      toast.success('Test yangilandi');
      return true;
    } catch (err) {
      console.error('updateTest xatosi:', err);
      toast.error('Yangilashda xatolik yuz berdi');
      return false;
    }
  };

  const deleteTest = async (testId) => {
    try {
      await deleteDoc(doc(db, 'tests', testId));
      toast.success("Test o'chirildi");
      return true;
    } catch (err) {
      console.error('deleteTest xatosi:', err);
      toast.error("O'chirishda xatolik yuz berdi");
      return false;
    }
  };

  const fetchByDifficulty = async (diff) => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'tests'), where('difficulty', '==', diff));
      const snapshot = await getDocs(q);
      let data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (shuffle) data = [...data].sort(() => Math.random() - 0.5);
      setTests(data);
      setLoading(false);
      if (data.length === 0) { toast.error('Bu darajada testlar mavjud emas'); return []; }
      return data;
    } catch (err) {
      console.error('fetchByDifficulty xatosi:', err);
      setError(err.message);
      setLoading(false);
      toast.error('Testlarni yuklashda xatolik');
      return [];
    }
  };

  return { tests, loading, error, addTest, updateTest, deleteTest, fetchByDifficulty };
}