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
      // Create QR data with student info and event ID
      const qrData = JSON.stringify({ ...form, eventId, name: form.name, email: form.email });
      const qrCode = await QRCode.toDataURL(qrData);
      
      // Insert student into database
      const { error } = await supabase.from('students').insert([{ 
        ...form, 
        event_id: eventId, 
        qr_code: qrCode 
      }]);
      
      if (error) {
        toast.error('Registration failed: ' + error.message);
      } else {
        setQr(qrCode);
        setSuccess(true);
        toast.success('Registration successful!');
      }
    } catch (err) {
      toast.error('Failed to generate QR code');
    }
    
    setLoading(false);
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-lg">Loading event...</div>
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
            <p className="mb-4 text-gray-600">Welcome to {event.name}</p>
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
          <h1 className="text-2xl font-bold mb-2 text-center">Register for</h1>
          <h2 className="text-xl text-blue-600 mb-6 text-center">{event.name}</h2>
          <p className="text-sm text-gray-500 mb-6 text-center">Date: {new Date(event.date).toLocaleDateString()}</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input 
              name="name" 
              placeholder="Full Name" 
              value={form.name} 
              onChange={handleChange} 
              className="rounded px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" 
              required 
            />
            <input 
              name="email" 
              type="email" 
              placeholder="Email Address" 
              value={form.email} 
              onChange={handleChange} 
              className="rounded px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" 
              required 
            />
            <input 
              name="phone" 
              placeholder="Phone Number" 
              value={form.phone} 
              onChange={handleChange} 
              className="rounded px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" 
              required 
            />
            <input 
              name="college" 
              placeholder="College/University" 
              value={form.college} 
              onChange={handleChange} 
              className="rounded px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" 
              required 
            />
            <input 
              name="department" 
              placeholder="Department/Major" 
              value={form.department} 
              onChange={handleChange} 
              className="rounded px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400" 
              required 
            />
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
