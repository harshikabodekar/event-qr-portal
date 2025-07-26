'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Toaster, toast } from "react-hot-toast";
import Navigation from '../components/Navigation';

export default function EventRegistrationsPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
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

  // Fetch events
  async function fetchEvents() {
    const { data, error } = await supabase.from("events").select("*").order('date', { ascending: true });
    if (error) toast.error("Failed to fetch events");
    else setEvents(data);
  }

  // Fetch registrations for selected event
  async function fetchEventRegistrations(eventId) {
    setLoading(true);
    
    try {
      // First, get all registrations for the event
      const { data: registrationData, error: regError } = await supabase
        .from("event_registrations")
        .select("*")
        .eq('event_id', eventId.toString())
        .order('registered_at', { ascending: false });

      if (regError) {
        toast.error("Failed to fetch registrations");
        console.error(regError);
        setLoading(false);
        return;
      }

      if (!registrationData || registrationData.length === 0) {
        setRegistrations([]);
        setLoading(false);
        return;
      }

      // Get all student IDs from registrations
      const studentIds = registrationData.map(reg => reg.student_id).filter(Boolean);

      if (studentIds.length === 0) {
        setRegistrations([]);
        setLoading(false);
        return;
      }

      // Fetch student details separately
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("*")
        .in('id', studentIds);

      if (studentsError) {
        toast.error("Failed to fetch student details");
        console.error(studentsError);
        setLoading(false);
        return;
      }

      // Fetch event details
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq('id', eventId)
        .single();

      // Combine the data manually
      const combinedData = registrationData.map(registration => {
        const student = studentsData?.find(s => s.id === registration.student_id);
        return {
          ...registration,
          students: student || null,
          events: eventData || null
        };
      });

      setRegistrations(combinedData);
    } catch (error) {
      toast.error("Failed to fetch registrations");
      console.error("Fetch error:", error);
    }
    
    setLoading(false);
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
        <Navigation />
        <div className="p-8">
          <Toaster />
          <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-purple-100 mt-20">
            <h1 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">🔐 Organizer Access Required</h1>
            <p className="text-purple-600 mb-6 text-center">Enter the organizer password to access event registrations.</p>
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
                🚀 Access Event Registrations
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <Navigation />
      <div className="p-8">
        <Toaster />
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-8">📋 Event Registrations</h1>
          
          {/* Events List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6 mb-8">
            <h2 className="text-xl font-semibold text-purple-900 mb-4">📅 Select an Event</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                    selectedEvent?.id === event.id
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-purple-200 hover:border-purple-400 hover:bg-purple-25'
                  }`}
                  onClick={() => {
                    setSelectedEvent(event);
                    fetchEventRegistrations(event.id);
                  }}
                >
                  <h3 className="font-semibold text-purple-900 mb-1">{event.name}</h3>
                  <p className="text-sm text-purple-600 mb-1">📅 {new Date(event.date).toLocaleDateString()}</p>
                  <p className="text-sm text-purple-500">{event.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Registrations Table */}
          {selectedEvent && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-purple-900">
                  👥 Registrations for "{selectedEvent.name}"
                </h2>
                <div className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                  Total: {registrations.length} registered
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <div className="text-purple-600">Loading registrations...</div>
                </div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-12 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-4xl mb-4">📝</div>
                  <div className="text-purple-600 font-medium">No registrations found for this event.</div>
                  <div className="text-sm text-purple-500 mt-2">Registrations will appear here once students sign up.</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-purple-200 rounded-lg overflow-hidden">
                    <thead className="bg-gradient-to-r from-purple-600 to-purple-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          College
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Check-in Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registered At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {registrations.map((registration) => (
                        <tr key={registration.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {registration.students?.name || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                            {registration.students?.email || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                            {registration.students?.phone || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                            {registration.students?.college || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                            {registration.students?.department || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              registration.students?.checked_in_at
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {registration.students?.checked_in_at ? '✅ Checked In' : '⏳ Not Checked In'}
                            </span>
                            {registration.students?.checked_in_at && (
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(registration.students.checked_in_at).toLocaleString()}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                            {new Date(registration.registered_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
