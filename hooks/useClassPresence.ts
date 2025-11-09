'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, collection, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

interface Attendee {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: 'teacher' | 'student';
  joinedAt: any;
}

export function useClassPresence(classId: string, isTeacher: boolean) {
  const { user } = useAuth();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    if (!user || !classId) return;

    // Add current user to attendees
    const joinClass = async () => {
      try {
        await addDoc(collection(db, 'classes', classId, 'attendees'), {
          uid: user.uid,
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || '',
          role: isTeacher ? 'teacher' : 'student',
          joinedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error joining class:', error);
      }
    };

    joinClass();

    // Listen to all attendees in real-time
    const unsubscribe = onSnapshot(
      collection(db, 'classes', classId, 'attendees'),
      (snapshot) => {
        const attendeesMap = new Map<string, Attendee>();
        
        // Use Map to deduplicate by uid (keep latest entry)
        snapshot.forEach((doc) => {
          const data = doc.data() as Attendee;
          attendeesMap.set(data.uid, data);
        });
        
        const attendeesList = Array.from(attendeesMap.values());
        setAttendees(attendeesList);
        setStudentCount(attendeesList.filter(a => a.role === 'student').length);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [classId, user, isTeacher]);

  return { attendees, studentCount };
}
