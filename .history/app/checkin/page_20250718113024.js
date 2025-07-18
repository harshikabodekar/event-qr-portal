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
    // Stop scanning temporarily to prevent multiple scans
    if (html5QrCodeRef.current && isScanning) {
      await html5QrCodeRef.current.pause();
    }
    
    try {
      const parsed = JSON.parse(decodedText);
      const { eventId, email } = parsed;
      
      // Find student by eventId and email
      const { data: students } = await supabase
        .from('students')
        .select('*')
        .eq('event_id', eventId)
        .eq('email', email);
        
      if (!students || students.length === 0) {
        setStatus('❌ Student not found for this event.');
        toast.error('Student not found');
        // Resume scanning after 2 seconds
        setTimeout(() => {
          if (html5QrCodeRef.current && isScanning) {
            html5QrCodeRef.current.resume();
          }
        }, 2000);
        return;
      }
      
      const student = students[0];
      if (student.checkin_status) {
        setStatus(`✅ ${student.name} already checked in!`);
        toast('Already checked in!', { icon: '✅' });
        // Resume scanning after 2 seconds
        setTimeout(() => {
          if (html5QrCodeRef.current && isScanning) {
            html5QrCodeRef.current.resume();
          }
        }, 2000);
        return;
      }
      
      // Update check-in status
      await supabase
        .from('students')
        .update({ checkin_status: true })
        .eq('id', student.id);
        
      setStatus(`🎉 ${student.name} checked in successfully!`);
      toast.success(`${student.name} checked in successfully!`);
      
      // Resume scanning after 3 seconds
      setTimeout(() => {
        if (html5QrCodeRef.current && isScanning) {
          html5QrCodeRef.current.resume();
        }
      }, 3000);
      
    } catch (error) {
      console.error('QR scan error:', error);
      setStatus('❌ Invalid QR code format');
      toast.error('Invalid QR code');
      // Resume scanning after 2 seconds
      setTimeout(() => {
        if (html5QrCodeRef.current && isScanning) {
          html5QrCodeRef.current.resume();
        }
      }, 2000);
    }
  };

  const onScanFailure = (error) => {
    // Handle scan failure silently - these happen frequently and are normal
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