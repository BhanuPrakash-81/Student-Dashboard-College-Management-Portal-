import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const StudentSchedule: React.FC = () => {
    const [schedule, setSchedule] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
    const studentId = localStorage.getItem('id');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        if (studentId) {
            api.schedule.getStudent(studentId).then(data => {
                setSchedule(data);
                setLoading(false);
            }).catch(err => {
                console.error(err);
                setLoading(false);
            });
        }
    }, [studentId]);

    const filteredSchedule = schedule.filter(s => s.day_of_week === selectedDay)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));

    if (loading) return <div className="p-20 text-center font-bold text-slate-400">Loading your schedule...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Timetable</h1>
                    <p className="text-slate-500 font-medium italic">"Manage your time, master your future."</p>
                </div>
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
                    {days.map(day => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedDay === day
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {day.slice(0, 3)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSchedule.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <i className="fas fa-calendar-times text-2xl"></i>
                        </div>
                        <p className="text-slate-400 font-bold">No classes scheduled for {selectedDay}.</p>
                        <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-1">Enjoy your break!</p>
                    </div>
                ) : filteredSchedule.map((slot, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                            </div>
                            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                                Room {slot.room_number}
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2 truncate group-hover:text-red-600 transition-colors uppercase tracking-tight">
                            {slot.subject_name}
                        </h3>
                        <div className="flex items-center gap-2 mb-4">
                            <i className="fas fa-chalkboard-teacher text-slate-300 text-xs"></i>
                            <span className="text-xs font-bold text-slate-500">{slot.faculty_name}</span>
                        </div>
                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="text-[10px] font-black text-slate-400 uppercase">Live Session</span>
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                50 Minutes
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentSchedule;
