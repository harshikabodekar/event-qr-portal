'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import QRCode from 'qrcode';
import { Toaster, toast } from 'react-hot-toast';

export default function RegisterEventPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', college: '', department: '' });
  const [loading, setLoading] = useState(false);
  const [qr, setQr] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.from('events').select('*').eq('id', eventId).single().then(({ data }) => setEvent(data));
  }, [eventId]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const qrData = JSON.stringify({ ...form, eventId });
    const qrCode = await QRCode.toDataURL(qrData);
    const { error } = await supabase.from('students').insert([{ ...form, event_id: eventId, qr_code: qrCode }]);
    setLoading(false);
    if (error) toast.error('Registration failed');
    else {
      setQr(qrCode);
      setSuccess(true);
    }
  }

  if (!event) return <div className="p-8">Loading event...</div>;
  if (success) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Toaster />
      <h2 className="text-2xl font-bold mb-4">Registration Successful!</h2>
      <img src={qr} alt="QR Code" className="w-48 h-48 mb-4" />
      <a href={qr} download={`${form.name}_qr.png`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Download QR Code</a>
    </div>
  );
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <Toaster />
      <h1 className="text-2xl font-bold mb-2">Register for {event.name}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-white p-8 rounded shadow w-full max-w-md">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="rounded px-4 py-2 border" required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="rounded px-4 py-2 border" required />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="rounded px-4 py-2 border" required />
        <input name="college" placeholder="College" value={form.college} onChange={handleChange} className="rounded px-4 py-2 border" required />
        <input name="department" placeholder="Department" value={form.department} onChange={handleChange} className="rounded px-4 py-2 border" required />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white rounded px-4 py-2">{loading ? 'Registering...' : 'Register'}</button>
      </form>
    </div>
  );
}