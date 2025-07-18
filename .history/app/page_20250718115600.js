'use client';
import Link from 'next/link';
import Navigation from './components/Navigation';

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
        </div>

        {/* Feature Cards */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Event Management */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-3xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-gray-900">Event Management</h3>
              <p className="mt-2 text-gray-600">Create and manage events with ease. Organize multiple events and track registrations.</p>
              <Link href="/events" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Manage Events
              </Link>
            </div>

            {/* Student Registration */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-3xl mb-4">📝</div>
              <h3 className="text-lg font-semibold black">Student Registration</h3>
              <p className="mt-2 black">Quick and easy registration process with automatic QR code generation.</p>
              <Link href="/register" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Register Now
              </Link>
            </div>

            {/* QR Check-in */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-3xl mb-4">✅</div>
              <h3 className="text-lg font-semibold black">QR Check-in</h3>
              <p className="mt-2 black">Fast check-in process using QR code scanning technology.</p>
              <Link href="/checkin" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Check-in Scanner
              </Link>
            </div>

            {/* Student Management */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-lg font-semibold text-gray-900">Student Management</h3>
              <p className="mt-2 text-gray-600">View, edit, and manage all registered students in one place.</p>
              <Link href="/students" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                View Students
              </Link>
            </div>

            {/* Organizer Dashboard */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-3xl mb-4">⚙️</div>
              <h3 className="text-lg font-semibold text-gray-900">Organizer Dashboard</h3>
              <p className="mt-2 text-gray-600">Advanced admin features for event organizers and administrators.</p>
              <Link href="/organizer" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                Admin Panel
              </Link>
            </div>

            {/* Analytics */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900">Real-time Analytics</h3>
              <p className="mt-2 text-gray-600">Track registration numbers, check-in rates, and event statistics.</p>
              <div className="mt-4 inline-block bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed">
                Coming Soon
              </div>
            </div>
          </div>
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
