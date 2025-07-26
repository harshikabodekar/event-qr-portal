// app/components/Navbar.js
// Simple Navbar with links to Register and Students List
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between py-6 px-8 bg-gradient-to-r from-white to-purple-50 shadow-lg border-b border-purple-100 mb-8 rounded-b-xl">
      <div className="font-bold text-xl bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
        🎫 Event QR Portal
      </div>
      <div className="flex gap-6">
        <Link 
          href="/register" 
          className="text-purple-700 hover:text-purple-800 hover:bg-purple-100 px-4 py-2 rounded-lg transition-all duration-300 font-medium"
        >
          📝 Register
        </Link>
        <Link 
          href="/students" 
          className="text-purple-700 hover:text-purple-800 hover:bg-purple-100 px-4 py-2 rounded-lg transition-all duration-300 font-medium"
        >
          👥 Students List
        </Link>
      </div>
    </nav>
  );
}
