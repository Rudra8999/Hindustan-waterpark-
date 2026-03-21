import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, doc } from 'firebase/firestore';
import { format, addDays } from 'date-fns';
import { Ticket, Users, Calendar, QrCode, Phone, ChevronRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '../lib/utils';

export default function Booking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [visitDate, setVisitDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [bookings, setBookings] = useState<any[]>([]);
  const [ticketPrice, setTicketPrice] = useState(249);

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setTicketPrice(doc.data().ticketPrice || 249);
      }
    });

    if (!user) return;
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubBookings = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubSettings();
      unsubBookings();
    };
  }, [user]);

  const handleContinue = () => {
    navigate('/checkout', { state: { adults, kids, visitDate } });
  };

  return (
    <div className="bg-blue-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-blue-100 mb-12"
        >
          <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
            <Ticket className="text-blue-600" /> BOOK YOUR TICKETS
          </h2>
          
          <div className="space-y-8">
            {/* Adults */}
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Adults</h4>
                  <p className="text-sm text-slate-500">Age 12+</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setAdults(Math.max(1, adults - 1))}
                  className="w-10 h-10 rounded-full border-2 border-blue-200 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  -
                </button>
                <span className="text-2xl font-black w-8 text-center">{adults}</span>
                <button 
                  onClick={() => setAdults(adults + 1)}
                  className="w-10 h-10 rounded-full border-2 border-blue-200 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Kids */}
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Kids</h4>
                  <p className="text-sm text-slate-500">Age 3-11</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setKids(Math.max(0, kids - 1))}
                  className="w-10 h-10 rounded-full border-2 border-orange-200 flex items-center justify-center text-orange-600 hover:bg-orange-50 transition-colors"
                >
                  -
                </button>
                <span className="text-2xl font-black w-8 text-center">{kids}</span>
                <button 
                  onClick={() => setKids(kids + 1)}
                  className="w-10 h-10 rounded-full border-2 border-orange-200 flex items-center justify-center text-orange-600 hover:bg-orange-50 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Date */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                  <Calendar size={24} />
                </div>
                <h4 className="font-bold text-lg">Select Visit Date</h4>
              </div>
              <input 
                type="date" 
                value={visitDate}
                min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Summary */}
            <div className="pt-8 border-t border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-500 font-medium">Total Price</span>
                <span className="text-4xl font-black text-blue-600">₹{(adults + kids) * ticketPrice}</span>
              </div>
              <button
                onClick={handleContinue}
                className="w-full bg-blue-600 text-white py-5 rounded-3xl text-xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
              >
                CONTINUE TO CHECKOUT <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Previous Bookings */}
        {bookings.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-black mb-8">YOUR BOOKING HISTORY</h3>
            <div className="space-y-4">
              {bookings.map((b) => (
                <div key={b.id} className="bg-white p-8 rounded-[2rem] shadow-md border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <QRCodeSVG value={b.qrCode} size={80} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Visit: {format(new Date(b.visitDate), 'PP')}</h4>
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">{b.adults} Adults, {b.kids} Kids</p>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                        b.status === 'confirmed' ? "bg-green-100 text-green-700" : 
                        b.status === 'pending' ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                      )}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-2xl font-black text-blue-600">₹{b.totalPrice}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">{b.qrCode}</p>
                    {b.status === 'confirmed' && (
                      <button className="mt-4 text-blue-600 font-bold text-sm hover:underline">
                        Download Ticket
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
