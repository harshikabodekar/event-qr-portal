// Migration script to update existing QR codes to JSON format with student ID only
// Run this once to migrate all existing students to the new QR format

'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import QRCode from 'qrcode';
import { Toaster, toast } from 'react-hot-toast';
import Navigation from '../components/Navigation';

export default function MigrateQRPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState({ success: 0, failed: 0, errors: [] });

  async function migrateQRCodes() {
    setIsRunning(true);
    setResults({ success: 0, failed: 0, errors: [] });
    
    try {
      // Get all students
      const { data: students, error: fetchError } = await supabase
        .from('students')
        .select('id, name, email, qr_code');

      if (fetchError) {
        toast.error('Failed to fetch students: ' + fetchError.message);
        setIsRunning(false);
        return;
      }

      setProgress({ current: 0, total: students.length });
      
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        setProgress({ current: i + 1, total: students.length });

        try {
          // Check if QR code is already in new format
          if (student.qr_code) {
            try {
              // Try to decode existing QR code to see if it's already JSON format
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const img = new Image();
              
              // For simplicity, let's just regenerate all QR codes with new format
              const qrData = JSON.stringify({ studentId: student.id });
              const newQrCode = await QRCode.toDataURL(qrData);
              
              // Update the student's QR code
              const { error: updateError } = await supabase
                .from('students')
                .update({ qr_code: newQrCode })
                .eq('id', student.id);

              if (updateError) {
                setResults(prev => ({
                  ...prev,
                  failed: prev.failed + 1,
                  errors: [...prev.errors, `${student.name}: ${updateError.message}`]
                }));
              } else {
                setResults(prev => ({
                  ...prev,
                  success: prev.success + 1
                }));
              }
            } catch (qrError) {
              // Generate new QR code
              const qrData = JSON.stringify({ studentId: student.id });
              const newQrCode = await QRCode.toDataURL(qrData);
              
              const { error: updateError } = await supabase
                .from('students')
                .update({ qr_code: newQrCode })
                .eq('id', student.id);

              if (updateError) {
                setResults(prev => ({
                  ...prev,
                  failed: prev.failed + 1,
                  errors: [...prev.errors, `${student.name}: ${updateError.message}`]
                }));
              } else {
                setResults(prev => ({
                  ...prev,
                  success: prev.success + 1
                }));
              }
            }
          } else {
            // Generate QR code for student without one
            const qrData = JSON.stringify({ studentId: student.id });
            const newQrCode = await QRCode.toDataURL(qrData);
            
            const { error: updateError } = await supabase
              .from('students')
              .update({ qr_code: newQrCode })
              .eq('id', student.id);

            if (updateError) {
              setResults(prev => ({
                ...prev,
                failed: prev.failed + 1,
                errors: [...prev.errors, `${student.name}: ${updateError.message}`]
              }));
            } else {
              setResults(prev => ({
                ...prev,
                success: prev.success + 1
              }));
            }
          }
        } catch (error) {
          setResults(prev => ({
            ...prev,
            failed: prev.failed + 1,
            errors: [...prev.errors, `${student.name}: ${error.message}`]
          }));
        }

        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast.success(`Migration completed! ${results.success} successful, ${results.failed} failed`);
    } catch (error) {
      toast.error('Migration failed: ' + error.message);
    }

    setIsRunning(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-8">
        <Toaster />
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">QR Code Migration</h1>
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Important Notice</h2>
            <p className="text-yellow-700">
              This will update all existing student QR codes to the new JSON format containing only the student ID. 
              This is a one-time migration and should only be run once.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">What this migration does:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Updates all student QR codes to JSON format: <code>{"{"}"studentId": "uuid"{"}"}</code></li>
              <li>Maintains backward compatibility in the check-in scanner</li>
              <li>Improves security by removing personal data from QR codes</li>
              <li>Generates QR codes for students who don't have them</li>
            </ul>
          </div>

          {!isRunning && (
            <button
              onClick={migrateQRCodes}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Start Migration
            </button>
          )}

          {isRunning && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <p className="text-gray-700">Migrating QR codes... Please wait.</p>
            </div>
          )}

          {(results.success > 0 || results.failed > 0) && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h4 className="text-green-800 font-semibold">Successful</h4>
                  <p className="text-2xl font-bold text-green-600">{results.success}</p>
                </div>
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h4 className="text-red-800 font-semibold">Failed</h4>
                  <p className="text-2xl font-bold text-red-600">{results.failed}</p>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h4 className="text-red-800 font-semibold mb-2">Errors:</h4>
                  <div className="max-h-40 overflow-y-auto">
                    {results.errors.map((error, index) => (
                      <p key={index} className="text-red-700 text-sm">{error}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
