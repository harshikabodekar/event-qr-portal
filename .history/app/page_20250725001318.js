'use client';
import Link from 'next/link';
import Navigation from './components/Navigation';
import { useAuth } from './contexts/AuthContext';

export default function HomePage() {
  const { userProfile } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <Navigation />
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent sm:text-5xl md:text-6xl">
            Event QR Portal
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-purple-700 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Streamline your event management with QR code registration, check-ins, and student tracking.
          </p>
          
          {/* Welcome Message */}
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl max-w-md mx-auto shadow-lg border border-purple-200">
            <p className="text-purple-800 text-lg">
              Welcome back, <strong>{userProfile?.name || 'User'}</strong>! ✨
            </p>
            <p className="text-sm text-purple-600 mt-2">
              Role: {userProfile?.role?.charAt(0)?.toUpperCase() + userProfile?.role?.slice(1)}
            </p>
            <Link 
              href="/profile" 
              className="mt-4 inline-block bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              View Profile
            </Link>
          </div>
        </div>

        {/* Role-based Feature Cards */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Always show events */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-purple-100 hover:border-purple-200 transform hover:-translate-y-1">
              <div className="text-3xl mb-4 bg-gradient-to-r from-purple-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-white">📅</div>
              <h3 className="text-lg font-semibold text-purple-900">Browse Events</h3>
              <p className="mt-2 text-purple-700">View all available events and register for ones that interest you.</p>
              <Link href="/events" className="mt-4 inline-block bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg">
                View Events
              </Link>
            </div>

            {/* Student-specific cards */}
            {userProfile?.role === 'student' && (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-purple-100 hover:border-purple-200 transform hover:-translate-y-1">
                  <div className="text-3xl mb-4 bg-gradient-to-r from-purple-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-white">📝</div>
                  <h3 className="text-lg font-semibold text-purple-900">Update Profile</h3>
                  <p className="mt-2 text-purple-700">Complete your student profile for event registration.</p>
                  <Link href="/register" className="mt-4 inline-block bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg">
                    Update Profile
                  </Link>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-purple-100 hover:border-purple-200 transform hover:-translate-y-1">
                  <div className="text-3xl mb-4 bg-gradient-to-r from-purple-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-white">🎫</div>
                  <h3 className="text-lg font-semibold text-purple-900">My Registrations</h3>
                  <p className="mt-2 text-purple-700">View your event registrations and QR codes.</p>
                  <Link href="/profile" className="mt-4 inline-block bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg">
                    My Profile
                  </Link>
                </div>
              </>
            )}

            {/* Organizer/Admin cards */}
            {(userProfile?.role === 'organizer' || userProfile?.role === 'admin') && (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-purple-100 hover:border-purple-200 transform hover:-translate-y-1">
                  <div className="text-3xl mb-4 bg-gradient-to-r from-purple-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-white">⚙️</div>
                  <h3 className="text-lg font-semibold text-purple-900">Organizer Dashboard</h3>
                  <p className="mt-2 text-purple-700">Manage events, create new ones, and track registrations.</p>
                  <Link href="/organizer" className="mt-4 inline-block bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg">
                    Dashboard
                  </Link>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-purple-100 hover:border-purple-200 transform hover:-translate-y-1">
                  <div className="text-3xl mb-4 bg-gradient-to-r from-purple-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-white">📋</div>
                  <h3 className="text-lg font-semibold text-purple-900">Event Registrations</h3>
                  <p className="mt-2 text-purple-700">View all event registrations and manage participants.</p>
                  <Link href="/registrations" className="mt-4 inline-block bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg">
                    View Registrations
                  </Link>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-purple-100 hover:border-purple-200 transform hover:-translate-y-1">
                  <div className="text-3xl mb-4 bg-gradient-to-r from-purple-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-white">✅</div>
                  <h3 className="text-lg font-semibold text-purple-900">QR Check-in</h3>
                  <p className="mt-2 text-purple-700">Scan QR codes for event check-ins.</p>
                  <Link href="/checkin" className="mt-4 inline-block bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg">
                    Check-in Scanner
                  </Link>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-purple-100 hover:border-purple-200 transform hover:-translate-y-1">
                  <div className="text-3xl mb-4 bg-gradient-to-r from-purple-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-white">👥</div>
                  <h3 className="text-lg font-semibold text-purple-900">Student Management</h3>
                  <p className="mt-2 text-purple-700">View and manage all registered students.</p>
                  <Link href="/students" className="mt-4 inline-block bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg">
                    View Students
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 bg-gradient-to-r from-white to-purple-50 rounded-xl shadow-lg p-8 border border-purple-100">
          <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-8">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-lg hover:bg-purple-50 transition-colors duration-300">
              <div className="text-4xl font-bold text-purple-600 mb-2">🚀</div>
              <div className="mt-2 text-sm text-purple-700 font-medium">Fast Setup</div>
            </div>
            <div className="p-4 rounded-lg hover:bg-purple-50 transition-colors duration-300">
              <div className="text-4xl font-bold text-purple-600 mb-2">📱</div>
              <div className="mt-2 text-sm text-purple-700 font-medium">Mobile Friendly</div>
            </div>
            <div className="p-4 rounded-lg hover:bg-purple-50 transition-colors duration-300">
              <div className="text-4xl font-bold text-purple-600 mb-2">🔒</div>
              <div className="mt-2 text-sm text-purple-700 font-medium">Secure</div>
            </div>
            <div className="p-4 rounded-lg hover:bg-purple-50 transition-colors duration-300">
              <div className="text-4xl font-bold text-purple-600 mb-2">⚡</div>
              <div className="mt-2 text-sm text-purple-700 font-medium">Real-time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
