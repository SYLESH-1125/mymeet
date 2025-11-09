'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

interface Doubt {
  id: string;
  studentId: string;
  studentName: string;
  question: string;
  timestamp: any;
  resolved: boolean;
}

export function useDoubtsLive(classId: string) {
  const { user } = useAuth();
  const [doubts, setDoubts] = useState<Doubt[]>([]);

  useEffect(() => {
    if (!classId) return;

    // Listen to doubts in real-time, ordered by timestamp
    const q = query(
      collection(db, 'classes', classId, 'doubts'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const doubtsList: Doubt[] = [];
      snapshot.forEach((doc) => {
        doubtsList.push({ id: doc.id, ...doc.data() } as Doubt);
      });
      setDoubts(doubtsList);
    });

    return () => unsubscribe();
  }, [classId]);

  const submitDoubt = async (question: string) => {
    if (!user || !question.trim()) return;

    try {
      await addDoc(collection(db, 'classes', classId, 'doubts'), {
        studentId: user.uid,
        studentName: user.displayName || 'Anonymous',
        question: question.trim(),
        timestamp: serverTimestamp(),
        resolved: false,
      });
    } catch (error) {
      console.error('Error submitting doubt:', error);
      throw error;
    }
  };

  const resolveDoubt = async (doubtId: string) => {
    try {
      await updateDoc(doc(db, 'classes', classId, 'doubts', doubtId), {
        resolved: true,
      });
    } catch (error) {
      console.error('Error resolving doubt:', error);
      throw error;
    }
  };

  return { doubts, submitDoubt, resolveDoubt };
}
