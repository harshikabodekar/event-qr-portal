// app/students/page.js
// Students List page: fetches and displays students, allows edit and delete
'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Toaster, toast } from "react-hot-toast";
import { QrCodeIcon } from '@heroicons/react/24/outline';
import Modal from '../components/Modal';
import Navigation from '../components/Navigation';

export default function StudentsListPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrStudent, setQrStudent] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  // Handle authentication
  function handleLogin(e) {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ORGANIZER_PASSWORD) {
      setIsAuthenticated(true);
      toast.success('Access granted');
    } else {
      toast.error('Invalid password');
    }
  }

  // Fetch students from Supabase
  async function fetchStudents() {
    const { data, error } = await supabase.from("students").select("*").order('id', { ascending: false });
    if (error) toast.error("Failed to fetch students");
    else setStudents(data);
  }

  useEffect(() => { 
    if (isAuthenticated) {
      fetchStudents(); 
      // Auto-refresh every 30 seconds to show updates
      const interval = setInterval(fetchStudents, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Show QR modal
  function handleShowQR(student) {
    setQrStudent(student);
    setQrModalOpen(true);
  }

  // Download QR code as PNG
  function handleDownloadQR() {
    if (!qrStudent?.qr_code) return;
    const a = document.createElement('a');
    a.href = qrStudent.qr_code;
    a.download = `${qrStudent.name}_qr.png`;
    a.click();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-8">
        <Toaster />
        
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow mt-20">
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Organizer Access Required</h1>
            <p className="text-gray-600 mb-6 text-center">Enter the organizer password to access the students list.</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                placeholder="Organizer Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Access Students List
              </button>
            </form>
          </div>
        ) : (
          <>
            <Modal open={qrModalOpen} onClose={() => setQrModalOpen(false)}>
              {qrStudent && (
                <div className="flex flex-col items-center gap-4">
                  <img src={qrStudent.qr_code} alt="QR Code" className="w-48 h-48" />
                  <div className="text-center">
                    <div className="font-bold">{qrStudent.name}</div>
                    <div className="text-xs text-gray-500">{qrStudent.email}</div>
                  </div>
                  <button onClick={handleDownloadQR} className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition">Download QR Code</button>
                </div>
              )}
            </Modal>
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h1 className="text-2xl font-bold text-white mb-4 sm:mb-0">All Students Directory</h1>
                <button 
                  onClick={fetchStudents}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Refresh Data
                </button>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> This is a read-only view of all registered students. 
                  For event-specific registrations, visit the 
                  <a href="/registrations" className="text-blue-600 hover:text-blue-700 font-semibold"> Event Registrations</a> page.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border rounded-lg">
                  <thead className="bg-gray-100 dark:bg-gray-700 text-white">
                    <tr>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Phone</th>
                      <th className="px-4 py-2">College</th>
                      <th className="px-4 py-2">Department</th>
                      <th className="px-4 py-2">Check-in Status</th>
                      <th className="px-4 py-2">QR Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <td className="px-4 py-2 text-white">{student.name}</td>
                        <td className="px-4 py-2 text-white">{student.email}</td>
                        <td className="px-4 py-2 text-white">{student.phone}</td>
                        <td className="px-4 py-2 text-white">{student.college}</td>
                        <td className="px-4 py-2 text-white">{student.department}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            student.checked_in_at 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-300 text-gray-700'
                          }`}>
                            {student.checked_in_at ? '✅ Checked-in' : '⏳ Pending'}
                          </span>
                          {student.checked_in_at && (
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(student.checked_in_at).toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {student.qr_code && (
                            <button onClick={() => handleShowQR(student)} title="Show QR Code" className="hover:text-blue-600">
                              <QrCodeIcon className="w-6 h-6 inline" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-gray-500">No students found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
