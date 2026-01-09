import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const FacultySchedule: React.FC = () => {
    const [schedule, setSchedule] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const facultyId = localStorage.getItem('id');

    useEffect(() => {
        if (facultyId) {
            api.schedule.getFacultySchedule(Number(facultyId)).then(data => {
                setSchedule(data);
                setLoading(false);
            }).catch(console.error);
        }
    }, [facultyId]);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    if (loading) return <div className="p-10 text-center">Loading Weekly Schedule...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Weekly Timetable</h1>
                <p className="text-slate-500">Your assigned classes and room allocations for the current semester.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {days.map(day => {
                    const daySlots = schedule.filter(s => s.day_of_week === day);
                    const isToday = day === today;

                    return (
                        <div key={day} className={`space-y-4 ${isToday ? 'opacity-100 scale-100' : 'opacity-80'}`}>
                            <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-1 ${isToday ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-100' : 'bg-white text-slate-400 border-slate-100 shadow-sm'}`}>
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">{day.slice(0, 3)}</span>
                                <span className={`h-1 w-6 rounded-full mt-1 ${isToday ? 'bg-white' : 'bg-slate-100'}`}></span>
                            </div>

                            <div className="space-y-4">
                                {daySlots.length === 0 ? (
                                    <div className="p-6 text-center text-[10px] font-bold text-slate-300 border border-dashed border-slate-100 rounded-2xl">
                                        FREE DAY
                                    </div>
                                ) : daySlots.map((slot, idx) => (
                                    <div key={idx} className={`p-5 rounded-2xl border shadow-sm transition-all hover:shadow-md ${isToday ? 'bg-white border-indigo-100 ring-1 ring-indigo-50' : 'bg-white border-slate-100'}`}>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase leading-none">
                                                {slot.start_time.slice(0, 5)}
                                            </span>
                                            <span className="text-[9px] font-black text-slate-300 uppercase letter-spacing-1 leading-none">
                                                {slot.room_number}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight h-10 mb-2">
                                            {slot.subject_name}
                                        </h4>
                                        <div className="pt-3 border-t border-slate-50 flex items-center justify-between mt-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                {slot.department}-{slot.semester}{slot.section}
                                            </span>
                                            <i className="fas fa-arrow-right text-[10px] text-slate-200"></i>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FacultySchedule;
