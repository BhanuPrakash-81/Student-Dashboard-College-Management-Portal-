
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const AdminHolidays: React.FC = () => {
    const [holidays, setHolidays] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ date: '', reason: '', is_recurring: false });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await api.holidays.getAll();
            setHolidays(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.holidays.add(formData);
            alert("Holiday registered!");
            setFormData({ date: '', reason: '', is_recurring: false });
            loadData();
        } catch (err) {
            alert("Failed to save holiday");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Remove this holiday?")) return;
        try {
            await api.holidays.delete(id);
            loadData();
        } catch (err) {
            alert("Failed to delete");
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-slate-400">Syncing Calendar...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">College Holiday Registry</h1>
                    <p className="text-slate-500 font-medium">Manage academic breaks and university holidays.</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-xl">
                        <i className="fas fa-calendar-day"></i>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900">{holidays.length}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Total Holidays</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Add Holiday Form */}
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 h-fit sticky top-24">
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Register New Holiday</h3>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Date</label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-red-100 outline-none transition-all"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Occasion / Reason</label>
                            <input
                                type="text"
                                placeholder="e.g. Pongal Vacation"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-red-100 outline-none transition-all"
                                value={formData.reason}
                                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <input
                                type="checkbox" id="rec-hol"
                                checked={formData.is_recurring}
                                onChange={e => setFormData({ ...formData, is_recurring: e.target.checked })}
                            />
                            <label htmlFor="rec-hol" className="text-[10px] font-black text-slate-600 uppercase tracking-widest cursor-pointer">Recurring Annually</label>
                        </div>
                        <button className="w-full bg-red-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-red-100 hover:bg-slate-900 transition-all text-xs uppercase tracking-widest">
                            Add to Registry
                        </button>
                    </form>
                </div>

                {/* Holiday List */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {holidays.length === 0 ? (
                            <div className="col-span-full py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No holidays registered yet.</p>
                            </div>
                        ) : holidays.map((h, idx) => (
                            <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex justify-between items-center group hover:border-red-500 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="bg-slate-50 w-14 h-14 rounded-2xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-red-50 transition-colors">
                                        <div className="text-[10px] font-black text-slate-400 uppercase leading-none">{new Date(h.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                                        <div className="text-xl font-black text-slate-800 mt-1">{new Date(h.date).getDate()}</div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 text-lg leading-tight">{h.reason}</div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                            {h.is_recurring ? <span className="text-amber-600">Annual Return</span> : <span>One-time Break</span>}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(h.id)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all">
                                    <i className="fas fa-trash-alt text-sm"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHolidays;
