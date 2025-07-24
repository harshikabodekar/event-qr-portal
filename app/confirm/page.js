'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { Toaster, toast } from 'react-hot-toast';

export default function ConfirmEmailPage() {
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const confirmEmail = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (token_hash && type) {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type,
        });

        if (error) {
          setError(error.message);
          toast.error('Email confirmation failed: ' + error.message);
        } else {
          setConfirmed(true);
          toast.success('Email confirmed successfully! You can now sign in.');
        }
      } else {
        setError('Invalid confirmation link');
      }
      
      setLoading(false);
    };

    confirmEmail();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <div className="text-xl text-gray-700 mb-2">Confirming your email...</div>
          <div className="text-sm text-gray-500">Please wait a moment</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Toaster />
        
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎫</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Event QR Portal</h1>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          {confirmed ? (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-green-600 mb-4">Email Confirmed!</h2>
              <p className="text-gray-600 mb-6">
                Your email has been successfully confirmed. You can now sign in to access the Event QR Portal.
              </p>
              <a
                href="/"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Go to Sign In
              </a>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-red-600 mb-4">Confirmation Failed</h2>
              <p className="text-gray-600 mb-6">
                {error || 'There was an error confirming your email. The link may be invalid or expired.'}
              </p>
              <div className="space-y-3">
                <a
                  href="/"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                >
                  Try Signing In
                </a>
                <p className="text-sm text-gray-500">
                  If you continue to have issues, please try signing up again or contact support.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
