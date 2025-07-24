'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import dynamic from 'next/dynamic';
import { Toaster, toast } from 'react-hot-toast';
import Navigation from '../components/Navigation';

const QrReader = dynamic(() => import('react-qr-reader'), { ssr: false });

export default function CheckinPage() {
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');

  async function handleScan(data) {
    if (!data) return;
    setResult(data);
    
    try {
      let studentId;
      
      // Try to parse as JSON first (new format with student ID)
      try {
        const parsed = JSON.parse(data);
        if (parsed.studentId) {
          studentId = parsed.studentId;
        } else {
          throw new Error('No studentId in JSON');
        }
      } catch (jsonError) {
        // If JSON parsing fails, try pipe-separated format (old format)
        // For backward compatibility with existing QR codes
        const parts = data.split('|');
        if (parts.length >= 2) {
          // Use email from pipe-separated format to find student
          const email = parts[1];
          const { data: students, error: findError } = await supabase
            .from('students')
            .select('id')
            .eq('email', email)
            .single();
          
          if (findError || !students) {
            throw new Error('Student not found with old QR format');
          }
          
          studentId = students.id;
        } else {
          throw new Error('Invalid QR code format');
        }
      }

      // Find student by ID
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (studentError || !student) {
        setStatus('Student not found.');
        toast.error('Student not found');
        return;
      }

      // Check if already checked in
      if (student.checked_in_at) {
        setStatus(`${student.name} already checked in!`);
        toast('Already checked in!', { icon: '✅' });
        return;
      }

      // Update check-in status with timestamp
      const { error: updateError } = await supabase
        .from('students')
        .update({ checked_in_at: new Date().toISOString() })
        .eq('id', student.id);

      if (updateError) {
        setStatus('Check-in failed');
        toast.error('Check-in failed');
        return;
      }

      setStatus(`Check-in successful for ${student.name}!`);
      toast.success(`Welcome ${student.name}!`);
      
    } catch (error) {
      console.error('QR scan error:', error);
      setStatus('Invalid QR code');
      toast.error('Invalid QR code');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
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
    </div>
  );
}