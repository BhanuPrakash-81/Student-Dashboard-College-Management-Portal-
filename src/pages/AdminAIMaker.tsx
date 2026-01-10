
import React, { useState } from 'react';
import { api } from '../services/api';

const AdminAIMaker: React.FC = () => {
    const [genData, setGenData] = useState({
        department: 'CSE',
        semester: 1,
        section: 'A'
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    const handleGenerate = async () => {
        const confirm = window.confirm("This will REPLACE the existing schedule for this Dept/Sem/Section. Continue?");
        if (!confirm) return;

        setIsGenerating(true);
        setMsg({ type: '', text: '' });
        try {
            await api.schedule.generateAI(genData);
            setMsg({ type: 'success', text: "Timetable generated successfully using AI heuristics!" });
        } catch (err: any) {
            setMsg({ type: 'error', text: err.message || "Auto-generation failed." });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-10 text-white relative">
                    <div className="absolute top-0 right-0 p-10 opacity-10 text-8xl">
                        <i className="fas fa-robot"></i>
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">AI Timetable Strategist</h1>
                        <p className="text-indigo-100 font-medium opacity-90 max-w-lg leading-relaxed">
                            Automatically generate optimized class schedules by balancing faculty availability, subject credits, and room allocations.
                        </p>
                    </div>
                </div>

                <div className="p-10 space-y-10">
                    {msg.text && (
                        <div className={`p-5 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            <i className={`fas ${msg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} text-xl`}></i>
                            <span className="font-bold">{msg.text}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target Department</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                                value={genData.department}
                                onChange={e => setGenData({ ...genData, department: e.target.value })}
                            >
                                <option>CSE</option>
                                <option>ECE</option>
                                <option>AI&DS</option>
                                <option>MECH</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Semester</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                                value={genData.semester}
                                onChange={e => setGenData({ ...genData, semester: Number(e.target.value) })}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Section</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                                value={genData.section}
                                onChange={e => setGenData({ ...genData, section: e.target.value })}
                            >
                                {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Section {s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                        <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                            <i className="fas fa-cogs text-indigo-500"></i> Generation Constraints
                        </h4>
                        <ul className="space-y-3">
                            {[
                                "No Faculty overlaps across different sections.",
                                "Maximum 6 periods per day (9:00 AM - 4:00 PM).",
                                "Uniform distribution of subject credits.",
                                "Respects Departmental room availability."
                            ].map((c, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                    {c}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl transition-all flex items-center justify-center gap-3 ${isGenerating ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-red-600 hover:-translate-y-1'}`}
                    >
                        {isGenerating ? (
                            <><i className="fas fa-sync fa-spin"></i> Analyzing Conflicts...</>
                        ) : (
                            <><i className="fas fa-magic"></i> Generate Optimized Schedule</>
                        )}
                    </button>

                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        *This action will overwrite existing schedules for the selected group.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminAIMaker;
