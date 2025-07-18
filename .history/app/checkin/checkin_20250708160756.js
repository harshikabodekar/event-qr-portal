'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import dynamic from 'next/dynamic';
import { Toaster, toast } from 'react-hot-toast';

const QrReader = dynamic(() => import('react-qr-reader'), { ssr: false });

export default function CheckinPage() {
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');

  async function handleScan(data) {
    if (!data) return;
    setResult(data);
    try {
      const parsed = JSON.parse(data);
      const { eventId, email } = parsed;
      // Find student by eventId and email
      const { data: students } = await supabase.from('students').select('*').eq('event_id', eventId).eq('email', email);
      if (!students || students.length === 0) {
        setStatus('Student not found for this event.');
        toast.error('Student not found');
        return;
      }
      const student = students[0];
      if (student.checkin_status) {
        setStatus('Already checked in!');
        toast('Already checked in!', { icon: '✅' });
        return;
      }
      await supabase.from('students').update({ checkin_status: true }).eq('id', student.id);
      setStatus('Check-in successful!');
      toast.success('Check-in successful!');
    } catch {
      setStatus('Invalid QR code');
      toast.error('Invalid QR code');
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4">Event Check-in</h1>
      <div className="w-full max-w-xs bg-white p-4 rounded shadow">
        <QrReader
          delay={300}
          onError={() => setStatus('Camera error')}
          onScan={handleScan}
          style={{ width: '100%' }}
        />
      </div>
      <div className="mt-4 text-center">
        <div className="font-bold">Result:</div>
        <div className="break-all">{result}</div>
        <div className="mt-2 text-lg">{status}</div>
      </div>
    </div>
  );
}