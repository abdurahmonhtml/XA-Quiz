import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export function useLeaderboard(options = {}) {
  const { difficulty = null, limitCount = 20 } = options;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    let q;
    if (difficulty) {
      q = query(
        collection(db, 'results'),
        where('difficulty', '==', difficulty),
        orderBy('percentage', 'desc'),
        orderBy('completedAt', 'desc'),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, 'results'),
        orderBy('percentage', 'desc'),
        orderBy('completedAt', 'desc'),
        limit(limitCount)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setResults(data);
      setLoading(false);
    }, (err) => {
      console.error('useLeaderboard xatosi:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [difficulty, limitCount]);

  return { results, loading, error };
}