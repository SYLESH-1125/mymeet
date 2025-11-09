'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Simple STUN server configuration
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

let socket: Socket;

export function useWebRTCBroadcast(classId: string, isTeacher: boolean, userId: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const studentsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamRef = useRef<MediaStream>(new MediaStream());

  // Initialize socket connection
  useEffect(() => {
    const initSocket = async () => {
      await fetch('/api/socket');
      socket = io({
        path: '/api/socket',
      });

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        setIsConnected(true);
        socket.emit('join-class', classId);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      // Student: Listen for teacher's offer
      if (!isTeacher) {
        socket.on('teacher-offer', async ({ offer, teacherId }) => {
          console.log('Received teacher offer');
          await handleTeacherOffer(offer, teacherId);
        });

        socket.on('ice-candidate', async ({ candidate, senderId }) => {
          if (peerConnectionRef.current && senderId !== socket.id) {
            try {
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.error('Error adding ICE candidate:', e);
            }
          }
        });
      }

      // Teacher: Listen for student answers
      if (isTeacher) {
        socket.on('student-answer', async ({ answer, studentId }) => {
          console.log('Received student answer');
          const pc = studentsRef.current.get(studentId);
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
          }
        });

        socket.on('ice-candidate', async ({ candidate, senderId }) => {
          const pc = studentsRef.current.get(senderId);
          if (pc) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.error('Error adding ICE candidate:', e);
            }
          }
        });

        socket.on('user-joined', (studentId: string) => {
          console.log('New student joined:', studentId);
          // Teacher will broadcast offer when they start stream
        });
      }
    };

    initSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [classId, isTeacher]);

  // Student: Handle teacher's offer
  const handleTeacherOffer = async (offer: RTCSessionDescriptionInit, teacherId: string) => {
    try {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      // Handle incoming stream
      pc.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        event.streams[0].getTracks().forEach(track => {
          remoteStreamRef.current.addTrack(track);
        });
        setRemoteStream(remoteStreamRef.current);
      };

      // Send ICE candidates to teacher
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', {
            classId,
            candidate: event.candidate.toJSON(),
            targetId: teacherId,
          });
        }
      };

      // Set remote description and create answer
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer back to teacher
      socket.emit('student-answer', {
        classId,
        answer: {
          type: answer.type,
          sdp: answer.sdp,
        },
        teacherId,
      });
    } catch (error) {
      console.error('Error handling teacher offer:', error);
    }
  };

  // Teacher: Start broadcasting stream
  const startBroadcast = async (stream: MediaStream) => {
    if (!isTeacher || !socket) return;

    setLocalStream(stream);
    console.log('Teacher starting broadcast');

    // Notify students that teacher is broadcasting
    socket.emit('start-broadcast', classId);

    // Listen for new students joining
    socket.on('user-joined', async (studentId: string) => {
      console.log('Creating connection for student:', studentId);
      
      const pc = new RTCPeerConnection(ICE_SERVERS);
      studentsRef.current.set(studentId, pc);

      // Add stream tracks
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Send ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', {
            classId,
            candidate: event.candidate.toJSON(),
            targetId: studentId,
          });
        }
      };

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('teacher-offer', {
        classId,
        offer: {
          type: offer.type,
          sdp: offer.sdp,
        },
      });
    });
  };

  // Student: Connect to teacher
  const connectToTeacher = async () => {
    if (isTeacher) return;
    console.log('Student waiting for teacher broadcast...');
    // Student waits for teacher-offer event (handled in useEffect)
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      studentsRef.current.forEach(pc => pc.close());
      studentsRef.current.clear();
      
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    localStream,
    remoteStream,
    isConnected,
    startBroadcast,
    connectToTeacher,
  };
}
