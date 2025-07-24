'use client';
import Link from 'next/link';
import Navigation from './components/Navigation';
import { useAuth } from './contexts/AuthContext';

export default function HomePage() {
  const { isAuthenticated, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Event QR Portal
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Streamline your event management with QR code registration, check-ins, and student tracking.
          </p>
          
          {/* Authentication Status */}
          {isAuthenticated ? (
            <div className="mt-8 p-4 bg-green-50 rounded-lg max-w-md mx-auto">
              <p className="text-green-800">
                Welcome back, <strong>{userProfile?.name || 'User'}</strong>!
              </p>
              <p className="text-sm text-green-600 mt-1">
                Role: {userProfile?.role?.charAt(0)?.toUpperCase() + userProfile?.role?.slice(1)}
              </p>
              <Link 
                href="/profile" 
                className="mt-2 inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                View Profile
              </Link>
            </div>
          ) : (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
              <p className="text-blue-800 mb-3">
                Sign in to access all features
              </p>
              <Link 
                href="/auth" 
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              >
                Sign In / Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Role-based Feature Cards */}
        <div className="mt-16">
          {isAuthenticated ? (
            // Authenticated user cards
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Always show events */}
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-3xl mb-4">📅</div>
                <h3 className="text-lg font-semibold text-gray-900">Browse Events</h3>
                <p className="mt-2 text-gray-600">View all available events and register for ones that interest you.</p>
                <Link href="/events" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                  View Events
                </Link>
              </div>

              {/* Student-specific cards */}
              {userProfile?.role === 'student' && (
                <>
                  <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="text-3xl mb-4">📝</div>
                    <h3 className="text-lg font-semibold text-black">Update Profile</h3>
                    <p className="mt-2 text-black">Complete your student profile for event registration.</p>
                    <Link href="/register" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                      Update Profile
                    </Link>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="text-3xl mb-4">🎫</div>
                    <h3 className="text-lg font-semibold text-black">My Registrations</h3>
                    <p className="mt-2 text-black">View your event registrations and QR codes.</p>
                    <Link href="/profile" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                      My Profile
                    </Link>
                  </div>
                </>
              )}

              {/* Organizer/Admin cards */}
              {(userProfile?.role === 'organizer' || userProfile?.role === 'admin') && (
                <>
                  <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="text-3xl mb-4">⚙️</div>
                    <h3 className="text-lg font-semibold text-black">Organizer Dashboard</h3>
                    <p className="mt-2 text-black">Manage events, create new ones, and track registrations.</p>
                    <Link href="/organizer" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                      Dashboard
                    </Link>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="text-3xl mb-4">📋</div>
                    <h3 className="text-lg font-semibold text-black">Event Registrations</h3>
                    <p className="mt-2 text-black">View all event registrations and manage participants.</p>
                    <Link href="/registrations" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                      View Registrations
                    </Link>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="text-3xl mb-4">✅</div>
                    <h3 className="text-lg font-semibold text-black">QR Check-in</h3>
                    <p className="mt-2 text-black">Scan QR codes for event check-ins.</p>
                    <Link href="/checkin" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                      Check-in Scanner
                    </Link>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="text-3xl mb-4">👥</div>
                    <h3 className="text-lg font-semibold text-black">Student Management</h3>
                    <p className="mt-2 text-black">View and manage all registered students.</p>
                    <Link href="/students" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                      View Students
                    </Link>
                  </div>
                </>
              )}
            </div>
          ) : (
            // Non-authenticated user cards (general overview)
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-3xl mb-4">📅</div>
                <h3 className="text-lg font-semibold text-gray-900">Event Management</h3>
                <p className="mt-2 text-gray-600">Create and manage events with ease. Organize multiple events and track registrations.</p>
                <Link href="/auth" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                  Sign In to Access
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-3xl mb-4">�</div>
                <h3 className="text-lg font-semibold text-black">Student Registration</h3>
                <p className="mt-2 text-black">Quick and easy registration process with automatic QR code generation.</p>
                <Link href="/auth" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                  Sign In to Register
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-3xl mb-4">✅</div>
                <h3 className="text-lg font-semibold text-black">QR Check-in</h3>
                <p className="mt-2 text-black">Fast check-in process using QR code scanning technology.</p>
                <Link href="/auth" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                  Sign In to Use
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">🚀</div>
              <div className="mt-2 text-sm text-gray-600">Fast Setup</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">📱</div>
              <div className="mt-2 text-sm text-gray-600">Mobile Friendly</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">🔒</div>
              <div className="mt-2 text-sm text-gray-600">Secure</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">⚡</div>
              <div className="mt-2 text-sm text-gray-600">Real-time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
