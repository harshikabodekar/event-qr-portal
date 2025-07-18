// app/components/Navbar.js
// Simple Navbar with links to Register and Students List
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between py-4 px-8 bg-gray-100 dark:bg-gray-900 shadow mb-8 rounded-b-lg">
      <div className="font-bold text-lg text-foreground">Student Portal</div>
      <div className="flex gap-6">
        <Link href="/register" className="text-foreground hover:text-blue-600 transition-colors font-medium">Register</Link>
        <Link href="/students" className="text-foreground hover:text-blue-600 transition-colors font-medium">Students List</Link>
      </div>
    </nav>
  );
}
