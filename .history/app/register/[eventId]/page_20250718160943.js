'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import QRCode from 'qrcode';
import { Toaster, toast } from 'react-hot-toast';
import Navigation from '../../components/Navigation';

export default function RegisterEventPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', college: '', department: '' });
  const [loading, setLoading] = useState(false);
  const [qr, setQr] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (eventId) {
      supabase.from('events').select('*').eq('id', eventId).single().then(({ data }) => setEvent(data));
    }
  }, [eventId]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First check if user already exists in students table
      const { data: existingStudent, error: checkError } = await supabase
        .from('students')
        .select('*')
        .eq('email', form.email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is what we want
        toast.error('Error checking user: ' + checkError.message);
        setLoading(false);
        return;
      }

      let studentId;
      let qrCode;

      if (existingStudent) {
        // User exists, use their existing data
        studentId = existingStudent.id;
        qrCode = existingStudent.qr_code;
        toast.success('Found existing account!');
      } else {
        // User doesn't exist, redirect to full registration
        toast.error('Please complete your student profile first');
        setLoading(false);
        window.location.href = '/register';
        return;
      }

      // Create event registration record
      const { error: regError } = await supabase.from('event_registrations').insert([{
        student_id: studentId,
        event_id: eventId,
        registered_at: new Date().toISOString()
      }]);

      if (regError) {
        if (regError.code === '23505') { // Unique constraint violation
          toast.error('You are already registered for this event!');
        } else {
          toast.error('Registration failed: ' + regError.message);
        }
      } else {
        setQr(qrCode);
        setSuccess(true);
        toast.success('Successfully registered for ' + event?.name + '!');
      }
    } catch (err) {
      toast.error('Failed to process registration');
    }
    
    setLoading(false);
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-lg text-black">Loading event...</div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <Toaster />
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-green-600">Registration Successful!</h2>
            <p className="mb-4 text-black">Welcome to {event.name}</p>
            <img src={qr} alt="QR Code" className="w-48 h-48 mx-auto mb-4 border rounded" />
            <p className="text-sm text-black mb-4">Show this QR code for check-in</p>
            <a 
              href={qr} 
              download={`${form.name}_${event.name}_qr.png`} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mr-2"
            >
              Download QR Code
            </a>
            <button 
              onClick={() => window.location.href = '/events'} 
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Toaster />
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-2 text-center text-black">Register for</h1>
          <h2 className="text-xl text-blue-600 mb-4 text-center">{event.name}</h2>
          <p className="text-sm text-gray-500 mb-6 text-center">Date: {new Date(event.date).toLocaleDateString()}</p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Note:</strong> You must first complete your student profile before registering for events.
            </p>
            <p className="text-sm text-blue-700">
              If you haven't registered as a student yet, you'll be redirected to complete your profile first.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input 
              name="email" 
              type="email" 
              placeholder="Your Email Address" 
              value={form.email} 
              onChange={handleChange} 
              className="rounded px-4 py-2 border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-400" 
              required 
            />
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Register for Event'}
            </button>
            <div className="text-center">
              <a href="/register" className="text-blue-600 hover:text-blue-700 text-sm">
                Don't have a student profile? Register here →
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
