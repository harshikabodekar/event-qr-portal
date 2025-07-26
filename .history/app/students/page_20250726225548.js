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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <Navigation />
      <div className="p-8">
        <Toaster />
        
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-purple-100 mt-20">
            <h1 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">🔐 Organizer Access Required</h1>
            <p className="text-purple-600 mb-6 text-center">Enter the organizer password to access the students list.</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                placeholder="Organizer Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black bg-purple-50/30"
                required
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                🚀 Access Students List
              </button>
            </form>
          </div>
        ) : (
          <>
            <Modal open={qrModalOpen} onClose={() => setQrModalOpen(false)}>
              {qrStudent && (
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-white rounded-xl border-2 border-purple-200">
                    <img src={qrStudent.qr_code} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-purple-900 text-lg">{qrStudent.name}</div>
                    <div className="text-sm text-purple-600">{qrStudent.email}</div>
                  </div>
                  <button 
                    onClick={handleDownloadQR} 
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg px-6 py-2 hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    📥 Download QR Code
                  </button>
                </div>
              )}
            </Modal>
            <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-purple-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4 sm:mb-0">👥 All Students Directory</h1>
                <button 
                  onClick={fetchStudents}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  🔄 Refresh Data
                </button>
              </div>
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg mb-6">
                <p className="text-purple-800 text-sm">
                  <strong>📋 Note:</strong> This is a read-only view of all registered students. 
                  For event-specific registrations, visit the 
                  <a href="/registrations" className="text-purple-600 hover:text-purple-700 font-semibold underline"> Event Registrations</a> page.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-purple-200 rounded-lg overflow-hidden">
                  <thead className="bg-gradient-to-r from-purple-600 to-purple-700">
                    <tr>
                      <th className="px-4 py-3 text-white font-semibold">Name</th>
                      <th className="px-4 py-3 text-white font-semibold">Email</th>
                      <th className="px-4 py-3 text-white font-semibold">Phone</th>
                      <th className="px-4 py-3 text-white font-semibold">College</th>
                      <th className="px-4 py-3 text-white font-semibold">Department</th>
                      <th className="px-4 py-3 text-white font-semibold">Check-in Status</th>
                      <th className="px-4 py-3 text-white font-semibold">QR Code</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {students.map((student, index) => (
                      <tr key={student.id} className={`hover:bg-purple-50 transition-colors border-b border-purple-100 ${index % 2 === 0 ? 'bg-purple-25' : 'bg-white'}`}>
                        <td className="px-4 py-3 text-purple-900 font-medium">{student.name}</td>
                        <td className="px-4 py-3 text-purple-700">{student.email}</td>
                        <td className="px-4 py-3 text-purple-700">{student.phone}</td>
                        <td className="px-4 py-3 text-purple-700">{student.college}</td>
                        <td className="px-4 py-3 text-purple-700">{student.department}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            student.checked_in_at 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                            {student.checked_in_at ? '✅ Checked-in' : '⏳ Pending'}
                          </span>
                          {student.checked_in_at && (
                            <div className="text-xs text-purple-500 mt-1">
                              {new Date(student.checked_in_at).toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {student.qr_code && (
                            <button 
                              onClick={() => handleShowQR(student)} 
                              title="Show QR Code" 
                              className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-100 transition-all duration-300"
                            >
                              <QrCodeIcon className="w-6 h-6" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-12 text-purple-600 bg-purple-50">
                          <div className="flex flex-col items-center space-y-2">
                            <span className="text-4xl">👥</span>
                            <span className="font-medium">No students found.</span>
                            <span className="text-sm text-purple-500">Students will appear here once they register.</span>
                          </div>
                        </td>
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
