import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const Timetable: React.FC<{ studentId: string }> = ({ studentId }) => {
    const [schedule, setSchedule] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Current logic: the API returns schedule based on student's metadata (dept, sem, sec)
        // which the backend fetches internally using the studentId.
        api.schedule.getStudent(studentId).then(data => {
            setSchedule(data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [studentId]);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-200 rounded"></div></div></div>;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">Weekly Timetable</h2>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                    Academic Sem 2025-26
                </span>
            </div>

            <div className="space-y-6">
                {days.map(day => {
                    const daySlots = schedule.filter(s => s.day_of_week === day);
                    return (
                        <div key={day} className={`relative pl-4 border-l-2 ${day === today ? 'border-indigo-500' : 'border-slate-100'}`}>
                            <h3 className={`text-sm font-bold mb-3 ${day === today ? 'text-indigo-600' : 'text-slate-400'}`}>
                                {day} {day === today && <span className="ml-2 text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase">Today</span>}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {daySlots.length === 0 ? (
                                    <div className="text-xs text-slate-400 italic py-1">No classes scheduled</div>
                                ) : (
                                    daySlots.map((slot, idx) => (
                                        <div key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-indigo-200 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-bold text-indigo-600 uppercase">{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</span>
                                                <span className="text-[10px] font-medium text-slate-400">Room {slot.room_number}</span>
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{slot.subject_name}</h4>
                                            <p className="text-[10px] text-slate-500 mt-1">Prof. {slot.faculty_name}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Timetable;
