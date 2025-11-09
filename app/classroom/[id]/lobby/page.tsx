'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Video, VideoOff, Mic, MicOff, Users } from 'lucide-react';

export default function ClassroomLobby() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const classId = params.id as string;

  const [displayName, setDisplayName] = useState('');
  const [className, setClassName] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load class info and user preferences
  useEffect(() => {
    const loadClassInfo = async () => {
      if (!user) return;

      try {
        // Get class info
        const classDoc = await getDoc(doc(db, 'classes', classId));
        if (classDoc.exists()) {
          const classData = classDoc.data();
          setClassName(classData.title || 'Class');
          setIsTeacher(classData.ownerUid === user.uid);
        }

        // Set default display name from user
        setDisplayName(user.displayName || user.email?.split('@')[0] || '');
      } catch (error) {
        console.error('Error loading class:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClassInfo();
  }, [user, classId]);

  const handleJoinClass = () => {
    if (!displayName.trim()) return;

    // Store preferences in sessionStorage
    sessionStorage.setItem('classroomDisplayName', displayName);
    sessionStorage.setItem('classroomRole', isTeacher ? 'teacher' : 'student');

    setJoining(true);

    // Navigate to classroom
    router.push(`/classroom/${classId}`);
  };

  // Show loading while checking auth or loading class
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-lg">Loading class...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Video className="h-8 w-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Ready to join?
            </h1>
            <p className="text-gray-600">
              {className}
            </p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 rounded-full">
              <Users className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-600">
                {isTeacher ? 'Teacher' : 'Student'}
              </span>
            </div>
          </div>

          {/* Display Name Input */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="text-lg h-12"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && displayName.trim()) {
                    handleJoinClass();
                  }
                }}
              />
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Mic className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Audio Ready</h3>
                    <p className="text-xs text-gray-600">
                      {isTeacher ? 'Mic will activate when needed' : 'Ask to speak anytime'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {isTeacher ? (
                      <Video className="h-5 w-5 text-blue-600" />
                    ) : (
                      <VideoOff className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {isTeacher ? 'Camera Available' : 'Audio Only'}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {isTeacher ? 'Share when ready' : 'No camera needed'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Join Button */}
            <Button
              onClick={handleJoinClass}
              disabled={!displayName.trim() || joining}
              className="w-full h-14 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700"
            >
              {joining ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Joining...
                </>
              ) : (
                <>
                  <Video className="h-5 w-5 mr-2" />
                  Join {className}
                </>
              )}
            </Button>

            {/* Info Text */}
            <p className="text-center text-sm text-gray-500">
              {isTeacher ? (
                <>
                  You'll join as <strong>Teacher</strong> with full controls. 
                  Click "Present Now" when ready to share camera.
                </>
              ) : (
                <>
                  You'll join as <strong>Student</strong> in audio-only mode. 
                  No camera permissions needed!
                </>
              )}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
