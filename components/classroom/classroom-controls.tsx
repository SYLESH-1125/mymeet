'use client';

import { useRoomState } from '@/hooks/useRoomState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Presentation,
  Pencil,
  Code,
  Play,
  Square,
  MonitorUp,
  Copy,
  Check,
} from 'lucide-react';
import { useState } from 'react';
import { toggleClassLive } from '@/lib/classApi';

interface ClassroomControlsProps {
  classId: string;
  classCode: string;
  isTeacher: boolean;
  isLive: boolean;
  onLiveChange: (isLive: boolean) => void;
}

export function ClassroomControls({
  classId,
  classCode,
  isTeacher,
  isLive,
  onLiveChange,
}: ClassroomControlsProps) {
  const { roomState, updateMode, updateScreenSharing } = useRoomState(classId);
  const [copied, setCopied] = useState(false);

  const handleToggleLive = async () => {
    const newLiveState = !isLive;
    await toggleClassLive(classId, newLiveState);
    onLiveChange(newLiveState);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleModeChange = (mode: 'whiteboard' | 'code' | 'presenting') => {
    updateMode(mode);
  };

  return (
    <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Class info */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Class</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            className="font-mono"
          >
            {classCode}
            {copied ? (
              <Check className="w-3 h-3 ml-2 text-green-500" />
            ) : (
              <Copy className="w-3 h-3 ml-2" />
            )}
          </Button>
        </div>

        {/* Live status */}
        {isLive && (
          <Badge variant="destructive" className="animate-pulse">
            LIVE
          </Badge>
        )}
      </div>

      {isTeacher && (
        <div className="flex items-center gap-3">
          {/* Mode selector */}
          <div className="flex gap-2 border rounded p-1">
            <Button
              variant={roomState?.mode === 'presenting' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleModeChange('presenting')}
            >
              <Presentation className="w-4 h-4 mr-1" />
              Present
            </Button>
            <Button
              variant={roomState?.mode === 'whiteboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleModeChange('whiteboard')}
            >
              <Pencil className="w-4 h-4 mr-1" />
              Whiteboard
            </Button>
            <Button
              variant={roomState?.mode === 'code' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleModeChange('code')}
            >
              <Code className="w-4 h-4 mr-1" />
              Code
            </Button>
          </div>

          {/* Screen share (only in presenting mode) */}
          {roomState?.mode === 'presenting' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Jitsi will handle the screen share
                const api = (window as any).jitsiAPI;
                if (api) {
                  api.executeCommand('toggleShareScreen');
                  updateScreenSharing(!roomState.screenSharing);
                }
              }}
            >
              <MonitorUp className="w-4 h-4 mr-1" />
              Share Screen
            </Button>
          )}

          {/* Start/Stop class */}
          <Button
            variant={isLive ? 'destructive' : 'default'}
            size="sm"
            onClick={handleToggleLive}
          >
            {isLive ? (
              <>
                <Square className="w-4 h-4 mr-1" />
                Stop Class
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Start Class
              </>
            )}
          </Button>
        </div>
      )}

      {!isTeacher && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {roomState?.mode === 'presenting' && 'Presentation Mode'}
            {roomState?.mode === 'whiteboard' && 'Whiteboard Mode'}
            {roomState?.mode === 'code' && 'Code Editor Mode'}
          </Badge>
        </div>
      )}
    </div>
  );
}
