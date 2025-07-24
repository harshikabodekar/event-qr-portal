// app/components/Navigation.js
// Main navigation component for the Event QR Portal
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const { user, userProfile, signOut, isAuthenticated } = useAuth();
  
  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/events', label: 'Events', icon: '📅' },
    { href: '/register', label: 'Register', icon: '📝' },
    { href: '/students', label: 'Students', icon: '👥' },
    { href: '/registrations', label: 'Event Registrations', icon: '📋' },
    { href: '/organizer', label: 'Organizer', icon: '⚙️' },
    { href: '/checkin', label: 'Check-in', icon: '✅' },
  ];

  return (
    <nav className="w-full bg-white shadow-md border-b border-gray-200 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎫</span>
            <span className="text-xl font-bold text-blue-600">Event QR Portal</span>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            
            {/* Authentication Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
                <div className="text-sm text-gray-600">
                  <span>👋 {userProfile?.name || user?.email}</span>
                  {userProfile?.role && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {userProfile.role}
                    </span>
                  )}
                </div>
                <button
                  onClick={signOut}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ml-4 ${
                  pathname === '/auth'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span>🔐</span>
                <span>Sign In/Up</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => {
                const menu = document.getElementById('mobile-menu');
                menu.classList.toggle('hidden');
              }}
              className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            >
              <span className="text-xl">☰</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div id="mobile-menu" className="hidden md:hidden pb-4">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => {
                  document.getElementById('mobile-menu').classList.add('hidden');
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
