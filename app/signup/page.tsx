'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithGoogle } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error: any) {
      // Handle specific Firebase errors
      if (error?.code === 'auth/popup-closed-by-user') {
        // User closed popup - this is normal, just ignore it
        console.log('Sign-up popup was closed');
        return;
      }
      
      if (error?.code === 'auth/cancelled-popup-request') {
        // Multiple popups opened - ignore
        console.log('Sign-up cancelled');
        return;
      }
      
      if (error?.code === 'auth/internal-error') {
        alert('Please enable Google Sign-In in Firebase Console first.\n\nGo to: Firebase Console → Authentication → Sign-in method → Enable Google');
        return;
      }
      
      // For other errors, show a user-friendly message
      console.error('Failed to sign up:', error);
      alert('Failed to sign up. Please try again or check your internet connection.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join EduMeet and start your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGoogleSignUp} className="w-full h-12 text-base" size="lg">
            Sign up with Google
          </Button>
          <div className="text-center text-sm text-gray-500">
            Already have an account? <Link href="/login" className="text-indigo-600 hover:underline font-medium">Sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
