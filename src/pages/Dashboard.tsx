import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AttendanceSummary, EventItem, Announcement } from '../types';
import { Link } from 'react-router-dom';
import Timetable from '../components/Timetable';

const Dashboard: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [cgpa, setCgpa] = useState<string | null>(null);
  const [eventsCount, setEventsCount] = useState<number>(0);
  const [recentEvents, setRecentEvents] = useState<EventItem[]>([]);
  const [notifications, setNotifications] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const firstName = localStorage.getItem('first_name');
  const studentId = localStorage.getItem('id');

  useEffect(() => {
    if (studentId) {
      Promise.all([
        api.attendance.getStudent(studentId),
        api.grades.getStudent(studentId),
        api.events.getAll(),
        api.announcements.getAll()
      ]).then(([att, grd, evts, anns]) => {
        setAttendance(att.summary);
        setCgpa(grd.cgpa);
        setEventsCount(evts.length);
        setRecentEvents(evts.slice(0, 3));
        setNotifications(anns.filter(a => a.is_active === 1));
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [studentId]);

  if (loading) return <div className="p-20 text-center font-bold text-slate-400">Loading your academic space...</div>;

  const attPerc = attendance?.overallPercentage ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header / Welcome */}
      <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
        <div className="relative z-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">Welcome Back, {firstName}!</h1>
          <p className="text-red-100 font-medium text-lg italic opacity-80">"Education is the passport to the future."</p>
        </div>
        <div className="relative z-10 flex gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[100px]">
            <div className="text-2xl font-black">{cgpa ? Number(cgpa).toFixed(2) : '0.00'}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">Current CGPA</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[100px]">
            <div className="text-2xl font-black">{attPerc}%</div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">Attendance</div>
          </div>
        </div>
      </div>

      {/* Notification Ticker */}
      {notifications.length > 0 && (
        <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-4 overflow-hidden relative flex items-center gap-10">
          <div className="bg-red-600 text-white px-5 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg z-10 shrink-0">
            Bulletin
          </div>
          <div className="w-full overflow-hidden">
            <div className="animate-ticker whitespace-nowrap flex gap-12 text-slate-600 font-bold text-sm">
              {notifications.map((note) => (
                <span key={note.id} className="inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-2"></span>
                  {note.title}: {note.message}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid for Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Side: Schedule - Spans 2 */}
        <div className="lg:col-span-2 space-y-10">
          {studentId && <Timetable studentId={studentId} />}
        </div>

        {/* Right Side: Quick Stats & Events */}
        <div className="space-y-10">
          {/* Performance Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <i className="fas fa-chart-line text-indigo-500"></i> Semester Attendance
            </h3>
            <div className="relative h-40 flex items-center justify-center">
              {/* Simple circular progress representation */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent"
                  className={attPerc >= 75 ? 'text-emerald-500' : 'text-red-500'}
                  strokeDasharray={364.42}
                  strokeDashoffset={364.42 - (364.42 * attPerc) / 100}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800">{attPerc}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Average</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-50 p-3 rounded-2xl text-center">
                <div className="text-sm font-black text-slate-700">{attendance?.totalPresent || 0}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">Present</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl text-center">
                <div className="text-sm font-black text-slate-700">{(attendance?.totalClasses || 0) - (attendance?.totalPresent || 0)}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">Absent</div>
              </div>
            </div>
            <Link to="/attendance" className="block w-full text-center mt-6 text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">
              View Subject Breakdown
            </Link>
          </div>

          {/* Events List */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-sparkles text-yellow-500"></i> Events
              </h3>
              <Link to="/events" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Explore All</Link>
            </div>
            <div className="space-y-4">
              {recentEvents.map(event => (
                <div key={event.id} className="flex gap-4 p-2 group cursor-pointer">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105">
                    {event.image ? (
                      <img src={`data:image/jpeg;base64,${event.image}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-200"><i className="fas fa-image"></i></div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center overflow-hidden">
                    <h4 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-red-600 transition-colors">{event.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${event.type === 'Technical' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                        {event.type}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
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

export default Dashboard;
