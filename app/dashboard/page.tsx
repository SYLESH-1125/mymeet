'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import { createClass, joinClassByCode } from '@/lib/classApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Video, Plus, LogIn, User, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleCreateClass = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const { classId, code } = await createClass(user.uid);
      setShowCreateDialog(false);
      router.push(`/classroom/${classId}`);
    } catch (error) {
      console.error('Failed to create class:', error);
      setCreating(false);
    }
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode.trim()) return;
    
    setJoining(true);
    try {
      const classId = await joinClassByCode(classCode.toUpperCase());
      if (classId) {
        router.push(`/classroom/${classId}`);
      } else {
        alert('Class not found. Please check the code and try again.');
        setJoining(false);
      }
    } catch (error) {
      console.error('Failed to join class:', error);
      alert('Failed to join class. Please try again.');
      setJoining(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">EduMeet</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={profile.photoURL} />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{profile.displayName}</p>
                <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome back, {profile.displayName}!
            </h1>
            <p className="text-xl text-gray-600">
              {profile.role === 'teacher'
                ? 'Create a new class or join an existing one to start teaching'
                : 'Join a class using the code provided by your teacher'}
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {profile.role === 'teacher' && (
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowCreateDialog(true)}>
                <CardHeader>
                  <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                    <Plus className="w-7 h-7 text-indigo-600" />
                  </div>
                  <CardTitle className="text-2xl">Create Class</CardTitle>
                  <CardDescription className="text-base">
                    Start a new class with video, whiteboard, and code editor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" size="lg">
                    Create New Class
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card
              className={`hover:shadow-lg transition-shadow cursor-pointer ${
                profile.role === 'student' ? 'md:col-span-2' : ''
              }`}
              onClick={() => setShowJoinDialog(true)}
            >
              <CardHeader>
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <LogIn className="w-7 h-7 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Join Class</CardTitle>
                <CardDescription className="text-base">
                  Enter a class code to join an ongoing session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" size="lg">
                  Join with Code
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Class Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
            <DialogDescription>
              Click create to generate a unique class code that students can use to join.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button onClick={handleCreateClass} disabled={creating} className="w-full" size="lg">
              {creating ? 'Creating...' : 'Create Class'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Class Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Class</DialogTitle>
            <DialogDescription>
              Enter the 6-character class code provided by your teacher
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleJoinClass} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="classCode">Class Code</Label>
              <Input
                id="classCode"
                placeholder="ABC123"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="uppercase text-center text-2xl tracking-widest font-mono"
                required
              />
            </div>
            <Button type="submit" disabled={joining} className="w-full" size="lg">
              {joining ? 'Joining...' : 'Join Class'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
