import { useState, useEffect, useCallback, useRef } from 'react';
import { CodeDoc, firestoreHelpers } from '@/lib/firestore';
import { Socket } from 'socket.io-client';
import { Timestamp } from 'firebase/firestore';

// Reuse socket instance
function getSocket(): Socket {
  return (window as any).__eduMeetSocket;
}

export function useCodeEditor(classId: string | null) {
  const [codeDoc, setCodeDoc] = useState<CodeDoc | null>(null);
  const [socket] = useState<Socket | null>(() => {
    if (typeof window !== 'undefined') {
      return getSocket();
    }
    return null;
  });
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!classId || !socket) return;

    // Get initial code from Firestore
    firestoreHelpers.getCodeDoc(classId).then((doc) => {
      if (doc) {
        setCodeDoc(doc);
      }
    });

    // Listen for realtime code updates from Socket.IO
    const handleCodeUpdate = ({ patch, timestamp }: { patch: any; timestamp: number }) => {
      setCodeDoc(prev => prev ? { ...prev, ...patch } : null);
    };

    socket.on('code:update', handleCodeUpdate);

    return () => {
      socket.off('code:update', handleCodeUpdate);
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, [classId, socket]);

  // Debounced update with Socket.IO (batched on server)
  const updateCode = useCallback((content: string, lang: string) => {
    if (!classId || !socket) return;
    
    // Update local state immediately for responsiveness
    setCodeDoc(prev => prev ? { ...prev, content, lang } : { content, lang, lastModified: Timestamp.now() });

    // Send patch to Socket.IO (will be debounced/batched on server)
    socket.emit('code:patch', { 
      roomId: classId, 
      patch: { content, lang } 
    });

    // Async write to Firestore (write-behind) - debounced 1 second
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }
    
    updateTimerRef.current = setTimeout(() => {
      firestoreHelpers.updateCodeDoc(classId, content, lang).catch(err => {
        console.error('Failed to persist code:', err);
      });
    }, 1000);
  }, [classId, socket]);

  return { codeDoc, updateCode };
}
