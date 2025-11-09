'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRoomState } from '@/hooks/useRoomState';
import { useRoomPresence } from '@/hooks/useRoomPresence';
import { getClassInfo } from '@/lib/classApi';
import { ClassroomControls } from '@/components/classroom/classroom-controls';
import { TeacherSidebar } from '@/components/classroom/teacher-sidebar';
import StudentControls from '@/components/classroom/student-controls';
import JitsiFrame from '@/components/classroom/jitsi-frame';
import WhiteboardPanel from '@/components/classroom/whiteboard-panel';
import CodeEditorPanel from '@/components/classroom/code-editor-panel';

export default function ClassroomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const classId = resolvedParams.id;
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { roomState } = useRoomState(classId);
  const { studentCount } = useRoomPresence(classId);
  
  const [classInfo, setClassInfo] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/login');
      return;
    }

    if (classId && user) {
      // Load class info
      getClassInfo(classId).then((info) => {
        if (info) {
          setClassInfo(info);
          setIsLive(info.isLive);
        } else {
          alert('Class not found');
          router.push('/dashboard');
        }
        setLoading(false);
      });
    }
  }, [classId, user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading classroom...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile || !classInfo) {
    return null;
  }

  const isTeacher = profile.role === 'teacher';
  const currentMode = roomState?.mode || 'presenting';

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Controls */}
      <ClassroomControls
        classId={classId}
        classCode={classInfo.code}
        isTeacher={isTeacher}
        isLive={isLive}
        onLiveChange={setIsLive}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main View Area */}
        <div className="flex-1 flex flex-col">
          {/* Content based on mode */}
          <div className="flex-1 relative bg-gray-900">
            {currentMode === 'presenting' && (
              <JitsiFrame
                roomName={classId}
                userDisplayName={profile.displayName}
                isTeacher={isTeacher}
              />
            )}

            {currentMode === 'whiteboard' && (
              <WhiteboardPanel classId={classId} isTeacher={isTeacher} />
            )}

            {currentMode === 'code' && (
              <CodeEditorPanel classId={classId} isTeacher={isTeacher} />
            )}
          </div>
        </div>

        {/* Teacher Sidebar */}
        {isTeacher && (
          <div className="w-96 flex-shrink-0">
            <TeacherSidebar classId={classId} />
          </div>
        )}
      </div>

      {/* Student Controls (floating) */}
      {!isTeacher && (
        <StudentControls classId={classId} studentCount={studentCount} />
      )}
    </div>
  );
}
