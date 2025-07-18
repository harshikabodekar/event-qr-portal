'use client';
// app/register/page.js
// Registration form page for new students
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Toaster, toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import QRCode from "qrcode";
import Navigation from '../components/Navigation';

export default function RegisterPage() {
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
    // Generate QR code data string
    const qrData = `${form.name}|${form.email}|${form.phone}|${form.college}|${form.department}`;
    let qrCodeBase64 = "";
    try {
      qrCodeBase64 = await QRCode.toDataURL(qrData);
    } catch (err) {
      toast.error("Failed to generate QR code");
      setLoading(false);
      return;
    }
    // Insert student into Supabase with QR code
    const { error } = await supabase.from("students").insert([
      { ...form, qr_code: qrCodeBase64 },
    ]);
    setLoading(false);
    if (error) {
      toast.error("Registration failed: " + error.message);
    } else {
      toast.success("Student registered!");
      setForm({ name: "", email: "", phone: "", college: "", department: "" });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-8">
        <Toaster />
        <Navbar />
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Student Registration
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Name"
            className="rounded px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {/* Email */}
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Email"
            className="rounded px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {/* Phone */}
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="Phone Number"
            className="rounded px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {/* College */}
          <input
            name="college"
            value={form.college}
            onChange={handleChange}
            required
            placeholder="College Name"
            className="rounded px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {/* Department */}
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            required
            placeholder="Department"
            className="rounded px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
