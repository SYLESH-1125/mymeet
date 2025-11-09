import { useState, useEffect } from 'react';
import { RoomState, firestoreHelpers } from '@/lib/firestore';

export function useRoomState(classId: string | null) {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Get initial state
    firestoreHelpers.getRoomState(classId).then((state) => {
      if (state) {
        setRoomState(state);
      }
      setLoading(false);
    });

    // Subscribe to updates
    const unsubscribe = firestoreHelpers.subscribeToRoomState(classId, (state) => {
      setRoomState(state);
    });

    return () => unsubscribe();
  }, [classId]);

  const updateMode = async (mode: 'whiteboard' | 'code' | 'presenting') => {
    if (!classId) return;
    await firestoreHelpers.updateRoomState(classId, { mode });
  };

  const updateScreenSharing = async (screenSharing: boolean) => {
    if (!classId) return;
    await firestoreHelpers.updateRoomState(classId, { screenSharing });
  };

  return { roomState, loading, updateMode, updateScreenSharing };
}
