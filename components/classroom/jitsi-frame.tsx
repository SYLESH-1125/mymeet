'use client';

import { useEffect, useRef, useState } from 'react';

interface JitsiMeetAPI {
  executeCommand: (command: string, ...args: any[]) => void;
  addListener: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
  dispose: () => void;
  getParticipantsInfo: () => any[];
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface JitsiFrameProps {
  roomName: string;
  userDisplayName: string;
  isTeacher: boolean;
  userEmail?: string;
  onReady?: () => void;
  onParticipantJoined?: (participant: any) => void;
  onParticipantLeft?: (participant: any) => void;
}

// Teacher emails who get full moderator rights
const MODERATOR_EMAILS = [
  'syleshp.cse2024@citchennai.net',
  'sanjays0709.cse2024@citchennai.net',
];

export default function JitsiFrame({
  roomName,
  userDisplayName,
  isTeacher,
  userEmail,
  onReady,
  onParticipantJoined,
  onParticipantLeft,
}: JitsiFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiMeetAPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is a moderator
  const isModerator = userEmail && MODERATOR_EMAILS.includes(userEmail.toLowerCase());

  useEffect(() => {
    // Load Jitsi API script
    const loadJitsiScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.defer = true; // Defer loading for better performance
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Jitsi script'));
        document.body.appendChild(script);
      });
    };

