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
          <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow flex flex-col gap-4 w-full max-w-xs">
            <h2 className="text-xl font-bold text-center">Organizer Login</h2>
            <input type="password" placeholder="Enter organizer password" value={password} onChange={e => setPassword(e.target.value)} className="rounded px-4 py-2 border border-gray-300" required />
            <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">Login</button>
          </form>
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
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Organizer Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} className="rounded px-4 py-2 border border-gray-300">
            <option value="">Select Event</option>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>
          {/* Dashboard Stats */}
          <div className="flex gap-2">
            <div className="bg-blue-100 text-blue-800 rounded px-3 py-1">Total: {total}</div>
            <div className="bg-green-100 text-green-800 rounded px-3 py-1">Checked-in: {checkedIn}</div>
            <div className="bg-yellow-100 text-yellow-800 rounded px-3 py-1">Pending: {pending}</div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">College</th>
                <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2">QR</th>
                <th className="px-4 py-2">Check-in</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2">{student.name}</td>
                  <td className="px-4 py-2">{student.email}</td>
                  <td className="px-4 py-2">{student.phone}</td>
                  <td className="px-4 py-2">{student.college}</td>
                  <td className="px-4 py-2">{student.department}</td>
                  <td className="px-4 py-2 text-center">
                    {student.qr_code && (
                      <button onClick={() => handleShowQR(student)} title="Show QR Code" className="hover:text-blue-600">
                        <span role="img" aria-label="qr">📷</span>
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => handleToggleCheckin(student)} className={`rounded px-3 py-1 font-semibold ${student.checked_in_at ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
                      {student.checked_in_at ? 'Checked-in' : 'Pending'}
                    </button>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button onClick={() => handleEdit(student)} className="bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-700 transition-colors font-semibold">Edit</button>
                    <button onClick={() => handleDelete(student.id)} className="bg-red-600 text-white rounded px-3 py-1 hover:bg-red-700 transition-colors font-semibold">Delete</button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500">No students found.</td>
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