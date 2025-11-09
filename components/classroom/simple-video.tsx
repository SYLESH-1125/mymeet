'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Monitor, MonitorOff } from 'lucide-react';

interface SimpleVideoProps {
  roomName: string;
  userDisplayName: string;
  isTeacher: boolean;
}

export default function SimpleVideo({ roomName, userDisplayName, isTeacher }: SimpleVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const toggleAudio = async () => {
    if (!isAudioEnabled) {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(audioStream);
        setIsAudioEnabled(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setIsAudioEnabled(false);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
          videoRef.current.play();
        }
        
        setIsScreenSharing(true);
        
        // Stop sharing when user stops from browser UI
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        };
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsScreenSharing(false);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const videoStream = videoRef.current.srcObject as MediaStream;
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="relative w-full h-full bg-zinc-900 flex flex-col items-center justify-center">
      {/* Video Display */}
      <div className="flex-1 w-full flex items-center justify-center p-4">
        {isScreenSharing ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        ) : (
          <div className="text-center">
            <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl font-bold text-white">
                {userDisplayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{userDisplayName}</h2>
            <p className="text-zinc-400">
              {isTeacher ? 'Teacher' : 'Student'}
            </p>
            {isTeacher && !isScreenSharing && (
              <p className="text-sm text-zinc-500 mt-4">
                Click "Share Screen" to start presenting
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
    </div>
  );
}
