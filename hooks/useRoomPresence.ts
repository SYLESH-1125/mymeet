import { useState, useEffect } from 'react';
import { Attendee, firestoreHelpers } from '@/lib/firestore';
import { useAuth } from './useAuth';

export function useRoomPresence(classId: string | null) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!classId || !user || !profile) return;

    // Add current user as attendee
    firestoreHelpers.addAttendee(
      classId,
      user.uid,
      profile.role,
      profile.displayName,
      profile.photoURL
    );

    // Subscribe to attendees
    const unsubscribe = firestoreHelpers.subscribeToAttendees(classId, (attendeeList) => {
      setAttendees(attendeeList);
      const students = attendeeList.filter((a) => a.role === 'student');
      setStudentCount(students.length);
    });

    // Cleanup: remove attendee on unmount
    return () => {
      unsubscribe();
      if (classId && user) {
        firestoreHelpers.removeAttendee(classId, user.uid);
      }
    };
  }, [classId, user, profile]);

  return { attendees, studentCount };
}
