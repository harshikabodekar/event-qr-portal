'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { Toaster, toast } from 'react-hot-toast';
import Navigation from '../components/Navigation';

export default function ProfilePage() {
  const { user, userProfile, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    college: '',
    department: ''
  });
  const [stats, setStats] = useState({
    eventsRegistered: 0,
    eventsAttended: 0
  });

  useEffect(() => {
    if (userProfile) {
      setForm({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        college: userProfile.college || '',
        department: userProfile.department || ''
      });
      fetchUserStats();
    }
    setLoading(false);
  }, [userProfile]);

  const fetchUserStats = async () => {
    if (userProfile?.role === 'student') {
      try {
        // Get total events registered
        const { data: registrations, error: regError } = await supabase
          .from('event_registrations')
          .select('id')
          .eq('student_id', userProfile.id);

        // Get total events attended (checked in)
        const { data: attended, error: attendError } = await supabase
          .from('event_registrations')
          .select('id')
          .eq('student_id', userProfile.id)
          .not('checked_in_at', 'is', null);

        if (!regError && !attendError) {
          setStats({
            eventsRegistered: registrations?.length || 0,
            eventsAttended: attended?.length || 0
          });
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      let updateError;

      if (userProfile?.role === 'student') {
        // Update student profile
        const { error } = await supabase
          .from('students')
          .update({
            name: form.name,
            phone: form.phone,
            college: form.college,
            department: form.department
          })
          .eq('id', userProfile.id);
        updateError = error;
      } else {
        // Update user profile (organizer/admin)
        const { error } = await supabase
          .from('users')
          .update({
            name: form.name
          })
          .eq('id', userProfile.id);
        updateError = error;
      }

      if (updateError) {
        toast.error('Error updating profile: ' + updateError.message);
      } else {
        toast.success('Profile updated successfully!');
        // Refresh the page to get updated data
        window.location.reload();
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Profile update error:', error);
    }

    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto p-8">
        <Toaster />
          
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {userProfile?.name?.charAt(0)?.toUpperCase() || '👤'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{userProfile?.name || 'User'}</h1>
              <p className="text-gray-600">{userProfile?.email}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                userProfile?.role === 'admin' ? 'bg-red-100 text-red-800' :
                userProfile?.role === 'organizer' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {userProfile?.role?.charAt(0)?.toUpperCase() + userProfile?.role?.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    required
                  />
                </div>

                {userProfile?.role === 'student' && (
                  <>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>

                    <div>
                      <label htmlFor="college" className="block text-sm font-medium text-gray-700 mb-1">
                        College/University
                      </label>
                      <input
                        id="college"
                        name="college"
                        type="text"
                        value={form.college}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>

                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                        Department/Major
                      </label>
                      <input
                        id="department"
                        name="department"
                        type="text"
                        value={form.department}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      />
                    </div>
                  </>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updating ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Stats & Info */}
          <div className="space-y-6">
            {userProfile?.role === 'student' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Event Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Events Registered:</span>
                    <span className="text-2xl font-bold text-blue-600">{stats.eventsRegistered}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Events Attended:</span>
                    <span className="text-2xl font-bold text-green-600">{stats.eventsAttended}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {userProfile?.role === 'student' && (
                  <>
                    <a
                      href="/events"
                      className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Browse Events
                    </a>
                    <a
                      href="/register"
                      className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Student Registration
                    </a>
                  </>
                )}
                {(userProfile?.role === 'organizer' || userProfile?.role === 'admin') && (
                  <>
                    <a
                      href="/organizer"
                      className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Organizer Dashboard
                    </a>
                    <a
                      href="/registrations"
                      className="block w-full text-center bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      View Registrations
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Account Info</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Email:</strong> {userProfile?.email}</p>
                <p><strong>Role:</strong> {userProfile?.role}</p>
                <p><strong>Member since:</strong> {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
