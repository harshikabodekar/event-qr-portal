'use client';
// app/register/page.js
// Registration form page for new students
import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { supabase } from "../../lib/supabaseClient";
import { Toaster, toast } from "react-hot-toast";
import QRCode from "qrcode";
import Navigation from '../components/Navigation';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  
  // State for form fields
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    department: "",
  });
  const [loading, setLoading] = useState(false);

  // Handle input changes
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate form fields
      if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.college.trim() || !form.department.trim()) {
        toast.error("Please fill in all fields");
        setLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        toast.error('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Check if email already exists
      const { data: existingStudent, error: checkError } = await supabase
        .from('students')
        .select('id')
        .eq('email', form.email.trim().toLowerCase())
        .single();

      if (existingStudent) {
        toast.error("A student with this email already exists!");
        setLoading(false);
        return;
      }

      // Insert student into Supabase first to get the ID
      const { data: insertedStudent, error } = await supabase.from("students").insert([
        { 
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          college: form.college.trim(),
          department: form.department.trim()
        },
      ]).select('id').single();

      if (error) {
        toast.error("Registration failed: " + error.message);
        setLoading(false);
        return;
      }

      // Generate QR code with JSON format containing only the student ID
      const qrData = JSON.stringify({ studentId: insertedStudent.id });
      const qrCodeBase64 = await QRCode.toDataURL(qrData);
      
      // Update the student record with the QR code
      const { error: updateError } = await supabase
        .from("students")
        .update({ qr_code: qrCodeBase64 })
        .eq('id', insertedStudent.id);

      if (updateError) {
        toast.error("Failed to generate QR code: " + updateError.message);
        setLoading(false);
        return;
      }

      toast.success("Student registered successfully!");
      setForm({ name: "", email: "", phone: "", college: "", department: "" });
      
      // If there's a return URL, redirect after a short delay
      if (returnUrl) {
        toast.success("Redirecting to event registration...");
        setTimeout(() => {
          window.location.href = returnUrl;
        }, 2000);
      }
    } catch (err) {
      toast.error("Failed to process registration: " + err.message);
    }
    
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <Navigation />
      <div className="p-8">
        <Toaster />
      <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-purple-100">
        <h1 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
          📝 Student Registration
        </h1>
        
        {returnUrl && (
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <div className="text-purple-800 text-sm">
                <strong>🎫 Event Registration Required</strong>
              </div>
            </div>
            <p className="text-purple-700 text-sm mt-2">
              You need to complete your student profile before registering for the event. 
              After registration, you'll be redirected back to continue your event registration.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Name"
            className="rounded px-4 py-2 border border-gray-600 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-300"
          />
          {/* Email */}
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Email"
            className="rounded px-4 py-2 border border-gray-600 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-300"
          />
          {/* Phone */}
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="Phone Number"
            className="rounded px-4 py-2 border border-gray-600 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-300"
          />
          {/* College */}
          <input
            name="college"
            value={form.college}
            onChange={handleChange}
            required
            placeholder="College Name"
            className="rounded px-4 py-2 border border-gray-600 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-300"
          />
          {/* Department */}
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            required
            placeholder="Department"
            className="rounded px-4 py-2 border border-gray-600 text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white rounded py-2 mt-2 hover:bg-blue-700 transition-colors font-semibold disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
