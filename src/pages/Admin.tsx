import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PendingStudent, EventItem, Announcement } from '../types';

const Admin: React.FC = () => {
  const [stats, setStats] = useState({ students: 0, faculty: 0, events: 0, attendance: 0 });
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const [eventForm, setEventForm] = useState({ title: '', type: 'Workshop', date: '', time: '', description: '' });
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  const [annForm, setAnnForm] = useState({ title: '', message: '', is_active: false });
  const [editingAnnId, setEditingAnnId] = useState<number | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [pending, evts, anns] = await Promise.all([
        api.auth.getPendingStudents(),
        api.events.getAll(),
        api.announcements.getAll()
      ]);
      setPendingStudents(pending);
      setEvents(evts);
      setAnnouncements(anns);
      // Mocking some stats for the dashboard feel
      setStats({ students: 200, faculty: 15, events: evts.length, attendance: 16000 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    await api.auth.approveStudent(id);
    refreshData();
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(eventForm).forEach(([k, v]) => formData.append(k, v));
    if (eventImage) formData.append('image', eventImage);

    if (editingEventId) await api.events.update(editingEventId, formData);
    else await api.events.add(formData);

    setEditingEventId(null);
    setEventForm({ title: '', type: 'Workshop', date: '', time: '', description: '' });
    refreshData();
  };

  const handleAnnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAnnId) await api.announcements.update(editingAnnId, annForm);
    else await api.announcements.add(annForm);

    setEditingAnnId(null);
    setAnnForm({ title: '', message: '', is_active: false });
    refreshData();
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse transition-all">Synchronizing Database...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">University Management</h1>
          <p className="text-slate-500 font-medium">Global Administrator Control Panel</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white border border-slate-100 px-4 py-2 rounded-full shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          SYSTEM ONLINE: STABLE
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Enrolled', val: stats.students, icon: 'fas fa-user-graduate', color: 'indigo' },
          { label: 'Active Faculty', val: stats.faculty, icon: 'fas fa-chalkboard-teacher', color: 'violet' },
          { label: 'Published Events', val: stats.events, icon: 'fas fa-calendar-check', color: 'emerald' },
          { label: 'System Logs', val: stats.attendance, icon: 'fas fa-database', color: 'slate' }
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`w-12 h-12 rounded-2xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center text-xl mb-4`}>
              <i className={s.icon}></i>
            </div>
            <div className="text-3xl font-black text-slate-800 tracking-tighter">{s.val.toLocaleString()}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Requests & Lists */}
        <div className="lg:col-span-2 space-y-10">
          {/* Pending Approvals */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-id-badge text-indigo-500"></i> Registration Requests
              </h3>
              <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">{pendingStudents.length} Pending</span>
            </div>
            <div className="divide-y divide-slate-50">
              {pendingStudents.length === 0 ? (
                <div className="p-12 text-center text-slate-400 italic font-medium">No new registrations to review.</div>
              ) : pendingStudents.map(s => (
                <div key={s.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden ring-2 ring-white">
                      <img src={s.profile_image ? `data:image/jpeg;base64,${s.profile_image}` : `https://ui-avatars.com/api/?name=${s.full_name}`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{s.full_name}</div>
                      <div className="text-xs text-slate-500 font-medium">{s.email}</div>
                    </div>
                  </div>
                  <button onClick={() => handleApprove(s.id)} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200">Verify & Approve</button>
                </div>
              ))}
            </div>
          </div>

          {/* Content Feed Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mini Event List */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm">Active Events</h3>
                <button onClick={() => window.scrollTo(0, 500)} className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">New Event</button>
              </div>
              <div className="space-y-4">
                {events.slice(0, 4).map(e => (
                  <div key={e.id} className="group flex items-center gap-4 p-3 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400 text-xs font-bold uppercase transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                      {new Date(e.date).getDate()}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-800 line-clamp-1">{e.title}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{e.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Ann List */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-sm">System Notices</h3>
                <button className="text-[10px] font-bold text-orange-600 uppercase tracking-widest hover:underline">Post New</button>
              </div>
              <div className="space-y-4">
                {announcements.slice(0, 4).map(a => (
                  <div key={a.id} className="flex items-start gap-4 p-3 rounded-2xl bg-slate-50/50 border border-slate-50">
                    <div className="mt-1"><span className={`w-2 h-2 rounded-full block ${a.is_active === 1 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span></div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 line-clamp-1">{a.title}</div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-2">{a.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="space-y-10">
          {/* Notification Poster */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <i className="fas fa-bolt text-orange-500"></i> Dispatch Notice
            </h3>
            <form onSubmit={handleAnnSubmit} className="space-y-5">
              <input
                type="text"
                placeholder="Announcement Title"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                value={annForm.title}
                onChange={e => setAnnForm({ ...annForm, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Message body..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all h-32 resize-none"
                value={annForm.message}
                onChange={e => setAnnForm({ ...annForm, message: e.target.value })}
                required
              />
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <input type="checkbox" id="adm-act" checked={annForm.is_active} onChange={e => setAnnForm({ ...annForm, is_active: e.target.checked })} className="w-4 h-4 rounded text-orange-600" />
                <label htmlFor="adm-act" className="text-xs font-bold text-slate-600">Broadcast to Dashboard Ticker</label>
              </div>
              <button className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-100 hover:bg-orange-600 hover:-translate-y-0.5 transition-all text-sm uppercase tracking-widest">
                Dispatch Announcement
              </button>
            </form>
          </div>

          {/* Quick Access Grid */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => window.location.hash = '#/admin/schedule'} className="bg-slate-900 aspect-square rounded-3xl flex flex-col items-center justify-center gap-3 text-white hover:bg-slate-800 transition-all group">
              <i className="fas fa-calendar-alt text-2xl group-hover:scale-110 transition-transform"></i>
              <span className="text-[10px] font-black uppercase tracking-widest">Schedule Maker</span>
            </button>
            <button className="bg-white border border-slate-100 aspect-square rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-800 hover:border-indigo-500 transition-all group">
              <i className="fas fa-cog text-2xl text-slate-300 group-hover:rotate-90 group-hover:text-indigo-500 transition-transform duration-500"></i>
              <span className="text-[10px] font-black uppercase tracking-widest">Global Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
