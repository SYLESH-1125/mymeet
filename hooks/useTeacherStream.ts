'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TeacherStream {
  isSharing: boolean;
  shareType: 'none' | 'screen' | 'camera' | 'both';
  audioEnabled: boolean;
  videoEnabled: boolean;
}

export function useTeacherStream(classId: string) {
  const [teacherStream, setTeacherStream] = useState<TeacherStream>({
    isSharing: false,
    shareType: 'none',
    audioEnabled: false,
    videoEnabled: false,
  });

  useEffect(() => {
    if (!classId) return;

    // Listen to teacher's stream status in real-time
    const unsubscribe = onSnapshot(
      doc(db, 'classes', classId, 'liveState', 'teacher'),
      (docSnap) => {
        if (docSnap.exists()) {
          setTeacherStream(docSnap.data() as TeacherStream);
        }
      }
    );

    return () => unsubscribe();
  }, [classId]);

  const updateTeacherStream = async (updates: Partial<TeacherStream>) => {
    try {
      const docRef = doc(db, 'classes', classId, 'liveState', 'teacher');
      // Use setDoc with merge to create if doesn't exist
      await setDoc(docRef, updates, { merge: true });
    } catch (error) {
      console.error('Error updating teacher stream:', error);
    }
  };

  return { teacherStream, updateTeacherStream };
}
