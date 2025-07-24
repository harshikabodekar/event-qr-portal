'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (user) => {
    try {
      // Try to get student profile first
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', user.id)
        .single();

      if (studentData && !studentError) {
        setUserProfile({ ...studentData, role: 'student' });
        return;
      }

      // Try to get user profile (organizer/admin)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userData && !userError) {
        setUserProfile(userData);
        return;
      }

      // Fallback to user metadata
      setUserProfile({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
        role: user.user_metadata?.role || 'student'
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
        role: user.user_metadata?.role || 'student'
      });
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    userProfile,
    loading,
    signOut,
    isAuthenticated: !!user,
    isStudent: userProfile?.role === 'student',
    isOrganizer: userProfile?.role === 'organizer',
    isAdmin: userProfile?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
