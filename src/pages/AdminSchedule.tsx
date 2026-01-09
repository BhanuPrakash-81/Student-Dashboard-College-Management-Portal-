import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const AdminSchedule: React.FC = () => {
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        day: 'Monday',
        start_time: '09:00',
        end_time: '10:00',
        subject_id: '',
        faculty_id: '',
        room: '',
        department: 'CSE',
        semester: '1',
        section: 'A'
    });

    const [subjects, setSubjects] = useState<any[]>([]);
    const [faculty, setFaculty] = useState<any[]>([]);

    useEffect(() => {
        loadData();
        // In a real app, you'd fetch subjects and faculty lists too
        // For now, we'll assume they exist and we can fetch them from existing APIs or dedicated ones
        // We already have schedule.getAll which returns names
    }, []);

    const loadData = async () => {
        try {
            const data = await api.schedule.getAll();
            setSchedules(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.schedule.create(formData);
            alert("Schedule slot created!");
            setShowModal(false);
            loadData();
        } catch (err: any) {
            alert(err.message || "Failed to create schedule. Likely a conflict.");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Semester Schedule Maker</h1>
                    <p className="text-slate-500">Manage time slots, faculty assignments, and room allocations.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                    <i className="fas fa-plus"></i> Add New Slot
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold">
                        <tr>
                            <th className="px-6 py-4">Day & Time</th>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Faculty</th>
                            <th className="px-6 py-4">Class/Sec</th>
                            <th className="px-6 py-4">Room</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {schedules.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">{s.day_of_week}</div>
                                    <div className="text-xs text-indigo-600 font-medium">{s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-800 font-medium">
                                    {s.subject_name} ({s.subject_code})
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {s.faculty_name}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                                        {s.department}-{s.semester}{s.section}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {s.room_number}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                            <h3 className="text-lg font-bold text-slate-800">Add Schedule Slot</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Day</label>
                                    <select
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.day}
                                        onChange={e => setFormData({ ...formData, day: e.target.value })}
                                    >
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Room</label>
                                    <input
                                        type="text"
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g. R101"
                                        value={formData.room}
                                        onChange={e => setFormData({ ...formData, room: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Time</label>
                                    <input type="time" className="w-full border border-slate-200 rounded-lg p-2 text-sm" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Time</label>
                                    <input type="time" className="w-full border border-slate-200 rounded-lg p-2 text-sm" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject ID</label>
                                <input type="text" className="w-full border border-slate-200 rounded-lg p-2 text-sm" placeholder="ID (see database)" value={formData.subject_id} onChange={e => setFormData({ ...formData, subject_id: e.target.value })} required />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Faculty ID</label>
                                <input type="text" className="w-full border border-slate-200 rounded-lg p-2 text-sm" placeholder="ID (see database)" value={formData.faculty_id} onChange={e => setFormData({ ...formData, faculty_id: e.target.value })} required />
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 mt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800">Cancel</button>
                                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md shadow-indigo-100 hover:bg-indigo-700">Save Slot</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSchedule;
