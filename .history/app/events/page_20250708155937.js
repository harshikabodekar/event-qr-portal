'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Toaster, toast } from 'react-hot-toast';
import Modal from '../components/Modal';

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
    <div className="max-w-2xl mx-auto p-8">
      <Toaster />
      <h1 className="text-2xl font-bold mb-6">Events</h1>
      <button onClick={() => setModalOpen(true)} className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Create Event</button>
      <ul className="space-y-2">
        {events.map(ev => (
          <li key={ev.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
            <span>{ev.name} <span className="text-gray-500 text-sm">({ev.date})</span></span>
            <a href={`/register/${ev.id}`} className="text-blue-600 underline">Register</a>
          </li>
        ))}
      </ul>
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setAuthed(false); }}>
        {!authed ? (
          <form onSubmit={handleCreate} className="flex flex-col gap-2">
            <input type="password" placeholder="Organizer password" value={password} onChange={e => setPassword(e.target.value)} className="rounded px-2 py-1 border" required />
            <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">Authenticate</button>
          </form>
        ) : (
          <form onSubmit={handleCreate} className="flex flex-col gap-2">
            <input name="name" placeholder="Event Name" value={eventForm.name} onChange={handleChange} className="rounded px-2 py-1 border" required />
            <input name="date" type="date" value={eventForm.date} onChange={handleChange} className="rounded px-2 py-1 border" required />
            <button type="submit" className="bg-green-600 text-white rounded px-4 py-2">Create Event</button>
          </form>
        )}
      </Modal>
    </div>
  );
}