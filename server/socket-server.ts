import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

// Rate limiting storage
const rateLimits = new Map<string, { count: number; resetTime: number }>();

// Debounce timers for code/whiteboard patches
const debouncers = new Map<string, NodeJS.Timeout>();

// Event batch storage
interface EventBatch {
  events: any[];
  timer: NodeJS.Timeout | null;
}
const batchStore = new Map<string, EventBatch>();

// Backpressure tracking
const outboundBuffers = new Map<string, number>();
const MAX_BUFFER_SIZE = 100;

export async function initializeSocketServer(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    // Disable HTTP compression for binary socket upgrades
    httpCompression: false,
    // Performance tuning
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6, // 1MB max message size
  });

  // Redis adapter for horizontal scaling
  if (process.env.REDIS_URL) {
    try {
      const pubClient = createClient({ url: process.env.REDIS_URL });
      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);

      io.adapter(createAdapter(pubClient, subClient));
      console.log('✅ Socket.IO Redis adapter initialized');
    } catch (error) {
      console.warn('⚠️  Redis not available, running in single-server mode:', error);
    }
  }

  // Rate limit checker
  function checkRateLimit(userId: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const key = userId;
    const existing = rateLimits.get(key);

    if (!existing || now > existing.resetTime) {
      rateLimits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (existing.count >= limit) {
      return false;
    }

    existing.count++;
    return true;
  }

  // Backpressure guard
  function canSendToClient(socketId: string): boolean {
    const bufferSize = outboundBuffers.get(socketId) || 0;
    return bufferSize < MAX_BUFFER_SIZE;
  }

  function incrementBuffer(socketId: string) {
    const current = outboundBuffers.get(socketId) || 0;
    outboundBuffers.set(socketId, current + 1);
  }

  function decrementBuffer(socketId: string) {
    const current = outboundBuffers.get(socketId) || 0;
    if (current > 0) {
      outboundBuffers.set(socketId, current - 1);
    }
  }

  io.on('connection', (socket: Socket) => {
    console.log('🔌 Client connected:', socket.id);
    outboundBuffers.set(socket.id, 0);

    // Join room
    socket.on('room:join', ({ roomId, userId, userName, role }) => {
      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.userId = userId;
      socket.data.userName = userName;
      socket.data.role = role;

      // Room-scoped presence
      const room = io.sockets.adapter.rooms.get(roomId);
      const participantCount = room ? room.size : 0;

      // Broadcast to room
      socket.to(roomId).emit('presence:joined', {
        userId,
        userName,
        role,
        participantCount,
      });

      // Send current participant count to joiner
      socket.emit('presence:count', { participantCount });

      console.log(`👤 ${userName} (${role}) joined room ${roomId}`);
    });

    // Chat with rate limiting
    socket.on('chat:send', ({ roomId, message }) => {
      const userId = socket.data.userId;
      
      // Rate limit: 10 messages per 5 seconds
      if (!checkRateLimit(`chat:${userId}`, 10, 5000)) {
        socket.emit('chat:error', { 
          ok: false, 
          reason: 'rate',
          message: 'Slow down! Too many messages.' 
        });
        return;
      }

      const payload = {
        id: Date.now().toString(),
        userId,
        userName: socket.data.userName,
        role: socket.data.role,
        message,
        timestamp: Date.now(),
      };

      // Emit to room
      io.to(roomId).emit('chat:message', payload);

      // Async write to Firestore (write-behind pattern)
      // This should be handled by your API route
      console.log(`💬 Chat in ${roomId} from ${socket.data.userName}`);
    });

    // Doubt with rate limiting
    socket.on('doubt:send', ({ roomId, doubt }) => {
      const userId = socket.data.userId;
      
      // Rate limit: 10 doubts per 5 seconds
      if (!checkRateLimit(`doubt:${userId}`, 10, 5000)) {
        socket.emit('doubt:error', { 
          ok: false, 
          reason: 'rate',
          message: 'Please wait before submitting another doubt.' 
        });
        return;
      }

      const payload = {
        id: Date.now().toString(),
        userId,
        userName: socket.data.userName,
        doubt,
        timestamp: Date.now(),
        resolved: false,
      };

      // Emit to room
      io.to(roomId).emit('doubt:new', payload);

      console.log(`❓ Doubt in ${roomId} from ${socket.data.userName}`);
    });

    // Code editor patches with debouncing and batching
    socket.on('code:patch', ({ roomId, patch }) => {
      const userId = socket.data.userId;
      const batchKey = `code:${roomId}`;

      // Clear existing debounce timer
      const existingTimer = debouncers.get(batchKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Get or create batch
      let batch = batchStore.get(batchKey);
      if (!batch) {
        batch = { events: [], timer: null };
        batchStore.set(batchKey, batch);
      }

      // Add patch to batch
      batch.events.push({ userId, patch, timestamp: Date.now() });

      // Debounce: emit after 250ms of inactivity
      const timer = setTimeout(() => {
        const batchToSend = batchStore.get(batchKey);
        if (batchToSend && batchToSend.events.length > 0) {
          // Apply binary diff if available (simplified - use OT/CRDT library in production)
          const mergedPatch = batchToSend.events[batchToSend.events.length - 1].patch;
          
          // Broadcast to room (except sender)
          socket.to(roomId).emit('code:update', { 
            patch: mergedPatch,
            timestamp: Date.now() 
          });

          // Clear batch
          batchStore.delete(batchKey);
        }
        debouncers.delete(batchKey);
      }, 250);

      debouncers.set(batchKey, timer);
    });

    // Whiteboard patches with debouncing and batching
    socket.on('whiteboard:patch', ({ roomId, patch }) => {
      const userId = socket.data.userId;
      const batchKey = `whiteboard:${roomId}`;

      // Clear existing debounce timer
      const existingTimer = debouncers.get(batchKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Get or create batch
      let batch = batchStore.get(batchKey);
      if (!batch) {
        batch = { events: [], timer: null };
        batchStore.set(batchKey, batch);
      }

      // Add patch to batch
      batch.events.push({ userId, patch, timestamp: Date.now() });

      // Debounce: emit after 200ms of inactivity
      const timer = setTimeout(() => {
        const batchToSend = batchStore.get(batchKey);
        if (batchToSend && batchToSend.events.length > 0) {
          // Use RAF-style batching on client side for rendering
          const mergedPatch = batchToSend.events[batchToSend.events.length - 1].patch;
          
          // Check backpressure before broadcasting
          const sockets = io.sockets.adapter.rooms.get(roomId);
          if (sockets) {
            sockets.forEach(socketId => {
              if (socketId !== socket.id && canSendToClient(socketId)) {
                io.to(socketId).emit('whiteboard:update', { 
                  patch: mergedPatch,
                  timestamp: Date.now() 
                });
                incrementBuffer(socketId);
                
                // Decrement after a short delay
                setTimeout(() => decrementBuffer(socketId), 100);
              }
            });
          }

          // Clear batch
          batchStore.delete(batchKey);
        }
        debouncers.delete(batchKey);
      }, 200);

      debouncers.set(batchKey, timer);
    });

    // Room state changes (no batching needed)
    socket.on('room:stateChange', ({ roomId, state }) => {
      socket.to(roomId).emit('room:stateUpdate', state);
    });

    // Presence heartbeat
    socket.on('presence:heartbeat', () => {
      socket.emit('presence:ack', { timestamp: Date.now() });
    });

    // Stats reporting (for monitoring)
    socket.on('stats:report', ({ stats }) => {
      const { rtt, packetLoss, bitrate } = stats;
      
      // Adaptive quality adjustment
      if (rtt > 250 || packetLoss > 5) {
        socket.emit('quality:adjust', { 
          action: 'lower',
          reason: rtt > 250 ? 'high-rtt' : 'packet-loss'
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      const roomId = socket.data.roomId;
      const userId = socket.data.userId;
      const userName = socket.data.userName;

      if (roomId) {
        socket.to(roomId).emit('presence:left', { userId, userName });
      }

      // Cleanup
      outboundBuffers.delete(socket.id);
      console.log('🔌 Client disconnected:', socket.id);
    });

    // Leave room
    socket.on('room:leave', ({ roomId }) => {
      socket.leave(roomId);
      socket.data.roomId = null;
    });
  });

  // Health check metrics endpoint
  io.engine.on('connection_error', (err) => {
    console.error('Socket connection error:', err);
  });

  console.log('🚀 Socket.IO server initialized');
  return io;
}

// Helper function to get server metrics
export function getServerMetrics(io: Server) {
  const rooms = io.sockets.adapter.rooms;
  const metrics = {
    totalConnections: io.engine.clientsCount,
    totalRooms: rooms.size,
    roomDetails: [] as any[],
    timestamp: Date.now(),
  };

  rooms.forEach((sockets, roomId) => {
    // Skip socket ID rooms (self-rooms)
    if (sockets.size > 1 || !roomId.includes('-')) {
      metrics.roomDetails.push({
        roomId,
        participants: sockets.size,
      });
    }
  });

  return metrics;
}
