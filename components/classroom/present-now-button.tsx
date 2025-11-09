'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, Loader2 } from 'lucide-react';
import { jitsiControls } from './jitsi-frame';

interface PresentNowButtonProps {
  isTeacher: boolean;
}

export default function PresentNowButton({ isTeacher }: PresentNowButtonProps) {
  const [isPresenting, setIsPresenting] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  if (!isTeacher) return null;

  const handlePresentNow = async () => {
    setIsActivating(true);
    
    try {
      // Activate camera and mic
      jitsiControls.startPresenting();
      
      // Small delay to show activation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setIsPresenting(true);
    } catch (error) {
      console.error('Error starting presentation:', error);
    } finally {
      setIsActivating(false);
    }
  };

  const handleStopPresenting = () => {
    jitsiControls.stopPresenting();
    setIsPresenting(false);
  };

  if (isPresenting) {
    return (
      <Button
        onClick={handleStopPresenting}
        variant="destructive"
        size="lg"
        className="shadow-lg"
      >
        <VideoOff className="h-5 w-5 mr-2" />
        Stop Presenting
      </Button>
    );
  }

  return (
    <Button
      onClick={handlePresentNow}
      disabled={isActivating}
      size="lg"
      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg animate-pulse"
    >
      {isActivating ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Activating...
        </>
      ) : (
        <>
          <Mic className="h-5 w-5 mr-2" />
          Present Now
        </>
      )}
    </Button>
  );
}
