'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Monitor, MonitorOff, Video, VideoOff } from 'lucide-react';
import { useTeacherStream } from '@/hooks/useTeacherStream';

interface WebRTCVideoProps {
  roomId: string;
  userName: string;
  isTeacher: boolean;
}

export default function WebRTCVideo({ roomId, userName, isTeacher }: WebRTCVideoProps) {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  const { teacherStream, updateTeacherStream } = useTeacherStream(roomId);

  // Set teacher name in Firestore when component mounts
  useEffect(() => {
    if (isTeacher && userName) {
      updateTeacherStream({ teacherName: userName });
    }
  }, [isTeacher, userName, updateTeacherStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleAudio = async () => {
    if (!isAudioEnabled) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        if (localStreamRef.current) {
          // Add audio track to existing stream
          stream.getAudioTracks().forEach(track => {
            localStreamRef.current?.addTrack(track);
          });
        } else {
          localStreamRef.current = stream;
        }
        
        setIsAudioEnabled(true);
        
        // Notify students that teacher's audio is on
        if (isTeacher) {
          updateTeacherStream({ audioEnabled: true });
        }
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access microphone. Please check permissions.');
      }
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(track => {
          track.stop();
          localStreamRef.current?.removeTrack(track);
        });
      }
      setIsAudioEnabled(false);
      
      // Notify students that teacher's audio is off
      if (isTeacher) {
        updateTeacherStream({ audioEnabled: false });
      }
    }
  };

  const toggleVideo = async () => {
    if (!isVideoEnabled) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        if (localStreamRef.current) {
          // Add video track to existing stream
          stream.getVideoTracks().forEach(track => {
            localStreamRef.current?.addTrack(track);
          });
        } else {
          localStreamRef.current = stream;
        }
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
        
        setIsVideoEnabled(true);
        
        // Notify students that teacher's video is on
        if (isTeacher) {
          updateTeacherStream({ videoEnabled: true, shareType: 'camera' });
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Could not access camera. Please check permissions.');
      }
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(track => {
          track.stop();
          localStreamRef.current?.removeTrack(track);
        });
        if (localVideoRef.current && !isScreenSharing) {
          localVideoRef.current.srcObject = null;
        }
      }
      setIsVideoEnabled(false);
      
      // Notify students that teacher's video is off
      if (isTeacher) {
        updateTeacherStream({ videoEnabled: false, shareType: 'none' });
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: {
            displaySurface: 'monitor'
          } as any,
          audio: false
        });
        
        // Stop video if active
        if (isVideoEnabled && localStreamRef.current) {
          localStreamRef.current.getVideoTracks().forEach(track => track.stop());
        }
        
        localStreamRef.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        setIsScreenSharing(true);
        setIsVideoEnabled(false); // Can't have both
        
        // Notify students that teacher is sharing screen
        if (isTeacher) {
          updateTeacherStream({ isSharing: true, shareType: 'screen' });
        }
        
        // Handle when user stops sharing from browser UI
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
          }
          // Notify students that sharing stopped
          if (isTeacher) {
            updateTeacherStream({ isSharing: false, shareType: 'none' });
          }
        };
      } catch (error) {
        console.error('Error sharing screen:', error);
        if (error instanceof Error && error.name !== 'NotAllowedError') {
          alert('Could not share screen. Please try again.');
        }
      }
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      setIsScreenSharing(false);
      
      // Notify students that sharing stopped
      if (isTeacher) {
        updateTeacherStream({ isSharing: false, shareType: 'none' });
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-zinc-900 flex flex-col items-center justify-center">
      {/* Video Display */}
      <div className="flex-1 w-full flex items-center justify-center p-4">
        {(isVideoEnabled || isScreenSharing) ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        ) : (
          <div className="text-center">
            <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{userName}</h2>
            <p className="text-zinc-400">
              {isTeacher ? 'Teacher' : 'Student'}
            </p>
            {isTeacher && (
              <p className="text-sm text-zinc-500 mt-4">
                Click controls below to start presenting
              </p>
            )}
            {!isTeacher && teacherStream.isSharing && (
              <p className="text-sm text-green-500 mt-4 animate-pulse">
                Teacher is {teacherStream.shareType === 'screen' ? 'sharing screen' : 'on camera'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      {isTeacher && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
          <Button
            onClick={toggleAudio}
            size="lg"
            variant={isAudioEnabled ? 'default' : 'secondary'}
            className="h-14 px-6"
          >
            {isAudioEnabled ? (
              <>
                <Mic className="h-5 w-5 mr-2" />
                Mute
              </>
            ) : (
              <>
                <MicOff className="h-5 w-5 mr-2" />
                Unmute
              </>
            )}
          </Button>

          <Button
            onClick={toggleVideo}
            size="lg"
            variant={isVideoEnabled ? 'default' : 'secondary'}
            className="h-14 px-6"
          >
            {isVideoEnabled ? (
              <>
                <Video className="h-5 w-5 mr-2" />
                Stop Video
              </>
            ) : (
              <>
                <VideoOff className="h-5 w-5 mr-2" />
                Start Video
              </>
            )}
          </Button>

          <Button
            onClick={toggleScreenShare}
            size="lg"
            variant={isScreenSharing ? 'destructive' : 'default'}
            className="h-14 px-6"
          >
            {isScreenSharing ? (
              <>
                <MonitorOff className="h-5 w-5 mr-2" />
                Stop Sharing
              </>
            ) : (
              <>
                <Monitor className="h-5 w-5 mr-2" />
                Share Screen
              </>
            )}
          </Button>
        </div>
      )}

      {/* Audio indicator */}
      {isAudioEnabled && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-full">
          <Mic className="h-4 w-4" />
          <span className="text-sm font-medium">Mic Active</span>
        </div>
      )}
      
      {/* Screen sharing indicator */}
      {isScreenSharing && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-full">
          <Monitor className="h-4 w-4" />
          <span className="text-sm font-medium">Sharing Screen</span>
        </div>
      )}
    </div>
  );
}
