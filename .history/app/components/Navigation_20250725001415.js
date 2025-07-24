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
    <nav className="w-full bg-gradient-to-r from-white to-purple-50 shadow-lg border-b border-purple-100 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎫</span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Event QR Portal</span>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                  pathname === item.href
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md'
                    : 'text-purple-700 hover:text-purple-800 hover:bg-purple-100'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            
            {/* Authentication Section */}
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-purple-200">
              <Link
                href="/profile"
                className="text-sm text-purple-700 hover:text-purple-800 px-3 py-2 rounded-lg hover:bg-purple-100 transition-all duration-300"
              >
                👋 {userProfile?.name || user?.email}
                {userProfile?.role && (
                  <span className="ml-2 px-2 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full text-xs font-medium">
                    {userProfile.role}
                  </span>
                )}
              </Link>
              <button
                onClick={signOut}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => {
                const menu = document.getElementById('mobile-menu');
                menu.classList.toggle('hidden');
              }}
              className="p-2 rounded-lg text-purple-700 hover:text-purple-800 hover:bg-purple-100 transition-all duration-300"
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
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                  pathname === item.href
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md'
                    : 'text-purple-700 hover:text-purple-800 hover:bg-purple-100'
                }`}
                onClick={() => {
                  document.getElementById('mobile-menu').classList.add('hidden');
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            
            {/* Mobile Authentication Section */}
            <div className="pt-2 border-t border-purple-200">
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-purple-700 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-all duration-300"
                onClick={() => {
                  document.getElementById('mobile-menu').classList.add('hidden');
                }}
              >
                👋 {userProfile?.name || user?.email}
                {userProfile?.role && (
                  <span className="ml-2 px-2 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full text-xs font-medium">
                    {userProfile.role}
                  </span>
                )}
              </Link>
              <button
                onClick={() => {
                  signOut();
                  document.getElementById('mobile-menu').classList.add('hidden');
                }}
                className="w-full text-left px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
