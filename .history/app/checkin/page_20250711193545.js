'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Toaster, toast } from 'react-hot-toast';
import Navigation from '../components/Navigation';

export default function CheckinPage() {
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    let html5QrCode;
    
    const startScanner = async () => {
      if (typeof window !== 'undefined') {
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        
        html5QrCode = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );
        
        html5QrCode.render(onScanSuccess, onScanFailure);
        setIsScanning(true);
      }
    };

    startScanner();

    return () => {
      if (html5QrCode) {
        html5QrCode.clear().catch(console.error);
      }
    };
  }, []);

  const onScanSuccess = async (decodedText) => {
    setResult(decodedText);
    try {
      const parsed = JSON.parse(decodedText);
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
  };

  const onScanFailure = (error) => {
    // Handle scan failure, usually better to ignore these
  };

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