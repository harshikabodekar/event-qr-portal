'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Toaster, toast } from 'react-hot-toast';
import Navigation from '../components/Navigation';

export default function CheckinPage() {
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const html5QrCodeRef = useRef(null);

  // Check camera permissions and get available cameras
  useEffect(() => {
    const checkCameraPermissions = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        const devices = await Html5Qrcode.getCameras();
        setCameras(devices);
        if (devices.length > 0) {
          setSelectedCamera(devices[0].id);
          setPermissionGranted(true);
        }
      } catch (error) {
        console.error('Error getting cameras:', error);
        toast.error('Camera access denied or not available');
      }
    };

    checkCameraPermissions();
  }, []);

  const startScanning = async () => {
    if (!selectedCamera) {
      toast.error('No camera selected');
      return;
    }

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
      }

      html5QrCodeRef.current = new Html5Qrcode("qr-reader");
      
      await html5QrCodeRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        onScanSuccess,
        onScanFailure
      );
      
      setIsScanning(true);
      setStatus('Scanning for QR codes...');
    } catch (error) {
      console.error('Error starting scanner:', error);
      toast.error('Failed to start camera');
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
        setStatus('Scanner stopped');
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning]);

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
      <div className="w-full max-w-md bg-white p-4 rounded shadow">
        <div id="qr-reader" style={{ width: '100%' }}></div>
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