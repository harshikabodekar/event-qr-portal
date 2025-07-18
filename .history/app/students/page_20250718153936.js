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
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', college: '', department: '' });
  const [loading, setLoading] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrStudent, setQrStudent] = useState(null);

  // Fetch students from Supabase
  async function fetchStudents() {
    const { data, error } = await supabase.from("students").select("*").order('id', { ascending: false });
    if (error) toast.error("Failed to fetch students");
    else setStudents(data);
  }

  useEffect(() => { 
    fetchStudents(); 
    // Auto-refresh every 10 seconds to show real-time check-in updates
    const interval = setInterval(fetchStudents, 10000);
    return () => clearInterval(interval);
  }, []);

  // Toggle check-in status
  async function handleToggleCheckin(student) {
    const checked_in_at = student.checked_in_at ? null : new Date().toISOString();
    const { error } = await supabase.from('students').update({ checked_in_at }).eq('id', student.id);
    if (error) {
      toast.error('Check-in update failed');
    } else {
      toast.success(checked_in_at ? 'Student checked in' : 'Check-in removed');
      fetchStudents(); // Refresh the list
    }
  }

  // Handle delete
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this student?")) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) toast.error("Delete failed");
    else {
      toast.success("Student deleted");
      fetchStudents();
    }
  }

  // Handle edit button
  function handleEdit(student) {
    setEditingId(student.id);
    setEditForm({ ...student });
  }

  // Handle edit form change
  function handleEditChange(e) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  // Handle edit form submit
  async function handleEditSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("students").update(editForm).eq("id", editingId);
    setLoading(false);
    if (error) toast.error("Update failed");
    else {
      toast.success("Student updated");
      setEditingId(null);
      fetchStudents();
    }
  }

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
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold text-white mb-4 sm:mb-0">Students List</h1>
          <button 
            onClick={fetchStudents}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            Refresh Data
          </button>
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
                <th className="px-4 py-2">QR</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                editingId === student.id ? (
                  <tr key={student.id} className="bg-blue-50 dark:bg-gray-900">
                    <td className="px-2 py-1">
                      <input name="name" value={editForm.name} onChange={handleEditChange} className="rounded px-2 py-1 border text-white" />
                    </td>
                    <td className="px-2 py-1">
                      <input name="email" value={editForm.email} onChange={handleEditChange} className="rounded px-2 py-1 border text-white" />
                    </td>
                    <td className="px-2 py-1">
                      <input name="phone" value={editForm.phone} onChange={handleEditChange} className="rounded px-2 py-1 border text-white" />
                    </td>
                    <td className="px-2 py-1">
                      <input name="college" value={editForm.college} onChange={handleEditChange} className="rounded px-2 py-1 border text-white" />
                    </td>
                    <td className="px-2 py-1">
                      <input name="department" value={editForm.department} onChange={handleEditChange} className="rounded px-2 py-1 border text-white" />
                    </td>
                    <td className="px-2 py-1 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${editForm.checked_in_at ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
                        {editForm.checked_in_at ? 'Checked-in' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-2 py-1">
                      {student.qr_code && (
                        <button onClick={() => handleShowQR(student)} title="Show QR Code" className="hover:text-blue-600">
                          <QrCodeIcon className="w-6 h-6 inline" />
                        </button>
                      )}
                    </td>
                    <td className="px-2 py-1 flex gap-2">
                      <button onClick={handleEditSubmit} disabled={loading} className="bg-green-600 text-white rounded px-3 py-1 hover:bg-green-700 transition-colors font-semibold disabled:opacity-60">Save</button>
                      <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white rounded px-3 py-1 hover:bg-gray-500 transition-colors font-semibold">Cancel</button>
                    </td>
                  </tr>
                ) : (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <td className="px-4 py-2 text-white">{student.name}</td>
                    <td className="px-4 py-2 text-white">{student.email}</td>
                    <td className="px-4 py-2 text-white">{student.phone}</td>
                    <td className="px-4 py-2 text-white">{student.college}</td>
                    <td className="px-4 py-2 text-white">{student.department}</td>
                    <td className="px-4 py-2 text-center">
                      <button 
                        onClick={() => handleToggleCheckin(student)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          student.checked_in_at 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                      >
                        {student.checked_in_at ? '✅ Checked-in' : '⏳ Pending'}
                      </button>
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
                    <td className="px-4 py-2 flex gap-2">
                      <button onClick={() => handleEdit(student)} className="bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-700 transition-colors font-semibold">Edit</button>
                      <button onClick={() => handleDelete(student.id)} className="bg-red-600 text-white rounded px-3 py-1 hover:bg-red-700 transition-colors font-semibold">Delete</button>
                    </td>
                  </tr>
                )
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
