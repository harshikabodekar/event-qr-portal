'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

/**
 * AuthPage Component
 * 
 * This is the main authentication page that handles both sign-in and sign-up functionality
 * for the Event QR Portal. It provides a unified interface for users to create accounts
 * or log into existing ones, with role-based access control.
 * 
 * Features:
 * - Toggle between sign-in and sign-up modes
 * - Role-based registration (student, organizer, admin)
 * - Email confirmation handling
 * - Automatic profile creation based on user role
 * - Test user creation for development
 * - Connection testing with Supabase
 * - Loading and redirect states
 */
export default function AuthPage() {
  // Get authentication state from context
  const { isAuthenticated } = useAuth();
  
  // Component state management
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between sign-in/sign-up modes
  const [loading, setLoading] = useState(false); // Loading state for form submissions
  const [redirecting, setRedirecting] = useState(false); // State for showing redirect screen
  
  // Form data state - contains all user input fields
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '', // Only used in sign-up mode
    name: '', // Only used in sign-up mode
    role: 'student' // Default role - options: student, organizer, admin
  });

  /**
   * Test Supabase Database Connection
   * 
   * This effect runs once when the component mounts to verify that the
   * Supabase connection is working properly. It performs a simple query
   * to the students table and logs the result for debugging purposes.
   */
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('students').select('count').limit(1);
        console.log('Supabase connection test:', { data, error });
      } catch (err) {
        console.error('Supabase connection failed:', err);
      }
    };
    testConnection();
  }, []);

  /**
   * Handle Authentication State Changes
   * 
   * This effect monitors the authentication status from the AuthContext.
   * When a user becomes authenticated (after successful login/signup),
   * it triggers the redirecting state to show a welcome message before
   * the AuthGuard redirects them to the main application.
   */
  useEffect(() => {
    if (isAuthenticated) {
      setRedirecting(true);
    }
  }, [isAuthenticated]);

  /**
   * Redirect Loading Screen
   * 
   * Shows a beautiful loading screen with spinner and welcome message
   * when the user has been authenticated and is being redirected to
   * the main application dashboard.
   */
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

  /**
   * Handle Form Input Changes
   * 
   * This function updates the form state whenever a user types in any input field.
   * It uses the input's 'name' attribute to update the corresponding form field.
   * 
   * @param {Event} e - The input change event
   */
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /**
   * Toggle Between Sign-In and Sign-Up Modes
   * 
   * This function switches between login and registration modes, clearing
   * the form data to prevent confusion and ensure a clean slate for the
   * new mode. It preserves the current email if switching from sign-up to sign-in.
   */
  function toggleMode() {
    setIsSignUp(!isSignUp);
    // Reset form but keep email for convenience
    setForm({
      email: form.email, // Keep email when switching modes
      password: '',
      confirmPassword: '',
      name: '',
      role: 'student'
    });
  }

  /**
   * Handle Form Submission
   * 
   * This is the main function that handles both sign-in and sign-up operations.
   * It performs comprehensive validation, communicates with Supabase Auth,
   * and creates user profiles in the appropriate database tables based on role.
   * 
   * Flow:
   * 1. Validate form inputs (email format, password strength, etc.)
   * 2. Call Supabase Auth API (signIn or signUp)
   * 3. Handle email confirmation if required
   * 4. Create user profile in appropriate table (students/users)
   * 5. Show success/error messages to the user
   * 
   * @param {Event} e - The form submission event
   */
  async function handleSubmit(e) {
    e.preventDefault();
    
    // ========== VALIDATION PHASE ==========
    
    // Check for required fields
    if (!form.email || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate email format using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Ensure password meets minimum requirements
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    // Additional validation for sign-up mode
    if (isSignUp) {
      // Require name for new accounts
      if (!form.name) {
        toast.error('Please enter your name');
        return;
      }

      // Ensure passwords match
      if (form.password !== form.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    // ========== AUTHENTICATION PHASE ==========
    
    setLoading(true); // Show loading state to user

    try {
      if (isSignUp) {
        // ========== SIGN UP FLOW ==========
        
        /**
         * Create New User Account with Supabase Auth
         * 
         * This calls Supabase's signUp method with the user's credentials
         * and additional metadata (name and role) that will be stored
         * in the user's auth profile.
         */
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.email.trim().toLowerCase(), // Normalize email
          password: form.password,
          options: {
            data: {
              name: form.name,
              role: form.role
            }
          }
        });

        // Handle authentication errors
        if (authError) {
          if (authError.message.includes('Email not confirmed')) {
            toast.error('Please check your email and click the confirmation link before signing in.');
          } else {
            toast.error('Sign up failed: ' + authError.message);
          }
        } else {
          /**
           * Handle Email Confirmation Flow
           * 
           * Supabase can be configured to require email confirmation.
           * If confirmation is required, we show a message and reset the form.
           * If not required, we proceed to create the user profile.
           */
          if (authData.user && !authData.user.email_confirmed_at) {
            toast.success('Account created! Please check your email and click the confirmation link to complete registration.');
            
            // Reset form after successful signup
            setForm({
              email: '',
              password: '',
              confirmPassword: '',
              name: '',
              role: 'student'
            });
          } else {
            /**
             * Create User Profile in Database
             * 
             * After successful authentication, we create a profile record
             * in the appropriate table based on the user's role:
             * - Students go in the 'students' table
             * - Organizers and Admins go in the 'users' table
             */
            try {
              if (form.role === 'student') {
                /**
                 * Create Student Profile
                 * 
                 * Students get a record in the 'students' table with additional
                 * fields for their academic information (college, department, phone).
                 * These fields start empty and can be filled later in the profile.
                 */
                const { error: studentError } = await supabase
                  .from('students')
                  .insert([{
                    id: authData.user.id, // Link to auth user
                    email: form.email.trim().toLowerCase(),
                    name: form.name,
                    phone: '', // To be filled later
                    college: '', // To be filled later
                    department: '' // To be filled later
                  }]);

                if (studentError) {
                  console.error('Error creating student profile:', studentError);
                }
              } else {
                /**
                 * Create Organizer/Admin Profile
                 * 
                 * Organizers and admins get a record in the 'users' table
                 * with their role information for access control.
                 */
                const { error: userError } = await supabase
                  .from('users')
                  .insert([{
                    id: authData.user.id, // Link to auth user
                    email: form.email.trim().toLowerCase(),
                    name: form.name,
                    role: form.role // Store role for permissions
                  }]);

                if (userError) {
                  console.error('Error creating user profile:', userError);
                }
              }
            } catch (profileError) {
              console.error('Profile creation error:', profileError);
            }
            
            toast.success('Account created successfully! Welcome to Event QR Portal!');
            
            // Reset form after successful account creation
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
            
            {/* Debug section - Test User Creation */}
            <div className="mt-4 pt-4 border-t border-purple-200">
              <p className="text-xs text-purple-600 mb-2">Quick Test:</p>
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    const testEmail = 'test@example.com';
                    const testPassword = 'test123';
                    
                    // Try to create test user
                    const { data: authData, error: authError } = await supabase.auth.signUp({
                      email: testEmail,
                      password: testPassword,
                      options: {
                        data: {
                          name: 'Test User',
                          role: 'student'
                        }
                      }
                    });
                    
                    if (authError) {
                      toast.error('Test user creation failed: ' + authError.message);
                    } else {
                      toast.success('Test user created! Email: test@example.com, Password: test123');
                      
                      // Auto-fill the form
                      setForm({
                        ...form,
                        email: testEmail,
                        password: testPassword
                      });
                      setIsSignUp(false);
                    }
                  } catch (error) {
                    toast.error('Error: ' + error.message);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors disabled:opacity-50"
              >
                Create Test User
              </button>
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
