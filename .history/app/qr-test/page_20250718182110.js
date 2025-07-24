// QR Code Format Tester - for debugging and verification
'use client';
import { useState } from 'react';
import QRCode from 'qrcode';
import { Toaster, toast } from 'react-hot-toast';
import Navigation from '../components/Navigation';

export default function QRTestPage() {
  const [testId, setTestId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [qrData, setQrData] = useState('');

  async function generateTestQR() {
    if (!testId) {
      toast.error('Please enter a test ID');
      return;
    }

    try {
      // Generate QR code in new JSON format
      const data = JSON.stringify({ studentId: testId });
      const qrCodeBase64 = await QRCode.toDataURL(data);
      
      setQrData(data);
      setQrCode(qrCodeBase64);
      toast.success('QR code generated!');
    } catch (error) {
      toast.error('Failed to generate QR code: ' + error.message);
    }
  }

  function testQRParsing() {
    if (!qrData) {
      toast.error('Generate a QR code first');
      return;
    }

    try {
      const parsed = JSON.parse(qrData);
      if (parsed.studentId) {
        toast.success(`✅ Valid JSON format! Student ID: ${parsed.studentId}`);
      } else {
        toast.error('❌ Missing studentId in JSON');
      }
    } catch (error) {
      toast.error('❌ Invalid JSON format');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-8">
        <Toaster />
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">QR Code Format Tester</h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Student ID (UUID format)
              </label>
              <input
                type="text"
                value={testId}
                onChange={(e) => setTestId(e.target.value)}
                placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={generateTestQR}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Generate QR Code
              </button>
              
              <button
                onClick={testQRParsing}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Test Parsing
              </button>
            </div>

            {qrData && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">QR Code Data:</h3>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <code className="text-sm text-gray-800">{qrData}</code>
                  </div>
                </div>

                {qrCode && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Generated QR Code:</h3>
                    <div className="flex justify-center">
                      <img src={qrCode} alt="Test QR Code" className="w-48 h-48 border rounded-lg" />
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="text-blue-800 font-semibold mb-2">Format Specification:</h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• <strong>Format:</strong> JSON</li>
                    <li>• <strong>Structure:</strong> <code>{`{"studentId": "uuid"}`}</code></li>
                    <li>• <strong>Benefits:</strong> Compact, secure, fast lookup</li>
                    <li>• <strong>Privacy:</strong> No personal data in QR code</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
