'use client';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children, requireRole = null, fallbackUrl = '/auth' }) {
  const { isAuthenticated, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(fallbackUrl);
        return;
      }

      if (requireRole && userProfile?.role !== requireRole) {
        router.push('/'); // Redirect to home if role doesn't match
        return;
      }
    }
  }, [isAuthenticated, userProfile, loading, requireRole, router, fallbackUrl]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Checking authentication...</div>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated || (requireRole && userProfile?.role !== requireRole)) {
    return null;
  }

  return children;
}
