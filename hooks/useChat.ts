import { useState, useEffect, useCallback } from 'react';
import { ChatMessage, firestoreHelpers } from '@/lib/firestore';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useChat(classId: string | null, userId: string | null, userName: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!classId) return;

    // Initialize Socket.IO connection
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      socket.on('connect', () => {
        setIsConnected(true);
        console.log('✅ Socket connected');
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('❌ Socket disconnected');
      });
    }

    // Join room when connected
    if (socket && userId && userName) {
      socket.emit('room:join', { 
        roomId: classId, 
        userId, 
        userName,
        role: 'student' // Will be overridden by server based on auth
      });
    }

    // Listen for new chat messages from Socket.IO (source of truth)
    const handleChatMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    };

    socket?.on('chat:message', handleChatMessage);

    // Load initial messages from Firestore (for history)
    const loadHistory = async () => {
      const history = await firestoreHelpers.getChatHistory(classId, 50);
      setMessages(history);
    };
    loadHistory();

    return () => {
      socket?.off('chat:message', handleChatMessage);
      socket?.emit('room:leave', { roomId: classId });
    };
  }, [classId, userId, userName]);

  const sendMessage = useCallback(async (uid: string, displayName: string, photoURL: string, text: string) => {
    if (!classId || !socket || !isConnected) return;
    
    // Send via Socket.IO (realtime)
    socket.emit('chat:send', { 
      roomId: classId, 
      message: text 
    });

    // Async write to Firestore (write-behind for persistence)
    setTimeout(() => {
      firestoreHelpers.sendChatMessage(classId, uid, displayName, photoURL, text).catch(err => {
        console.error('Failed to persist chat message:', err);
      });
    }, 0);
  }, [classId, isConnected]);

  return { messages, sendMessage, isConnected };
}