    const initializeJitsi = async () => {
      try {
        // Add small delay to prevent UI freeze
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await loadJitsiScript();

        if (!containerRef.current) return;

        console.log(`🎥 Initializing Jitsi - Role: ${isModerator ? 'TEACHER' : 'STUDENT'}`);
        console.log(`📋 Config - startSilent: ${!isModerator}, disableInitialGUM: ${!isModerator}`);

        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: containerRef.current,
          userInfo: {
            displayName: userDisplayName,
            email: userEmail,
            moderator: isModerator, // Moderators get full control
          },
          configOverwrite: {
            // SFU Bandwidth & CPU Control
            disableDeepLinking: true,
            prejoinPageEnabled: false, // CRITICAL: Skip prejoin completely for EVERYONE
            enableLayerSuspension: true,
            resolution: isModerator ? 720 : 360, // Lower res for students
            constraints: {
              video: isModerator ? {
                height: { ideal: 720, max: 720 },
                frameRate: { max: 24 },
              } : false, // NO video for students
              audio: true, // Allow audio for everyone (teachers can use mic)
            },
            disableSimulcast: !isModerator, // Simulcast only for teachers
            enableNoAudioDetection: true,
            enableNoisyMicDetection: true,
            channelLastN: 1, // Students receive only 1 active stream (teacher)
            
            // KEY FIX: Everyone joins directly, no prejoin screen
            startWithAudioMuted: !isModerator, // Only students muted
            startWithVideoMuted: !isModerator, // Only students without video initially
            startAudioOnly: !isModerator, // Students are audio-only
            
            // CRITICAL: No permission dialogs for ANYONE on join
            startSilent: true, // Skip ALL permission prompts on join
            disableInitialGUM: true, // Don't request devices on join
            
            disableTileView: true,
            
            // Performance optimizations
            lastN: isModerator ? 20 : 1,
            maxFullResolutionParticipants: 1,
            disableAudioLevels: !isModerator,
            disableSelfView: true, // No self-view for anyone (saves CPU)
            p2p: { enabled: false }, // Force SFU, no P2P
            
            // Screenshare optimization
            desktopSharingFrameRate: { min: 5, max: 15 },
            
            // Prefer H.264 for lower CPU on most devices
            preferH264: true,
            disableH264: false,
            
            // Disable features students don't need
            disableInviteFunctions: !isModerator,
            disableRemoteMute: !isModerator,
            hideConferenceSubject: !isModerator,
            hideConferenceTimer: !isModerator,
            disableProfile: !isModerator,
            disableBeforeUnloadHandlers: true,
            enableClosePage: false,
            
            // Recording off by default
            recordingService: { enabled: false },
            
            // Critical: Skip all prompts and device checks for EVERYONE
            disableAP: true, // Disable audio processing detection
            disableNS: true, // Disable noise suppression prompt
            disableAGC: true, // Disable auto gain control prompt
            startWithoutMediaPermissions: true, // Join without media for EVERYONE initially
          },
          interfaceConfigOverwrite: {
            TILE_VIEW_MAX_COLUMNS: 1,
            VIDEO_QUALITY_LABEL_DISABLED: true,
            DISABLE_FOCUS_INDICATOR: true,
            DISABLE_RINGING: true,
            HIDE_INVITE_MORE_HEADER: true,
            MOBILE_APP_PROMO: false,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_CHROME_EXTENSION_BANNER: false,
            DISABLE_VIDEO_BACKGROUND: !isModerator,
            DISABLE_DOMINANT_SPEAKER_INDICATOR: !isModerator,
            DISABLE_TRANSCRIPTION_SUBTITLES: true,
            OPTIMAL_BROWSERS: ['chrome', 'chromium', 'edge'],
            UNSUPPORTED_BROWSERS: [],
            
            // CRITICAL: Disable prejoin screen completely
            HIDE_DEEP_LINKING_LOGO: true,
            SHOW_PROMOTIONAL_CLOSE_PAGE: false,
            
            // Students: audio-only controls (no camera button)
            TOOLBAR_BUTTONS: isModerator
              ? [
                  'microphone',
                  // 'camera', // REMOVED - no camera button
                  'desktop', // Screen share only
                  'fullscreen',
                  'hangup',
                  'chat',
                  'settings',
                  'recording',
                  'livestreaming',
                  'videoquality',
                  'filmstrip',
                  'participants-pane',
                  'tileview',
                  'mute-everyone',
                  'mute-video-everyone',
                ]
              : ['microphone', 'fullscreen', 'hangup', 'raisehand'], // Students: audio only
            FILM_STRIP_MAX_HEIGHT: isModerator ? 120 : 0,
            VERTICAL_FILMSTRIP: false,
            VIDEO_LAYOUT_FIT: 'contain',
          },
        };

        const api = new window.JitsiMeetExternalAPI('meet.jit.si', options);
        apiRef.current = api;

        // Event listeners
        api.addListener('videoConferenceJoined', () => {
          console.log('✅ Joined Jitsi conference');
          setIsLoading(false);
          if (onReady) onReady();

          // For teachers: automatically enable camera and mic after joining (no prejoin needed)
          if (isModerator) {
            console.log('✅ Moderator joined - enabling mic only (no camera)');
            // Small delay to ensure conference is fully ready
            setTimeout(() => {
              api.executeCommand('toggleAudio'); // Unmute mic
              // NO camera toggle - removed as per user request
            }, 500);
          } else {
            // Students see tile view disabled, only receive teacher stream
            api.executeCommand('setTileView', false);
            console.log('✅ Student joined in audio-only mode');
          }
        });

        api.addListener('videoConferenceLeft', () => {
          console.log('Left Jitsi conference');
          setIsLoading(true);
        });

        api.addListener('readyToClose', () => {
          console.log('Jitsi ready to close');
        });

        // Additional loading check - sometimes videoConferenceJoined doesn't fire
        setTimeout(() => {
          if (isLoading) {
            console.log('⚠️  Timeout reached, forcing load complete');
            setIsLoading(false);
          }
        }, 5000); // 5 second timeout

        api.addListener('participantJoined', (participant: any) => {
          console.log('Participant joined:', participant.displayName);
          if (onParticipantJoined) onParticipantJoined(participant);
        });

        api.addListener('participantLeft', (participant: any) => {
          console.log('Participant left:', participant.displayName);
          if (onParticipantLeft) onParticipantLeft(participant);
        });

        // For students, ensure they're always viewing teacher in spotlight
        if (!isModerator) {
          api.executeCommand('setTileView', false);
        }
      } catch (error) {
        console.error('Failed to initialize Jitsi:', error);
        setIsLoading(false);
      }
    };

    initializeJitsi();

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [roomName, userDisplayName, isTeacher, isModerator, userEmail, onReady, onParticipantJoined, onParticipantLeft]);

  // Expose methods for parent components
  useEffect(() => {
    (window as any).jitsiAPI = apiRef.current;
  }, []);

  return (
    <div className="relative w-full h-full bg-zinc-900">
      <div ref={containerRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <div className="text-white text-sm font-medium">
              {isModerator ? 'Starting video session...' : 'Joining class...'}
            </div>
            <div className="text-zinc-400 text-xs">
              {isModerator 
                ? 'Camera and microphone will be requested after loading' 
                : 'Audio-only mode - no camera needed'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions to control Jitsi from outside
export const jitsiControls = {
  toggleAudio: () => {
    const api = (window as any).jitsiAPI;
    if (api) api.executeCommand('toggleAudio');
  },
  toggleVideo: () => {
    const api = (window as any).jitsiAPI;
    if (api) api.executeCommand('toggleVideo');
  },
  shareScreen: () => {
    const api = (window as any).jitsiAPI;
    if (api) api.executeCommand('toggleShareScreen');
  },
  hangup: () => {
    const api = (window as any).jitsiAPI;
    if (api) api.executeCommand('hangup');
  },
};
