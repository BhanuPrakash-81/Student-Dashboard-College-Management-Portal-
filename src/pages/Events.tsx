import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { EventItem } from '../types';

const Events: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.events.getAll()
      .then(data => setEvents(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.type === filter);

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Workshop': return 'bg-blue-500';
      case 'Cultural': return 'bg-pink-500';
      case 'Sports': return 'bg-green-500';
      case 'Technical': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campus Events</h1>
          <p className="text-slate-500">Discover what's happening around you.</p>
        </div>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 shadow-sm"
        >
          <option value="all">All Events</option>
          <option value="Workshop">Workshop</option>
          <option value="Cultural">Cultural</option>
          <option value="Sports">Sports</option>
          <option value="Technical">Technical</option>
          <option value="Seminar">Seminar</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><i className="fas fa-spinner fa-spin text-3xl text-indigo-500"></i></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? filteredEvents.map(event => (
            <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group">
              <div className="h-48 bg-slate-200 relative overflow-hidden">
                {event.image ? (
                   <img src={`data:image/jpeg;base64,${event.image}`} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-300">
                     <i className="fas fa-image text-4xl"></i>
                   </div>
                )}
                <div className={`absolute top-4 left-4 text-xs font-bold text-white px-3 py-1 rounded-full ${getTypeColor(event.type)} shadow-sm`}>
                  {event.type}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-2">
                   <span><i className="far fa-calendar-alt mr-1"></i> {new Date(event.date).toLocaleDateString()}</span>
                   <span>•</span>
                   <span><i className="far fa-clock mr-1"></i> {event.time}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{event.title}</h3>
                <p className="text-slate-600 text-sm line-clamp-2 mb-4">{event.description}</p>
                <div className="flex items-center text-sm text-slate-500">
                  <i className="fas fa-map-marker-alt text-red-400 mr-2"></i> {event.location}
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-12 text-slate-400">
              <i className="fas fa-inbox text-4xl mb-3"></i>
              <p>No events found for this category.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Events;