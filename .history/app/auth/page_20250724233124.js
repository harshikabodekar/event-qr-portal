'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Toaster, toast } from 'react-hot-toast';
import Navigation from '../components/Navigation';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'student' // student, organizer, admin
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function toggleMode() {
    setIsSignUp(!isSignUp);
    setForm({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      role: 'student'
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Basic validation
    if (!form.email || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Password validation
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (isSignUp) {
      // Sign Up validation
      if (!form.name) {
        toast.error('Please enter your name');
        return;
      }

      if (form.password !== form.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.email.trim().toLowerCase(),
          password: form.password,
          options: {
            data: {
              name: form.name,
              role: form.role
            }
          }
        });

        if (authError) {
          toast.error('Sign up failed: ' + authError.message);
        } else {
          toast.success('Sign up successful! Please check your email for verification.');
          
          // Create user profile based on role
          if (form.role === 'student') {
            // Create student profile
            const { error: studentError } = await supabase
              .from('students')
              .insert([{
                id: authData.user.id,
                email: form.email.trim().toLowerCase(),
                name: form.name,
                phone: '',
                college: '',
                department: ''
              }]);

            if (studentError) {
              console.error('Error creating student profile:', studentError);
            }
          } else {
            // Create organizer/admin profile in a users table (you may need to create this table)
            const { error: userError } = await supabase
              .from('users')
              .insert([{
                id: authData.user.id,
                email: form.email.trim().toLowerCase(),
                name: form.name,
                role: form.role
              }]);

            if (userError) {
              console.error('Error creating user profile:', userError);
              // Don't show error to user as auth was successful
            }
          }
          
          // Reset form
          setForm({
            email: '',
            password: '',
            confirmPassword: '',
            name: '',
            role: 'student'
          });
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email.trim().toLowerCase(),
          password: form.password
        });

        if (error) {
          toast.error('Sign in failed: ' + error.message);
        } else {
          toast.success('Sign in successful!');
          
          // No need to redirect manually, AuthGuard will handle it
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error('Auth error:', err);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Toaster />
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {isSignUp 
                ? 'Sign up to access the Event QR Portal' 
                : 'Sign in to your account'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    required={isSignUp}
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  >
                    <option value="student">Student</option>
                    <option value="organizer">Organizer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                required
              />
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  required={isSignUp}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading 
                ? (isSignUp ? 'Creating Account...' : 'Signing In...') 
                : (isSignUp ? 'Create Account' : 'Sign In')
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={toggleMode}
                className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* Additional options */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <a
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 max-w-md text-center">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Account Types</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Student:</strong> Register for events, get QR codes, check-in</p>
              <p><strong>Organizer:</strong> Manage events, view registrations</p>
              <p><strong>Admin:</strong> Full system access and management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
