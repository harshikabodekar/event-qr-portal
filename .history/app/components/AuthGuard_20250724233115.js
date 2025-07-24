'use client';
import { useAuth } from '../contexts/AuthContext';
import { usePathname } from 'next/navigation';
import AuthPage from '../auth/page';

export default function AuthGuard({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <div className="text-xl text-gray-600 mb-2">Event QR Portal</div>
          <div className="text-sm text-gray-500">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show the auth page
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // If user is authenticated, show the app content
  return children;
}
