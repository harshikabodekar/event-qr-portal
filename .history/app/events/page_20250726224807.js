'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Toaster, toast } from 'react-hot-toast';
import Modal from '../components/Modal';
import Navigation from '../components/Navigation';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({ name: '', date: '' });
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);

  useEffect(() => { fetchEvents(); }, []);
  async function fetchEvents() {
    const { data } = await supabase.from('events').select('*').order('date', { ascending: true });
    setEvents(data || []);
  }

  function handleChange(e) {
    setEventForm({ ...eventForm, [e.target.name]: e.target.value });
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!authed) {
      if (password !== process.env.NEXT_PUBLIC_ORGANIZER_PASSWORD) {
        toast.error('Wrong password');
        return;
      }
      setAuthed(true);
      return;
    }
    const { error } = await supabase.from('events').insert([eventForm]);
    if (error) toast.error('Failed to create event');
    else {
      toast.success('Event created!');
      setModalOpen(false);
      setEventForm({ name: '', date: '' });
      fetchEvents();
    }
  }

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <Navigation />
      <div className="max-w-4xl mx-auto p-8">
      <Toaster />
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Events</h1>
      <button 
        onClick={() => setModalOpen(true)} 
        className="mb-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        ✨ Create Event
      </button>
      <div className="grid gap-4">
        {events.map(ev => (
          <div key={ev.id} className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 hover:border-purple-200 flex justify-between items-center">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-purple-900 mb-1">{ev.name}</h3>
              <p className="text-purple-600 text-sm">📅 {new Date(ev.date).toLocaleDateString()}</p>
            </div>
            <a 
              href={`/register/${ev.id}`} 
              className="ml-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Register →
            </a>
          </div>
        ))}
        {events.length === 0 && (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-purple-900 mb-2">No Events Yet</h3>
            <p className="text-purple-600">Create your first event to get started!</p>
          </div>
        )}
      </div>
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setAuthed(false); }}>
        {!authed ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">🔐 Organizer Authentication</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input 
                type="password" 
                placeholder="Enter organizer password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black bg-purple-50/30" 
                required 
              />
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300"
              >
                🔓 Authenticate
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">✨ Create New Event</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input 
                name="name" 
                placeholder="Event Name" 
                value={eventForm.name} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black bg-purple-50/30" 
                required 
              />
              <input 
                name="date" 
                type="date" 
                value={eventForm.date} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black bg-purple-50/30" 
                required 
              />
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300"
              >
                🎉 Create Event
              </button>
            </form>
          </div>
        )}
      </Modal>
    </div>
    </div>
  );
}