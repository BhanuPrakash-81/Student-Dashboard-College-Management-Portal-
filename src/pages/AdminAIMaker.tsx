
import React, { useState } from 'react';
import { api } from '../services/api';

const AdminAIMaker: React.FC = () => {
    const [genData, setGenData] = useState({
        department: 'CSE',
        semester: 1,
        section: 'A',
        startTime: '09:00',
        duration: 50,
        slotsCount: 7,
        intervalStart: '10:40',
        intervalDuration: 15,
        breakStart: '12:45',
        breakDuration: 60
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
            setMsg({ type: 'success', text: "Timetable generated successfully with multi-break strategy!" });
        } catch (err: any) {
            setMsg({ type: 'error', text: err.message || "Auto-generation failed." });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-10 text-white relative">
                    <div className="absolute top-0 right-0 p-10 opacity-10 text-8xl">
                        <i className="fas fa-robot"></i>
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black tracking-tight mb-2 uppercase italic">AI Timetable Strategist</h1>
                        <p className="text-indigo-100 font-medium opacity-90 max-w-lg leading-relaxed">
                            Ultra-flexible scheduling engine with multi-break support and staggered entry protocols.
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Timing Panel */}
                        <div className="bg-indigo-50/30 p-8 rounded-[2rem] border border-indigo-100 space-y-6">
                            <h4 className="font-black text-indigo-900 text-[10px] uppercase tracking-widest flex items-center gap-2">
                                <i className="fas fa-clock"></i> Session Configuration
                            </h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Class Start</label>
                                    <input
                                        type="time"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                        value={genData.startTime}
                                        onChange={e => setGenData({ ...genData, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Slot Mins</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                        value={genData.duration}
                                        onChange={e => setGenData({ ...genData, duration: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Daily Periods Count</label>
                                <input
                                    type="range" min="1" max="10"
                                    className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    value={genData.slotsCount}
                                    onChange={e => setGenData({ ...genData, slotsCount: Number(e.target.value) })}
                                />
                                <div className="text-right text-[10px] font-black text-indigo-600 mt-1">{genData.slotsCount} Periods</div>
                            </div>
                        </div>

                        {/* Breaks Panel */}
                        <div className="bg-orange-50/30 p-8 rounded-[2rem] border border-orange-100 space-y-6">
                            <h4 className="font-black text-orange-900 text-[10px] uppercase tracking-widest flex items-center gap-2">
                                <i className="fas fa-mug-hot"></i> Flexible Break Policy
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Interval Start</label>
                                    <input
                                        type="time"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                                        value={genData.intervalStart}
                                        onChange={e => setGenData({ ...genData, intervalStart: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Interval Mins</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                                        value={genData.intervalDuration}
                                        onChange={e => setGenData({ ...genData, intervalDuration: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Lunch Start</label>
                                    <input
                                        type="time"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                                        value={genData.breakStart}
                                        onChange={e => setGenData({ ...genData, breakStart: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Lunch Mins</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                                        value={genData.breakDuration}
                                        onChange={e => setGenData({ ...genData, breakDuration: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-indigo-500/40 transition-all duration-500"></div>
                        <h4 className="font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                            <i className="fas fa-shield-check text-emerald-400"></i> Smart Constraint Validation
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                            {[
                                "Cross-Section Faculty Scheduling",
                                "Staggered Multi-Break sequence",
                                "Departmental Room Load Balancing",
                                "Automatic Break Transition"
                            ].map((c, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                                    <i className="fas fa-check text-emerald-500 text-[8px]"></i>
                                    {c}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className={`w-full py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm shadow-2xl transition-all flex items-center justify-center gap-4 ${isGenerating ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-950 text-white hover:bg-indigo-600 hover:-translate-y-2 active:scale-95'}`}
                    >
                        {isGenerating ? (
                            <><i className="fas fa-circle-notch fa-spin"></i> Synthesizing Schedule...</>
                        ) : (
                            <><i className="fas fa-bolt-lightning"></i> AI Deployment</>
                        )}
                    </button>

                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">
                        Multi-parameter generation engine v2.0 • Respects all academic holidays
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminAIMaker;
