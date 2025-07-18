'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Toaster, toast } from 'react-hot-toast';
import Modal from '../components/Modal';
import Navigation from '../components/Navigation';

const ORGANIZER_PASSWORD = process.env.NEXT_PUBLIC_ORGANIZER_PASSWORD;

export default function OrganizerPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [students, setStudents] = useState([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrStudent, setQrStudent] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);

  // Stats (simplified - count all students and simulate check-in status)
  const total = students.length;
  const checkedIn = students.filter(s => s.checked_in_at).length; // Use timestamp instead
  const pending = total - checkedIn;

  useEffect(() => { 
    if (authed) {
      fetchEvents();
      fetchStudents(); // Load all students initially
    }
  }, [authed]);
  
  async function fetchEvents() {
    const { data } = await supabase.from('events').select('*').order('date', { ascending: true });
    setEvents(data || []);
  }
  
  useEffect(() => { 
    if (authed) fetchStudents(); // Refresh when selectedEvent changes
  }, [selectedEvent, authed]);
  
  async function fetchStudents() {
    const { data } = await supabase.from('students').select('*').order('id', { ascending: false });
    setStudents(data || []);
  }

  function handleLogin(e) {
    e.preventDefault();
    if (password === ORGANIZER_PASSWORD) setAuthed(true);
    else toast.error('Incorrect password');
  }

  function handleEdit(student) {
    setEditForm(student);
    setEditModalOpen(true);
  }
  function handleEditChange(e) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }
  async function handleEditSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('students').update(editForm).eq('id', editForm.id);
    setLoading(false);
    if (error) toast.error('Update failed');
    else {
      toast.success('Student updated');
      setEditModalOpen(false);
      fetchStudents();
    }
  }
  async function handleDelete(id) {
    if (!confirm('Delete this student?')) return;
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) toast.error('Delete failed');
    else {
      toast.success('Student deleted');
      fetchStudents();
    }
  }
  async function handleToggleCheckin(student) {
    // Toggle check-in using timestamp instead of boolean
    const checked_in_at = student.checked_in_at ? null : new Date().toISOString();
    const { error } = await supabase.from('students').update({ checked_in_at }).eq('id', student.id);
    if (error) toast.error('Check-in update failed');
    else {
      toast.success(checked_in_at ? 'Student checked in' : 'Check-in removed');
      fetchStudents();
    }
  }
  function handleShowQR(student) {
    setQrStudent(student);
    setQrModalOpen(true);
  }
  function handleDownloadQR() {
    if (!qrStudent?.qr_code) return;
    const a = document.createElement('a');
    a.href = qrStudent.qr_code;
    a.download = `${qrStudent.name}_qr.png`;
    a.click();
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <Toaster />
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Organizer Login</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input 
                type="password" 
                placeholder="Enter organizer password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="rounded px-4 py-3 border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-500" 
                required 
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-3 font-semibold transition">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-8">
      <Toaster />
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
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-2">
          <h3 className="font-bold mb-2">Edit Student</h3>
          <input name="name" value={editForm.name || ''} onChange={handleEditChange} className="rounded px-2 py-1 border" required />
          <input name="email" value={editForm.email || ''} onChange={handleEditChange} className="rounded px-2 py-1 border" required />
          <input name="phone" value={editForm.phone || ''} onChange={handleEditChange} className="rounded px-2 py-1 border" required />
          <input name="college" value={editForm.college || ''} onChange={handleEditChange} className="rounded px-2 py-1 border" required />
          <input name="department" value={editForm.department || ''} onChange={handleEditChange} className="rounded px-2 py-1 border" required />
          <button type="submit" disabled={loading} className="bg-green-600 text-white rounded px-3 py-1 hover:bg-green-700 transition-colors font-semibold disabled:opacity-60">Save</button>
        </form>
      </Modal>
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 lg:mb-0">Organizer Dashboard</h1>
          <button 
            onClick={() => setAuthed(false)} 
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            Logout
          </button>
        </div>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="text-3xl font-bold">{total}</div>
              <div className="ml-4">
                <div className="text-sm opacity-90">Total Students</div>
                <div className="text-lg font-semibold">Registered</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="text-3xl font-bold">{checkedIn}</div>
              <div className="ml-4">
                <div className="text-sm opacity-90">Students</div>
                <div className="text-lg font-semibold">Checked-in</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="text-3xl font-bold">{pending}</div>
              <div className="ml-4">
                <div className="text-sm opacity-90">Students</div>
                <div className="text-lg font-semibold">Pending</div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Selection and Refresh */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select 
            value={selectedEvent} 
            onChange={e => setSelectedEvent(e.target.value)} 
            className="rounded-lg px-4 py-3 border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Students</option>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>
          <button 
            onClick={fetchStudents}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Refresh Data
          </button>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-black font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-black font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-black font-semibold">Phone</th>
                <th className="px-4 py-3 text-left text-black font-semibold">College</th>
                <th className="px-4 py-3 text-left text-black font-semibold">Department</th>
                <th className="px-4 py-3 text-center text-black font-semibold">QR</th>
                <th className="px-4 py-3 text-center text-black font-semibold">Check-in Status</th>
                <th className="px-4 py-3 text-center text-black font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors border-b">
                  <td className="px-4 py-3 text-black font-medium">{student.name}</td>
                  <td className="px-4 py-3 text-black">{student.email}</td>
                  <td className="px-4 py-3 text-black">{student.phone}</td>
                  <td className="px-4 py-3 text-black">{student.college}</td>
                  <td className="px-4 py-3 text-black">{student.department}</td>
                  <td className="px-4 py-3 text-center">
                    {student.qr_code && (
                      <button onClick={() => handleShowQR(student)} title="Show QR Code" className="text-blue-600 hover:text-blue-800 transition">
                        <span role="img" aria-label="qr" className="text-2xl">📷</span>
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => handleToggleCheckin(student)} 
                      className={`rounded-lg px-4 py-2 font-semibold transition ${
                        student.checked_in_at 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                    >
                      {student.checked_in_at ? '✅ Checked-in' : '⏳ Pending'}
                    </button>
                    {student.checked_in_at && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(student.checked_in_at).toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <button 
                        onClick={() => handleEdit(student)} 
                        className="bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700 transition-colors font-semibold text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(student.id)} 
                        className="bg-red-600 text-white rounded-lg px-3 py-2 hover:bg-red-700 transition-colors font-semibold text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    <div className="text-lg">No students found.</div>
                    <div className="text-sm mt-2">Students will appear here once they register.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  );
}