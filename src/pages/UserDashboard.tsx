import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Ticket, Calendar, Clock, ChevronRight, MapPin, Download, Eye, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import { domToPng } from 'modern-screenshot';
import { cn } from '../lib/utils';
import { generateTicketBackdrop } from '../services/imageService';
import { AnimatePresence } from 'motion/react';

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketBackdrop, setTicketBackdrop] = useState<string | null>(null);

  useEffect(() => {
    const loadBackdrop = async () => {
      const backdrop = await generateTicketBackdrop();
      setTicketBackdrop(backdrop);
    };
    loadBackdrop();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const downloadTicket = async (booking: any) => {
    const element = document.getElementById(`ticket-${booking.id}`);
    if (!element) return;

    setDownloading(booking.id);
    try {
      const dataUrl = await domToPng(element, { scale: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Hindustan_Waterpark_Ticket_${booking.id.slice(0, 8)}.pdf`);
    } catch (error) {
      console.error("Error generating ticket PDF:", error);
      alert("Failed to generate ticket. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight uppercase">DASHBOARD</h1>
            <p className="text-slate-500">Welcome back, <span className="font-bold text-blue-600">{user?.displayName || 'Guest'}</span>! Here are your bookings.</p>
          </div>
          <button 
            onClick={() => setShowAll(!showAll)}
            className={cn(
              "px-6 py-3 rounded-2xl font-bold transition-all text-sm",
              showAll ? "bg-slate-800 text-white" : "bg-white text-slate-900 border border-slate-200 shadow-sm"
            )}
          >
            {showAll ? "Showing All Bookings" : "Showing Recent Only"}
          </button>
        </div>

        {bookings.filter(b => {
          if (showAll) return true;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const bookingDate = new Date(b.visitDate);
          bookingDate.setHours(0, 0, 0, 0);
          return bookingDate >= today;
        }).length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200">
            <Ticket size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Bookings Yet</h3>
            <p className="text-slate-500 mb-8">You haven't booked any tickets yet. Ready for some fun?</p>
            <a href="/booking" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all inline-block">
              Book Now
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            {bookings.filter(b => {
              if (showAll) return true;
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const bookingDate = new Date(b.visitDate);
              bookingDate.setHours(0, 0, 0, 0);
              return bookingDate >= today;
            }).map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
              >
                <div className="p-8 flex flex-col md:flex-row gap-8">
                  {/* Ticket Info */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {booking.status}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">ID: {booking.id.slice(0, 8)}</span>
                    </div>

                    <h3 className="text-2xl font-black mb-6">Hindustan Waterpark Entry</h3>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visit Date</p>
                          <p className="font-bold">{format(new Date(booking.visitDate), 'PP')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                          <Ticket size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tickets</p>
                          <p className="font-bold">{booking.adults} Adults, {booking.kids} Kids</p>
                        </div>
                      </div>
                    </div>

                    {booking.status === 'confirmed' ? (
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={() => setSelectedTicket(booking)}
                          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                        >
                          <Eye size={18} /> View Ticket
                        </button>
                        <button
                          onClick={() => downloadTicket(booking)}
                          disabled={downloading === booking.id}
                          className={cn(
                            "flex items-center justify-center gap-2 bg-white text-slate-900 border border-slate-200 px-6 py-3 rounded-2xl font-bold transition-all shadow-sm",
                            downloading === booking.id ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50"
                          )}
                        >
                          {downloading === booking.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download size={18} /> Download PDF
                            </>
                          )}
                        </button>
                      </div>
                    ) : booking.status === 'pending' ? (
                      <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                        <Clock className="text-orange-500" size={20} />
                        <p className="text-xs font-bold text-orange-700">
                          Payment verification in progress. Your ticket will be available once confirmed.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
                        <AlertCircle className="text-red-500" size={20} />
                        <p className="text-xs font-bold text-red-700">
                          This booking has been cancelled. Please contact support if you have questions.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Desktop QR Preview (Only for confirmed) */}
                  {booking.status === 'confirmed' && (
                    <div className="hidden md:flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-100 min-w-[200px]">
                      <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                        <QRCodeSVG value={booking.qrCode || booking.id} size={100} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                        Quick Scan
                      </p>
                    </div>
                  )}
                </div>

                {/* Hidden Ticket for PDF Generation */}
                <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                  <div id={`ticket-${booking.id}`} style={{ width: '800px', padding: '48px', backgroundColor: '#ffffff', fontFamily: 'sans-serif' }}>
                    <div style={{ border: '4px solid #2563eb', padding: '32px', borderRadius: '48px', position: 'relative', overflow: 'hidden' }}>
                      {ticketBackdrop && (
                        <img 
                          src={ticketBackdrop} 
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15, zIndex: 0 }} 
                          alt="Backdrop"
                        />
                      )}
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                          <div>
                            <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#2563eb', marginBottom: '8px', fontStyle: 'italic', letterSpacing: '-0.05em' }}>HINDUSTAN</h1>
                            <p style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '0.3em', color: '#94a3b8' }}>WATERPARK</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '12px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Ticket ID</p>
                            <p style={{ fontSize: '20px', fontFamily: 'monospace', fontWeight: '700' }}>{booking.id.slice(0, 12)}</p>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '48px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                              <p style={{ fontSize: '12px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Guest Name</p>
                              <p style={{ fontSize: '24px', fontWeight: '700' }}>{booking.userName || user?.displayName}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '12px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Visit Date</p>
                              <p style={{ fontSize: '24px', fontWeight: '700' }}>{format(new Date(booking.visitDate), 'PPPP')}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '32px' }}>
                              <div>
                                <p style={{ fontSize: '12px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Adults</p>
                                <p style={{ fontSize: '24px', fontWeight: '700' }}>{booking.adults}</p>
                              </div>
                              <div>
                                <p style={{ fontSize: '12px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Kids</p>
                                <p style={{ fontSize: '24px', fontWeight: '700' }}>{booking.kids}</p>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(248, 250, 252, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '32px' }}>
                            <QRCodeSVG value={booking.qrCode || booking.id} size={180} />
                            <p style={{ marginTop: '16px', fontSize: '12px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Unique Entry QR</p>
                          </div>
                        </div>

                        <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#94a3b8' }}>
                            <MapPin size={20} />
                            <p style={{ fontSize: '14px', fontWeight: '700' }}>Hindustan Waterpark, Main Highway, City</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '12px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Total Paid</p>
                            <p style={{ fontSize: '24px', fontWeight: '900', color: '#2563eb' }}>₹{booking.totalPrice}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicket(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setSelectedTicket(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              <div className="relative h-48 bg-blue-600 overflow-hidden">
                {ticketBackdrop ? (
                  <img src={ticketBackdrop} alt="Backdrop" className="w-full h-full object-cover opacity-40" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-cyan-500" />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                  <h2 className="text-3xl font-black italic tracking-tighter">HINDUSTAN WATERPARK</h2>
                  <p className="text-xs font-black tracking-[0.5em] opacity-70 uppercase">Official Entry Ticket</p>
                </div>
              </div>

              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ticket ID</p>
                      <p className="text-lg font-mono font-bold text-blue-600">{selectedTicket.id}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Visit Date</p>
                        <p className="font-bold">{format(new Date(selectedTicket.visitDate), 'PP')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                        <p className="font-bold text-green-600">₹{selectedTicket.totalPrice}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Guest Details</p>
                      <p className="font-bold">{selectedTicket.adults} Adults, {selectedTicket.kids} Kids</p>
                    </div>
                    <div className="pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-green-600 font-bold">
                        <CheckCircle2 size={20} />
                        <span>Confirmed Booking</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                    <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                      <QRCodeSVG value={selectedTicket.qrCode || selectedTicket.id} size={160} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Scan at Entrance
                    </p>
                  </div>
                </div>

                <div className="mt-12 flex gap-4">
                  <button
                    onClick={() => downloadTicket(selectedTicket)}
                    disabled={downloading === selectedTicket.id}
                    className="flex-grow bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    {downloading === selectedTicket.id ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><Download size={20} /> Download PDF</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
