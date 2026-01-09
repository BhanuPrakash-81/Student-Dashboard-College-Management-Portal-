import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const FacultyDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [schedule, setSchedule] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const facultyId = localStorage.getItem('id');
    const firstName = localStorage.getItem('first_name');
    const dept = stats?.profile?.department || 'Department';

    useEffect(() => {
        if (facultyId) {
            Promise.all([
                api.faculty.getDashboard(facultyId),
                api.schedule.getFacultySchedule(Number(facultyId))
            ]).then(([statsData, scheduleData]) => {
                setStats(statsData);
                setSchedule(scheduleData);
                setLoading(false);
            }).catch(err => {
                console.error(err);
                setLoading(false);
            });
        }
    }, [facultyId]);

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayClasses = schedule.filter(s => s.day_of_week === today);

    if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Hello, Prof. {firstName}</h1>
                <p className="text-slate-500 mt-1">Faculty of {stats?.profile?.department || 'KLU'}. Here is your overview for {today}.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shadow-inner">
                        <i className="fas fa-chalkboard-teacher"></i>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{todayClasses.length}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Classes Today</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shadow-inner">
                        <i className="fas fa-book-reader"></i>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{stats?.stats?.totalStudents || 0}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Students Under You</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-2xl shadow-inner">
                        <i className="fas fa-clock"></i>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{todayClasses.length > 0 ? 'Pending' : 'None'}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Attendance Status</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <i className="fas fa-clock text-indigo-500"></i> Today's Schedule
                            </h2>
                            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded uppercase">{today}</span>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {todayClasses.length === 0 ? (
                                <div className="p-10 text-center text-slate-400 italic">No classes scheduled for today.</div>
                            ) : todayClasses.map((cl, idx) => (
                                <div key={idx} className="p-6 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                            <span className="text-[10px] font-bold uppercase leading-none">{cl.start_time.slice(0, 5)}</span>
                                            <div className="w-4 h-[1px] bg-current my-1 opacity-30"></div>
                                            <span className="text-[10px] font-bold uppercase leading-none">{cl.end_time.slice(0, 5)}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{cl.subject_name}</h3>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded uppercase">{cl.department}-{cl.semester}{cl.section}</span>
                                                <span className="flex items-center gap-1"><i className="fas fa-door-open"></i> {cl.room_number}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => window.location.hash = '#/faculty/attendance'}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
                                    >
                                        Take Attendance
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl rotate-12">
                            <i className="fas fa-university"></i>
                        </div>
                        <h3 className="font-bold mb-4 text-slate-400 uppercase tracking-widest text-xs">Profile Info</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="opacity-60 text-xs">Department</span>
                                <span className="font-bold">{stats?.profile?.department || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="opacity-60 text-xs">Designation</span>
                                <span className="font-bold">{stats?.profile?.designation || 'Faculty'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="opacity-60 text-xs">Assigned Subjects</span>
                                <span className="font-bold">{stats?.assignedClasses?.length || 0}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => window.location.hash = '#/profile'}
                            className="w-full mt-6 bg-white/10 hover:bg-white/20 border border-white/20 py-2 rounded-xl text-xs font-bold transition-all"
                        >
                            Update Profile
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                            <i className="fas fa-lightbulb text-yellow-500"></i> Quick Tip
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Attendance must be locked within 24 hours of the class. Ensure students are marked correctly before locking.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
