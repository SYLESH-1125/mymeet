'use client';

import { useEffect, useRef } from 'react';
import { useTeacherStream } from '@/hooks/useTeacherStream';
import { useWebRTCBroadcast } from '@/hooks/useWebRTCBroadcast';
import { useAuth } from '@/hooks/useAuth';
import { Mic, Monitor, Video } from 'lucide-react';

interface TeacherStreamViewerProps {
  roomId: string;
  teacherName: string;
}

export default function TeacherStreamViewer({ roomId, teacherName }: TeacherStreamViewerProps) {
  const { user } = useAuth();
  const { teacherStream } = useTeacherStream(roomId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { remoteStream, connectToTeacher } = useWebRTCBroadcast(
    roomId, 
    false, 
    user?.displayName || 'Student'
  );

  // Get the display name from teacherStream or use the passed name
  const displayName = teacherStream.teacherName || teacherName;

  // Connect to teacher when component mounts
  useEffect(() => {
    connectToTeacher();
  }, []);

  // Set video source when remote stream is available
  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="relative w-full h-full bg-zinc-900 flex flex-col items-center justify-center">
      {/* Video Display */}
      {remoteStream ? (
        <div className="w-full h-full flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        </div>
      ) : (
        <div className="text-center">
          <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl font-bold text-white">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{displayName}</h2>
          <p className="text-zinc-400 mb-4">Teacher</p>

          {/* Live Status Indicators */}
          <div className="space-y-2">
          {teacherStream.audioEnabled && (
            <div className="flex items-center justify-center gap-2 text-green-400 animate-pulse">
              <Mic className="w-4 h-4" />
              <span className="text-sm font-medium">Audio On</span>
            </div>
          )}
          {teacherStream.videoEnabled && (
            <div className="flex items-center justify-center gap-2 text-blue-400 animate-pulse">
              <Video className="w-4 h-4" />
              <span className="text-sm font-medium">Camera On</span>
            </div>
          )}
          {teacherStream.isSharing && (
            <div className="flex items-center justify-center gap-2 text-purple-400 animate-pulse">
              <Monitor className="w-4 h-4" />
              <span className="text-sm font-medium">Sharing Screen</span>
            </div>
          )}
          {!teacherStream.audioEnabled && !teacherStream.videoEnabled && !teacherStream.isSharing && (
            <p className="text-zinc-500 text-sm">Waiting for teacher to start presenting...</p>
          )}
        </div>
        </div>
      )}

      {/* Status badges on corners */}
      {teacherStream.audioEnabled && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-full">
          <Mic className="h-4 w-4" />
          <span className="text-sm font-medium">Teacher Mic Active</span>
        </div>
      )}
      
      {teacherStream.isSharing && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-purple-500 text-white px-3 py-2 rounded-full">
          <Monitor className="h-4 w-4" />
          <span className="text-sm font-medium">Teacher Sharing Screen</span>
        </div>
      )}

      {teacherStream.videoEnabled && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-full">
          <Video className="h-4 w-4" />
          <span className="text-sm font-medium">Teacher Camera On</span>
        </div>
      )}
    </div>
  );
}
