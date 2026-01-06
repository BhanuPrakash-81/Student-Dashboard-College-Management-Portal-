
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AttendanceSummary, GradesResponse, EventItem, Announcement } from '../types';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [cgpa, setCgpa] = useState<string | null>(null);
  const [eventsCount, setEventsCount] = useState<number>(0);
  const [recentEvents, setRecentEvents] = useState<EventItem[]>([]);
  const [notifications, setNotifications] = useState<Announcement[]>([]);

  const user = {
    firstName: localStorage.getItem('first_name'),
    lastName: localStorage.getItem('last_name'),
    id: localStorage.getItem('id')
  };

  useEffect(() => {
    if (user.id) {
      // Load Attendance
      api.attendance.getStudent(user.id).then(data => {
        setAttendance(data.summary);
      }).catch(err => console.error("Att Err", err));

      // Load Grades
      api.grades.getStudent(user.id).then((data: GradesResponse) => {
        setCgpa(data.cgpa);
      }).catch(err => console.error("Grade Err", err));

      // Load Events
      api.events.getAll().then((data: EventItem[]) => {
        setEventsCount(data.length);
        setRecentEvents(data.slice(0, 3));
      }).catch(err => console.error("Event Err", err));

      // Load Announcements for Ticker
      api.announcements.getAll().then((data: Announcement[]) => {
        // Only show active announcements in ticker
        setNotifications(data.filter(a => a.is_active === 1));
      }).catch(err => console.error("Notif Err", err));
    }
  }, [user.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Notification Ticker */}
      {notifications.length > 0 && (
        <div className="bg-white border-l-4 border-orange-500 shadow-sm rounded-r-lg mb-8 overflow-hidden relative h-12 flex items-center">
          <div className="bg-orange-500 text-white px-4 h-full flex items-center font-bold z-10 shadow-lg absolute left-0 top-0">
            <i className="fas fa-bullhorn mr-2"></i> Updates
          </div>
          <div className="w-full overflow-hidden flex items-center h-full ml-32">
            <div className="animate-ticker whitespace-nowrap flex gap-12 text-slate-700 font-medium">
              {notifications.map((note) => (
                <span key={note.id} className="inline-flex items-center">
                  <i className="fas fa-circle text-[8px] text-orange-400 mr-2"></i>
                  {note.title}: {note.message.substring(0, 80)}{note.message.length > 80 ? '...' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Welcome back, {user.firstName}!</h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your academics today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Stat Cards */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl mb-3">
            <i className="fas fa-clipboard-check"></i>
          </div>
          <div className="text-3xl font-bold text-slate-800">{attendance?.overallPercentage ?? 0}%</div>
          <div className="text-sm text-slate-500 font-medium">Overall Attendance</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mb-3">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <div className="text-3xl font-bold text-slate-800">{cgpa ? Number(cgpa).toFixed(2) : 'N/A'}</div>
          <div className="text-sm text-slate-500 font-medium">Current CGPA</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xl mb-3">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="text-3xl font-bold text-slate-800">{eventsCount}</div>
          <div className="text-sm text-slate-500 font-medium">Upcoming Events</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Recent Events</h2>
            <Link to="/events" className="text-indigo-600 text-sm font-semibold hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentEvents.length === 0 ? (
              <p className="text-center text-slate-400 py-4">No upcoming events.</p>
            ) : (
              recentEvents.map(event => (
                <div key={event.id} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                    {event.image ? (
                      <img src={`data:image/jpeg;base64,${event.image}`} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-400"><i className="fas fa-image"></i></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 line-clamp-1">{event.title}</h3>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                           ${event.type === 'Workshop' ? 'bg-blue-100 text-blue-700' :
                          event.type === 'Cultural' ? 'bg-pink-100 text-pink-700' :
                            event.type === 'Sports' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                         `}>{event.type}</span>
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
