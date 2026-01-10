import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Announcement } from '../types';

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.announcements.getAll()
      .then(data => {
        if (Array.isArray(data)) setAnnouncements(data);
        else console.error("Expected array but got:", data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header Section */}
      <div className="relative mb-12 rounded-3xl overflow-hidden bg-gradient-to-r from-red-900 to-red-600 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="relative z-10 p-10 text-white">
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight">Announcements Channel</h1>
          <p className="text-red-100 text-lg opacity-90 max-w-2xl">Stay connected with the latest updates, circulars, and news from the university.</p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-10 translate-y-10">
          <i className="fas fa-bullhorn text-9xl"></i>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {announcements.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <i className="far fa-bell-slash text-4xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-700">No Announcements</h3>
            <p className="text-slate-400 mt-2">Check back later for updates.</p>
          </div>
        ) : (
          announcements.map((item) => (
            <div key={item.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden relative">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${item.is_active ? 'bg-gradient-to-b from-red-500 to-red-700' : 'bg-slate-300'}`}></div>

              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                {/* Date Badge */}
                <div className="flex-shrink-0">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center min-w-[100px] group-hover:bg-red-50 group-hover:border-red-100 transition-colors">
                    <span className="block text-3xl font-bold text-slate-800 group-hover:text-red-600">{new Date(item.created_at).getDate()}</span>
                    <span className="block text-xs font-bold uppercase text-slate-500 tracking-wide">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="block text-xs text-slate-400 mt-1">{new Date(item.created_at).getFullYear()}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-slate-800 group-hover:text-red-700 transition-colors">{item.title}</h2>
                    {Boolean(item.is_active) && <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase tracking-wider">New</span>}
                  </div>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{item.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;
