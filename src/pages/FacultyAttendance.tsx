import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const FacultyAttendance: React.FC = () => {
    const [schedule, setSchedule] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [attendanceData, setAttendanceData] = useState<{ [key: number]: string }>({});
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const facultyId = localStorage.getItem('id');

    useEffect(() => {
        if (facultyId) {
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            api.schedule.getFacultySchedule(Number(facultyId)).then(data => {
                const todayOnly = data.filter((s: any) => s.day_of_week === today);
                setSchedule(todayOnly);
                setLoading(false);
            }).catch(console.error);
        }
    }, [facultyId]);

    const fetchClassStudents = async (slot: any) => {
        setMarking(true);
        setSelectedSlot(slot);
        try {
            const list = await api.faculty.getClassList(slot.department, slot.semester, slot.section);
            setStudents(list);

            // Initialize everyone as Present by default
            const initial: any = {};
            list.forEach((s: any) => initial[s.id] = 'Present');
            setAttendanceData(initial);
        } catch (err) {
            console.error(err);
        } finally {
            setMarking(false);
        }
    };

    const handleStatusChange = (studentId: number, status: string) => {
        setAttendanceData(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async () => {
        if (!selectedSlot) return;
        const confirmLock = window.confirm("Are you sure? Once submitted, the attendance for this period is locked.");
        if (!confirmLock) return;

        try {
            const formatted = Object.entries(attendanceData).map(([id, status]) => ({
                student_id: Number(id),
                status
            }));

            await api.faculty.markAttendance({
                faculty_id: facultyId,
                subject_id: selectedSlot.subject_id,
                date: new Date().toISOString().split('T')[0],
                attendance: formatted
            });

            alert("Attendance recorded and locked for this slot!");
            setSelectedSlot(null);
            setStudents([]);
        } catch (err) {
            alert("Failed to save attendance.");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Schedule...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Take Attendance</h1>
                <p className="text-slate-500">Only classes scheduled for today are available for recording.</p>
            </div>

            {!selectedSlot ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schedule.length === 0 ? (
                        <div className="col-span-full p-12 bg-white rounded-3xl border border-dashed border-slate-200 text-center text-slate-400">
                            <i className="fas fa-calendar-times text-4xl mb-4 block"></i>
                            No classes scheduled for you today.
                        </div>
                    ) : schedule.map((slot, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-indigo-500 transition-all cursor-pointer group" onClick={() => fetchClassStudents(slot)}>
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase tracking-wider">
                                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                    Room {slot.room_number}
                                </span>
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg mb-2">{slot.subject_name}</h3>
                            <p className="text-sm text-slate-500 mb-6 font-medium">Class: {slot.department}-{slot.semester}{slot.section}</p>
                            <button className="w-full bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 py-3 rounded-xl font-bold text-sm transition-all duration-300">
                                Select Period
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <button onClick={() => setSelectedSlot(null)} className="text-slate-400 hover:text-slate-800"><i className="fas fa-arrow-left"></i></button>
                                <h3 className="text-xl font-bold text-slate-800">{selectedSlot.subject_name}</h3>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
                                <span className="flex items-center gap-1"><i className="fas fa-users"></i> {selectedSlot.department}-{selectedSlot.semester}{selectedSlot.section}</span>
                                <span className="flex items-center gap-1"><i className="fas fa-clock"></i> {selectedSlot.start_time.slice(0, 5)}</span>
                                <span className="flex items-center gap-1"><i className="fas fa-calendar-check text-indigo-500"></i> {new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setSelectedSlot(null)} className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800">Cancel</button>
                            <button onClick={handleSubmit} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2">
                                <i className="fas fa-lock"></i> Lock & Submit
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-4">ID</th>
                                    <th className="px-8 py-4">Student Name</th>
                                    <th className="px-8 py-4 text-center">Attendance Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {marking ? (
                                    <tr><td colSpan={3} className="p-20 text-center text-slate-400">Fetching students...</td></tr>
                                ) : students.map((s, idx) => (
                                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-8 py-5 text-sm font-bold text-slate-400 tracking-tighter">{s.id}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100">
                                                    <img src={`https://ui-avatars.com/api/?name=${s.first_name}&background=random`} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="font-bold text-slate-700">{s.first_name} {s.last_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-center gap-2">
                                                {['Present', 'Absent', 'Late'].map(status => (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleStatusChange(s.id, status)}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${attendanceData[s.id] === status
                                                                ? status === 'Present' ? 'bg-emerald-500 text-white border-emerald-500' :
                                                                    status === 'Absent' ? 'bg-red-500 text-white border-red-500' : 'bg-orange-500 text-white border-orange-500'
                                                                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                                                            }`}
                                                    >
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyAttendance;
