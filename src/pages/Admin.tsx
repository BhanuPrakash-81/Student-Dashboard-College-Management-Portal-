
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PendingStudent, EventItem, Announcement } from '../types';

const Admin: React.FC = () => {
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // -- Event State --
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    type: 'Workshop',
    date: '',
    time: '',
    description: ''
  });
  const [eventImage, setEventImage] = useState<File | null>(null);

  // -- Announcement State --
  const [editingAnnId, setEditingAnnId] = useState<number | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    is_active: false
  });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    loadPending();
    loadEvents();
    loadAnnouncements();
  };

  const loadPending = () => {
    api.auth.getPendingStudents().then(data => setPendingStudents(data));
  };

  const loadEvents = () => {
    api.events.getAll().then(data => setEvents(data));
  }

  const loadAnnouncements = () => {
    api.announcements.getAll().then(data => setAnnouncements(data));
  }

  const handleApprove = async (id: number) => {
    await api.auth.approveStudent(id);
    loadPending();
  };

  // --- EVENTS HANDLERS ---
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(eventForm).forEach(([key, value]) => formData.append(key, value as string));
    if (eventImage) formData.append('image', eventImage);

    try {
      if (editingEventId) {
        await api.events.update(editingEventId, formData);
        alert('Event updated!');
      } else {
        await api.events.add(formData);
        alert('Event added!');
      }
      resetEventForm();
      loadEvents();
    } catch (err) {
      console.error(err);
      alert('Operation failed');
    }
  };

  const editEvent = (evt: EventItem) => {
    setEditingEventId(evt.id);
    setEventForm({
      title: evt.title,
      type: evt.type,
      date: evt.date ? new Date(evt.date).toISOString().split('T')[0] : '', // Format date for input
      time: evt.time,
      description: evt.description
    });
    setEventImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  const deleteEvent = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.events.delete(id);
      loadEvents();
    } catch (err) {
      alert("Failed to delete event");
    }
  };

  const resetEventForm = () => {
    setEditingEventId(null);
    setEventForm({ title: '', type: 'Workshop', date: '', time: '', description: '' });
    setEventImage(null);
  };


  // --- ANNOUNCEMENT HANDLERS ---
  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAnnId) {
        await api.announcements.update(editingAnnId, announcementForm);
        alert('Announcement updated!');
      } else {
        await api.announcements.add(announcementForm);
        alert('Announcement posted!');
      }
      resetAnnForm();
      loadAnnouncements();
    } catch (err) {
      console.error(err);
      alert('Operation failed');
    }
  };

  const editAnnouncement = (ann: Announcement) => {
    setEditingAnnId(ann.id);
    setAnnouncementForm({
      title: ann.title,
      message: ann.message,
      is_active: ann.is_active === 1
    });
  };

  const deleteAnnouncement = async (id: number) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await api.announcements.delete(id);
      loadAnnouncements();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const toggleAnnouncementStatus = async (ann: Announcement) => {
    try {
      // Toggle the boolean value
      await api.announcements.update(ann.id, {
        title: ann.title,
        message: ann.message,
        is_active: ann.is_active !== 1
      });
      loadAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  const resetAnnForm = () => {
    setEditingAnnId(null);
    setAnnouncementForm({ title: '', message: '', is_active: false });
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i className="fas fa-user-clock text-indigo-500"></i> Pending Student Approvals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingStudents.length === 0 ? <p className="text-slate-500 col-span-full">No pending approvals.</p> :
              pendingStudents.map(student => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={student.profile_image ? `data:image/jpeg;base64,${student.profile_image}` : "https://ui-avatars.com/api/?name=User&background=random"}
                      className="w-10 h-10 rounded-full object-cover"
                      alt="profile"
                    />
                    <div>
                      <div className="font-semibold text-slate-800">{student.full_name}</div>
                      <div className="text-xs text-slate-500">{student.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleApprove(student.id)}
                    className="px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                  >
                    Approve
                  </button>
                </div>
              ))
            }
          </div>
        </div>

        {/* --- EVENTS SECTION --- */}
        <div className="space-y-6">
          {/* Event Form */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-calendar-plus text-indigo-500"></i>
                {editingEventId ? 'Edit Event' : 'Add New Event'}
              </h2>
              {editingEventId && <button onClick={resetEventForm} className="text-xs text-slate-500 hover:text-red-500">Cancel Edit</button>}
            </div>

            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
                <input type="text" required value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select value={eventForm.type} onChange={e => setEventForm({ ...eventForm, type: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                    <option>Workshop</option>
                    <option>Cultural</option>
                    <option>Sports</option>
                    <option>Technical</option>
                    <option>Seminar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" required value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                <input type="text" placeholder="10:00 AM" required value={eventForm.time} onChange={e => setEventForm({ ...eventForm, time: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea required value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none h-24"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image {editingEventId && <span className="text-xs text-slate-400 font-normal">(Leave empty to keep current)</span>}</label>
                <input type="file" required={!editingEventId} onChange={e => setEventImage(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                {editingEventId ? 'Update Event' : 'Create Event'}
              </button>
            </form>
          </div>

          {/* Event List */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 max-h-[500px] overflow-y-auto">
            <h3 className="text-md font-bold text-slate-800 mb-4">Manage Events</h3>
            <div className="space-y-3">
              {events.map(evt => (
                <div key={evt.id} className="p-3 border border-slate-100 rounded-lg flex justify-between items-center hover:bg-slate-50">
                  <div>
                    <div className="font-semibold text-slate-700 text-sm">{evt.title}</div>
                    <div className="text-xs text-slate-500">{new Date(evt.date).toLocaleDateString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editEvent(evt)} className="text-indigo-600 hover:bg-indigo-50 p-1 rounded"><i className="fas fa-edit"></i></button>
                    <button onClick={() => deleteEvent(evt.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><i className="fas fa-trash"></i></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- ANNOUNCEMENTS SECTION --- */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-bullhorn text-orange-500"></i>
                {editingAnnId ? 'Edit Announcement' : 'Post Announcement'}
              </h2>
              {editingAnnId && <button onClick={resetAnnForm} className="text-xs text-slate-500 hover:text-red-500">Cancel Edit</button>}
            </div>

            <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input type="text" required value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. Exam Schedule Release" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea required value={announcementForm.message} onChange={e => setAnnouncementForm({ ...announcementForm, message: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none h-40" placeholder="Type your announcement here..."></textarea>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={announcementForm.is_active}
                  onChange={e => setAnnouncementForm({ ...announcementForm, is_active: e.target.checked })}
                  className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Show on Dashboard Ticker</label>
              </div>
              <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                {editingAnnId ? 'Update Announcement' : 'Post Announcement'}
              </button>
            </form>
          </div>

          {/* Announcement List */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 max-h-[500px] overflow-y-auto">
            <h3 className="text-md font-bold text-slate-800 mb-4">Manage Announcements</h3>
            <div className="space-y-3">
              {announcements.map(ann => (
                <div key={ann.id} className="p-3 border border-slate-100 rounded-lg flex justify-between items-start hover:bg-slate-50">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-700 text-sm">{ann.title}</div>
                    <div className="text-xs text-slate-500 mb-1">{ann.message.substring(0, 40)}...</div>
                    <button
                      onClick={() => toggleAnnouncementStatus(ann)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${ann.is_active === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {ann.is_active === 1 ? 'Visible on Dashboard' : 'Hidden'}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editAnnouncement(ann)} className="text-indigo-600 hover:bg-indigo-50 p-1 rounded"><i className="fas fa-edit"></i></button>
                    <button onClick={() => deleteAnnouncement(ann.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><i className="fas fa-trash"></i></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Admin;
