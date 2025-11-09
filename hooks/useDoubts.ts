import { useState, useEffect, useCallback } from 'react';
import { Doubt, firestoreHelpers } from '@/lib/firestore';
import { io, Socket } from 'socket.io-client';

// Reuse socket instance from useChat
function getSocket(): Socket {
  const existingSocket = (window as any).__eduMeetSocket;
  if (existingSocket) return existingSocket;

  const socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
    transports: ['websocket', 'polling'],
    reconnection: true,
  });
  
  (window as any).__eduMeetSocket = socket;
  return socket;
}

export function useDoubts(classId: string | null, userId: string | null, userName: string | null) {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [socket] = useState<Socket>(() => getSocket());

  useEffect(() => {
    if (!classId) return;

    // Listen for new doubts from Socket.IO
    const handleNewDoubt = (doubt: Doubt) => {
      setDoubts(prev => [...prev, doubt]);
    };

    socket.on('doubt:new', handleNewDoubt);

    // Load initial doubts from Firestore
    const loadHistory = async () => {
      const history = await firestoreHelpers.getDoubtHistory(classId, 100);
      setDoubts(history);
    };
    loadHistory();

    return () => {
      socket.off('doubt:new', handleNewDoubt);
    };
  }, [classId, socket]);

  const submitDoubt = useCallback(async (uid: string, displayName: string, text: string) => {
    if (!classId) return;
    
    // Send via Socket.IO (realtime)
    socket.emit('doubt:send', { 
      roomId: classId, 
      doubt: text 
    });

    // Async write to Firestore (write-behind)
    setTimeout(() => {
      firestoreHelpers.submitDoubt(classId, uid, displayName, text).catch(err => {
        console.error('Failed to persist doubt:', err);
      });
    }, 0);
  }, [classId, socket]);

  const markAnswered = useCallback(async (doubtId: string) => {
    if (!classId) return;
    await firestoreHelpers.markDoubtAnswered(classId, doubtId);
    // Update local state
    setDoubts(prev => prev.map(d => 
      d.id === doubtId ? { ...d, answered: true } : d
    ));
  }, [classId]);

  return { doubts, submitDoubt, markAnswered };
}
