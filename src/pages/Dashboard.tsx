import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AttendanceSummary, EventItem, Announcement } from '../types';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [cgpa, setCgpa] = useState<string | null>(null);
  const [recentEvents, setRecentEvents] = useState<EventItem[]>([]);
  const [notifications, setNotifications] = useState<Announcement[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const firstName = localStorage.getItem('first_name');
  const studentId = localStorage.getItem('id');

  useEffect(() => {
    if (studentId) {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      Promise.all([
        api.attendance.getStudent(studentId),
        api.grades.getStudent(studentId),
        api.events.getAll(),
        api.announcements.getAll(),
        api.schedule.getStudent(studentId)
      ]).then(([att, grd, evts, anns, sched]) => {
        setAttendance(att.summary);
        setCgpa(grd.cgpa);
        setRecentEvents(evts.slice(0, 3));
        setNotifications(anns.filter((a: Announcement) => a.is_active === 1));
        setTodaySchedule(sched.filter((s: any) => s.day_of_week === today));
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-8 md:space-y-10">
      {/* Mobile-Friendly Notification Ticker */}
      {notifications.length > 0 && (
        <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-3 md:p-4 overflow-hidden relative flex items-center gap-4 md:gap-10">
          <div className="bg-red-600 text-white px-3 md:px-5 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg z-10 shrink-0">
            Bulletin
          </div>
          <div className="w-full overflow-hidden">
            <div className="animate-ticker whitespace-nowrap flex gap-12 text-slate-600 font-bold text-xs md:text-sm">
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

      {/* Greeting Header */}
      <div className="mb-2">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800">Hello, {firstName}! 🎓</h1>
        <p className="text-slate-500 font-medium text-xs md:text-sm">Here's your academic briefing for today.</p>
      </div>

      {/* Premium Stat Highlights - Grid is mobile-first */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Current CGPA', val: cgpa ? Number(cgpa).toFixed(2) : '0.00', icon: 'fas fa-graduation-cap', color: 'indigo', trend: '+0.2' },
          { label: 'Attendance', val: `${attPerc}%`, icon: 'fas fa-id-card', color: 'red', trend: 'Stable' },
          { label: 'Upcoming Events', val: recentEvents.length, icon: 'fas fa-sparkles', color: 'orange', trend: 'Active' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-xl transition-all duration-300 group">
            <div className="space-y-2">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
              <div className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">{stat.val}</div>
              <div className={`text-[10px] font-bold text-${stat.color}-500 bg-${stat.color}-50 px-2 py-0.5 rounded-full inline-block`}>{stat.trend}</div>
            </div>
            <div className={`w-14 h-14 md:w-20 md:h-20 rounded-3xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center text-2xl md:text-4xl group-hover:scale-110 transition-transform`}>
              <i className={stat.icon}></i>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
        {/* Middle Section: Today's Timeline - Spans most width on large screens */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Today's Schedule</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Timeline View</p>
              </div>
              <Link to="/schedule" className="bg-slate-900 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-slate-200">View Full Week</Link>
            </div>

            <div className="space-y-6">
              {todaySchedule.length === 0 ? (
                <div className="py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                  <p className="text-slate-400 font-bold">No academic sessions today.</p>
                </div>
              ) : todaySchedule.map((slot, idx) => (
                <div key={idx} className="relative pl-8 md:pl-12 group">
                  {/* Vertical line connector */}
                  {idx !== todaySchedule.length - 1 && <div className="absolute left-[7px] md:left-[11px] top-6 bottom-[-24px] w-0.5 bg-slate-100"></div>}
                  <div className="absolute left-0 top-1.5 w-4 h-4 md:w-6 md:h-6 rounded-full bg-white border-4 border-red-600 shadow-sm group-hover:scale-125 transition-transform z-10"></div>

                  <div className="bg-slate-50/50 group-hover:bg-white border border-transparent group-hover:border-slate-100 p-4 md:p-6 rounded-3xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-red-600 uppercase tracking-widest">{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</div>
                      <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">{slot.subject_name}</h4>
                      <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
                        <i className="fas fa-user text-[10px]"></i> Prof. {slot.faculty_name}
                      </div>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm text-center min-w-[100px]">
                      <div className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">Room</div>
                      <div className="text-sm font-black text-slate-700">{slot.room_number}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Mini Widgets */}
        <div className="lg:col-span-4 space-y-8 md:space-y-10">
          {/* Attendance Gauge Widget */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <h3 className="relative z-10 font-black text-xs uppercase tracking-widest text-slate-400 mb-8">Performance Gauge</h3>
            <div className="relative z-10 flex flex-col items-center justify-center py-4">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent"
                    className={attPerc >= 75 ? 'text-emerald-500' : 'text-red-500'}
                    strokeDasharray={439.82}
                    strokeDashoffset={439.82 - (439.82 * attPerc) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black">{attPerc}%</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Attendance</span>
                </div>
              </div>
              <Link to="/attendance" className="mt-8 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-white transition-colors">Digital Logs <i className="fas fa-chevron-right ml-1"></i></Link>
            </div>
          </div>

          {/* Events Mini List */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest underline decoration-red-600 decoration-4 underline-offset-8">Campus Buzz</h3>
              <Link to="/events" className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                <i className="fas fa-arrow-right text-xs"></i>
              </Link>
            </div>
            <div className="space-y-6 mt-10">
              {recentEvents.map(e => (
                <div key={e.id} className="flex gap-4 items-center group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                    {e.image ? <img src={`data:image/jpeg;base64,${e.image}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><i className="fas fa-image"></i></div>}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">{e.title}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5">{new Date(e.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div>
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
