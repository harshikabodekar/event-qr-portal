'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage() {
  const { isAuthenticated } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'student' // student, organizer, admin
  });

  // Show redirecting state when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setRedirecting(true);
    }
  }, [isAuthenticated]);

  // If redirecting, show loading state
  if (redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-6"></div>
          <div className="text-xl bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2 font-bold">Welcome to Event QR Portal!</div>
          <div className="text-sm text-purple-600">Taking you to your dashboard...</div>
        </div>
      </div>
    );
  }

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
          if (authError.message.includes('Email not confirmed')) {
            toast.error('Please check your email and click the confirmation link before signing in.');
          } else {
            toast.error('Sign up failed: ' + authError.message);
          }
        } else {
          // Check if email confirmation is required
          if (authData.user && !authData.user.email_confirmed_at) {
            toast.success('Account created! Please check your email and click the confirmation link to complete registration.');
            
            // Reset form
            setForm({
              email: '',
              password: '',
              confirmPassword: '',
              name: '',
              role: 'student'
            });
          } else {
            // Create user profile based on role
            try {
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
                // Create organizer/admin profile
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
                }
              }
            } catch (profileError) {
              console.error('Profile creation error:', profileError);
            }
            
            toast.success('Account created successfully! Welcome to Event QR Portal!');
            
            // Reset form
            setForm({
              email: '',
              password: '',
              confirmPassword: '',
              name: '',
              role: 'student'
            });

            // Small delay to ensure auth state updates
            setTimeout(() => {
              console.log('Sign up successful, AuthGuard should handle redirect');
            }, 100);
          }
        }
      } else {
        // Sign In
        console.log('Attempting sign in with:', { email: form.email.trim().toLowerCase() });
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email.trim().toLowerCase(),
          password: form.password
        });

        console.log('Sign in response:', { data, error });

        if (error) {
          console.error('Sign in error details:', error);
          
          if (error.message.includes('Email not confirmed')) {
            toast.error('Please check your email and click the confirmation link before signing in.');
          } else if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password. Please check your credentials and try again.');
          } else if (error.message.includes('Email rate limit exceeded')) {
            toast.error('Too many attempts. Please wait a few minutes before trying again.');
          } else {
            toast.error('Sign in failed: ' + error.message);
          }
        } else {
          console.log('Sign in successful:', data);
          toast.success('Sign in successful! Welcome back!');
          
          // Small delay to ensure auth state updates
          setTimeout(() => {
            console.log('Sign in successful, AuthGuard should handle redirect');
          }, 100);
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error('Auth error:', err);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Toaster />
        
        {/* Logo/Brand Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎫</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">Event QR Portal</h1>
          <p className="text-purple-700 max-w-md">
            Streamline your event management with QR code registration, check-ins, and student tracking.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-purple-100">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-purple-900 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-purple-600">
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
                    className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black bg-purple-50/30"
                    required={isSignUp}
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-purple-700 mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black bg-purple-50/30"
                  >
                    <option value="student">Student</option>
                    <option value="organizer">Organizer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-purple-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black bg-purple-50/30"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-purple-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black bg-purple-50/30"
                required
              />
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black bg-purple-50/30"
                  required={isSignUp}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {loading 
                ? (isSignUp ? 'Creating Account...' : 'Signing In...') 
                : (isSignUp ? '✨ Create Account' : '🚀 Sign In')
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-purple-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={toggleMode}
                className="ml-1 text-purple-700 hover:text-purple-800 font-medium underline decoration-purple-300 hover:decoration-purple-500 transition-all duration-300"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* Additional options */}
          <div className="mt-4 pt-4 border-t border-purple-200">
            <div className="text-center">
              <p className="text-xs text-purple-500">
                🔒 Secure authentication powered by Supabase
              </p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 max-w-md text-center">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-purple-100">
            <h3 className="font-semibold text-purple-900 mb-3">Account Types</h3>
            <div className="text-sm text-purple-700 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span><strong>Student:</strong> Register for events, get QR codes, check-in</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                <span><strong>Organizer:</strong> Manage events, view registrations</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-800 rounded-full"></span>
                <span><strong>Admin:</strong> Full system access and management</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
