import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { db } from '../../firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { 
  LayoutDashboard, 
  Ticket, 
  Waves, 
  CalendarDays, 
  Settings as SettingsIcon,
  TrendingUp,
  Users,
  IndianRupee,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalVisitors: 0,
    recentBookings: [] as any[]
  });

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'), limit(5));
    const unsub = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const bookings = snapshot.docs.map(doc => doc.data());
      const totalRevenue = bookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
      const totalVisitors = bookings.reduce((acc, b) => acc + (b.adults || 0) + (b.kids || 0), 0);
      
      setStats(prev => ({
        ...prev,
        totalBookings: snapshot.size,
        totalRevenue,
        totalVisitors,
        recentBookings: snapshot.docs.slice(0, 5).map(doc => ({ id: doc.id, ...doc.data() }))
      }));
    });
    return () => unsub();
  }, []);

  const adminNav = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Bookings', path: '/admin/bookings', icon: Ticket, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Attractions', path: '/admin/attractions', icon: Waves, color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { name: 'Events', path: '/admin/events', icon: CalendarDays, color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Settings', path: '/admin/settings', icon: SettingsIcon, color: 'text-slate-600', bg: 'bg-slate-100' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900">ADMIN DASHBOARD</h1>
            <p className="text-slate-500">Welcome back! Here's what's happening at the park.</p>
          </div>
          <div className="flex gap-2 md:gap-3 flex-wrap">
            {adminNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "p-3 md:p-4 rounded-2xl transition-all hover:scale-110 shadow-sm",
                  item.bg, item.color
                )}
                title={item.name}
              >
                <item.icon size={20} className="md:w-6 md:h-6" />
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <TrendingUp size={24} />
              </div>
              <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">Total Bookings</span>
            </div>
            <div className="text-4xl font-black">{stats.totalBookings}</div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                <IndianRupee size={24} />
              </div>
              <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">Total Revenue</span>
            </div>
            <div className="text-4xl font-black">₹{stats.totalRevenue.toLocaleString()}</div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                <Users size={24} />
              </div>
              <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">Total Visitors</span>
            </div>
            <div className="text-4xl font-black">{stats.totalVisitors}</div>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xl font-black uppercase tracking-tight">RECENT BOOKINGS</h3>
            <Link to="/admin/bookings" className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <th className="px-8 py-4">Customer</th>
                  <th className="px-8 py-4">Visit Date</th>
                  <th className="px-8 py-4">Tickets</th>
                  <th className="px-8 py-4">Amount</th>
                  <th className="px-8 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold">{b.userName || 'Guest'}</div>
                      <div className="text-xs text-slate-400">{b.userEmail}</div>
                    </td>
                    <td className="px-8 py-6 font-medium text-slate-600">
                      {format(new Date(b.visitDate), 'PP')}
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold">{b.adults + b.kids}</span>
                      <span className="text-xs text-slate-400 ml-1">({b.adults}A, {b.kids}K)</span>
                    </td>
                    <td className="px-8 py-6 font-black text-blue-600">₹{b.totalPrice}</td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                        b.status === 'confirmed' ? "bg-green-100 text-green-700" : 
                        b.status === 'pending' ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                      )}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {stats.recentBookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400 italic">
                      No bookings found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-slate-50">
            {stats.recentBookings.map((b) => (
              <div key={b.id} className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold">{b.userName || 'Guest'}</div>
                    <div className="text-xs text-slate-400">{b.userEmail}</div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                    b.status === 'confirmed' ? "bg-green-100 text-green-700" : 
                    b.status === 'pending' ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                  )}>
                    {b.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="text-slate-500 font-medium">{format(new Date(b.visitDate), 'PP')}</div>
                  <div className="font-black text-blue-600">₹{b.totalPrice}</div>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {b.adults} Adults, {b.kids} Kids
                </div>
              </div>
            ))}
            {stats.recentBookings.length === 0 && (
              <div className="p-12 text-center text-slate-400 italic">
                No bookings found yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
