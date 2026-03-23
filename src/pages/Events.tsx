import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { CalendarDays, Clock, MapPin, ArrowRight, Star } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import CountdownTimer from '../components/CountdownTimer';

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubEvents = onSnapshot(query(collection(db, 'events'), orderBy('date', 'asc')), (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    });

    return () => {
      unsubEvents();
      unsubSettings();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Festival Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-[3rem] p-8 md:p-20 text-white relative overflow-hidden mb-20"
        >
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 text-cyan-200 mb-6">
                <Star className="fill-cyan-200" size={24} />
                <span className="font-black uppercase tracking-[0.3em] text-sm">Featured Event</span>
              </div>
              <h1 className="text-4xl md:text-7xl font-black mb-8 leading-tight tracking-tighter uppercase">
                {settings?.festivalTitle || 'SUMMER SPLASH FESTIVAL 2026'}
              </h1>
              <p className="text-xl mb-12 text-blue-100 max-w-xl leading-relaxed">
                {settings?.festivalDescription || "Get ready for the biggest water festival of the year! Live music, special water games, and exclusive food stalls. Don't miss out!"}
              </p>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                  <CalendarDays size={20} />
                  <span className="font-bold">{settings?.festivalDate ? format(new Date(settings.festivalDate), 'PPPP') : 'May 1, 2026'}</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                  <MapPin size={20} />
                  <span className="font-bold">Main Arena</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <CountdownTimer 
                targetDate={settings?.festivalDate || "2026-05-01T00:00:00"} 
                title="Festival Starts In:" 
              />
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        </motion.div>

        {/* Other Events */}
        <div className="mb-12">
          <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">Upcoming Events</h2>
          <p className="text-slate-500">Don't miss out on these exciting activities happening at Hindustan Waterpark.</p>
        </div>

        {events.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
            <CalendarDays size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Other Events Scheduled</h3>
            <p className="text-slate-500">Check back soon for more exciting updates!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 group hover:shadow-xl transition-all"
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={event.imageUrl || `https://picsum.photos/seed/event-${idx}/800/600`} 
                    alt={event.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black text-blue-600 uppercase tracking-widest">
                    {event.category || 'Special'}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-black mb-4 group-hover:text-blue-600 transition-colors">{event.title}</h3>
                  <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                      <CalendarDays size={16} className="text-blue-500" />
                      <span>{format(new Date(event.date), 'PPPP')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                      <Clock size={16} className="text-blue-500" />
                      <span>{event.time || 'All Day'}</span>
                    </div>
                  </div>
                  <a href="/booking" className="flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all">
                    Book Tickets <ArrowRight size={18} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
