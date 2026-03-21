import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { Search, Filter, Trash2, CheckCircle, XCircle, Download, Scan, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { jsPDF } from 'jspdf';
import { domToPng } from 'modern-screenshot';
import { QRCodeSVG } from 'qrcode.react';

export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanModal, setScanModal] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
    booking?: any;
  }>({ show: false, type: 'success', title: '', message: '' });
  const [downloading, setDownloading] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isScanning) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      scannerRef.current.render(async (decodedText) => {
        setScanResult(decodedText);
        setSearchTerm(decodedText);
        setIsScanning(false);
        scannerRef.current?.clear();

        // Process the scan
        const booking = bookings.find(b => b.qrCode === decodedText || b.id === decodedText);
        if (booking) {
          if (booking.used) {
            setScanModal({
              show: true,
              type: 'warning',
              title: 'ALREADY USED',
              message: `This ticket was already scanned at ${format(new Date(booking.usedAt), 'PPpp')}`,
              booking
            });
          } else if (booking.status !== 'confirmed') {
            setScanModal({
              show: true,
              type: 'error',
              title: 'NOT CONFIRMED',
              message: `This booking status is currently "${booking.status}". Please confirm payment first.`,
              booking
            });
          } else {
            try {
              await updateDoc(doc(db, 'bookings', booking.id), { 
                used: true, 
                usedAt: new Date().toISOString() 
              });
              setScanModal({
                show: true,
                type: 'success',
                title: 'VALIDATED',
                message: `Welcome, ${booking.userName}! Ticket verified successfully.`,
                booking
              });
            } catch (err) {
              console.error("Error validating ticket:", err);
              setScanModal({
                show: true,
                type: 'error',
                title: 'SERVER ERROR',
                message: 'Failed to update ticket status. Please check your connection.'
              });
            }
          }
        } else {
          setScanModal({
            show: true,
            type: 'error',
            title: 'INVALID TICKET',
            message: 'No booking found for this QR code. Please check if it is a valid Hindustan Waterpark ticket.'
          });
        }
      }, (error) => {
        // console.warn(error);
      });
    }

    return () => {
      scannerRef.current?.clear();
    };
  }, [isScanning]);

  const handleUpdateStatus = async (id: string, status: string) => {
    setConfirming(id);
    try {
      const bookingRef = doc(db, 'bookings', id);
      await updateDoc(bookingRef, { status });
      console.log(`Successfully updated booking ${id} to ${status}`);
    } catch (err) {
      console.error("Error updating booking status:", err);
      alert("Failed to update status. Please check your permissions.");
    } finally {
      setConfirming(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteDoc(doc(db, 'bookings', id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const generatePDF = async (booking: any) => {
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
      pdf.save(`Ticket-${booking.qrCode}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  const filtered = bookings.filter(b => {
    const matchesSearch = b.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         b.userPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         b.qrCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    
    // Date filtering: Hide previous days if not showAll
    let matchesDate = true;
    if (!showAll) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const bookingDate = new Date(b.visitDate);
      bookingDate.setHours(0, 0, 0, 0);
      matchesDate = bookingDate >= today;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <h1 className="text-3xl font-black">MANAGE BOOKINGS</h1>
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <button 
              onClick={() => setShowAll(!showAll)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg",
                showAll ? "bg-slate-800 text-white" : "bg-white text-slate-900 border border-slate-200"
              )}
            >
              <Filter size={20} />
              {showAll ? "Showing All" : "Showing Today+"}
            </button>
            <button 
              onClick={() => setIsScanning(!isScanning)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg",
                isScanning ? "bg-red-500 text-white shadow-red-200" : "bg-blue-600 text-white shadow-blue-200"
              )}
            >
              {isScanning ? <><X size={18} /> Close Scanner</> : <><Scan size={18} /> Scan Ticket</>}
            </button>
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name, phone, or QR..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-80 outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-6 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-600"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {isScanning && (
          <div className="mb-12 bg-white p-8 rounded-[3rem] shadow-xl border-4 border-blue-500 max-w-md mx-auto overflow-hidden">
            <div id="reader" className="w-full"></div>
            <p className="text-center mt-4 text-slate-500 font-bold">Point camera at ticket QR code</p>
          </div>
        )}

        {/* Scan Result Modal */}
        {scanModal.show && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[3rem] p-8 md:p-12 max-w-lg w-full text-center shadow-2xl relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className={cn(
                "absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20",
                scanModal.type === 'success' ? "bg-green-500" : scanModal.type === 'warning' ? "bg-orange-500" : "bg-red-500"
              )} />
              
              <div className="relative z-10">
                <div className={cn(
                  "w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-8 shadow-lg",
                  scanModal.type === 'success' ? "bg-green-100 text-green-600" : 
                  scanModal.type === 'warning' ? "bg-orange-100 text-orange-600" : 
                  "bg-red-100 text-red-600"
                )}>
                  {scanModal.type === 'success' ? <CheckCircle size={48} /> : 
                   scanModal.type === 'warning' ? <AlertCircle size={48} /> : 
                   <XCircle size={48} />}
                </div>

                <h2 className={cn(
                  "text-4xl font-black mb-4 uppercase tracking-tighter",
                  scanModal.type === 'success' ? "text-green-600" : 
                  scanModal.type === 'warning' ? "text-orange-600" : 
                  "text-red-600"
                )}>
                  {scanModal.title}
                </h2>

                <p className="text-slate-600 text-lg mb-8 font-medium leading-relaxed">
                  {scanModal.message}
                </p>

                {scanModal.booking && (
                  <div className="bg-slate-50 rounded-3xl p-6 mb-8 text-left border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Guest Details</span>
                      <span className="text-[10px] font-mono text-blue-500 font-bold uppercase">{scanModal.booking.qrCode}</span>
                    </div>
                    <p className="text-xl font-black text-slate-900 mb-1">{scanModal.booking.userName}</p>
                    <p className="text-slate-500 font-medium mb-4">{scanModal.booking.userPhone}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Adults</p>
                        <p className="text-lg font-black text-blue-600">{scanModal.booking.adults}</p>
                      </div>
                      <div className="bg-white p-3 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Kids</p>
                        <p className="text-lg font-black text-orange-600">{scanModal.booking.kids}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => setScanModal({ ...scanModal, show: false })}
                  className={cn(
                    "w-full py-5 rounded-2xl text-white font-black text-xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
                    scanModal.type === 'success' ? "bg-green-600 shadow-green-200" : 
                    scanModal.type === 'warning' ? "bg-orange-600 shadow-orange-200" : 
                    "bg-red-600 shadow-red-200"
                  )}
                >
                  DISMISS
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
              >
                <X size={24} />
              </button>
              <div className="p-2">
                <img src={selectedImage} alt="Payment Proof" className="w-full h-auto max-h-[80vh] object-contain rounded-2xl" />
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <p className="font-bold text-slate-900">Payment Proof Screenshot</p>
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <th className="px-8 py-4">Customer</th>
                  <th className="px-8 py-4">Visit Date</th>
                  <th className="px-8 py-4">Tickets</th>
                  <th className="px-8 py-4">Payment</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Used</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-bold">{b.userName || 'Guest'}</div>
                      <div className="text-xs text-slate-400">{b.userPhone}</div>
                      <div className="text-[10px] font-mono text-blue-500 mt-1 uppercase">{b.qrCode}</div>
                    </td>
                    <td className="px-8 py-6 font-medium text-slate-600">
                      {format(new Date(b.visitDate), 'PP')}
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold">{b.adults + b.kids}</span>
                      <span className="text-xs text-slate-400 ml-1">({b.adults}A, {b.kids}K)</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-black text-blue-600">₹{b.totalPrice}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">{b.paymentId}</span>
                        {b.paymentProof && (
                          <button 
                            onClick={() => setSelectedImage(b.paymentProof)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="View Payment Proof"
                          >
                            <ImageIcon size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                        b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {b.used ? (
                        <div className="flex flex-col">
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded-full w-fit">Used</span>
                          <span className="text-[10px] text-slate-400 mt-1">{format(new Date(b.usedAt), 'HH:mm')}</span>
                        </div>
                      ) : (
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded-full">Not Used</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {b.status !== 'confirmed' && (
                          <button 
                            onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                            disabled={confirming === b.id}
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              confirming === b.id ? "text-slate-400" : "text-green-600 hover:bg-green-50"
                            )}
                            title={confirming === b.id ? "Confirming..." : "Confirm"}
                          >
                            {confirming === b.id ? (
                              <div className="w-[18px] h-[18px] border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CheckCircle size={18} />
                            )}
                          </button>
                        )}
                        {b.status === 'confirmed' && (
                          <button 
                            onClick={() => generatePDF(b)}
                            disabled={downloading === b.id}
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              downloading === b.id ? "text-slate-400" : "text-blue-600 hover:bg-blue-50"
                            )}
                            title={downloading === b.id ? "Generating..." : "Download PDF"}
                          >
                            {downloading === b.id ? (
                              <div className="w-[18px] h-[18px] border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Download size={18} />
                            )}
                          </button>
                        )}
                        {b.status !== 'cancelled' && (
                          <button 
                            onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(b.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Hidden Ticket Template for PDF Generation */}
                      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                        <div id={`ticket-${b.id}`} style={{ width: '800px', backgroundColor: '#ffffff', padding: '48px', border: '8px solid #2563eb', fontFamily: 'sans-serif' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                            <div>
                              <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#2563eb', marginBottom: '8px' }}>HINDUSTAN WATERPARK</h1>
                              <p style={{ color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Official Entry Ticket</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Ticket ID</p>
                              <p style={{ fontSize: '20px', fontFamily: 'monospace', fontWeight: '900' }}>{b.qrCode}</p>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '48px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                              <div>
                                <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Customer</p>
                                <p style={{ fontSize: '24px', fontWeight: '900' }}>{b.userName}</p>
                                <p style={{ color: '#64748b' }}>{b.userPhone}</p>
                              </div>
                              <div>
                                <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Visit Date</p>
                                <p style={{ fontSize: '24px', fontWeight: '900' }}>{format(new Date(b.visitDate), 'PPPP')}</p>
                              </div>
                            </div>
                            <div style={{ backgroundColor: '#f8fafc', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <QRCodeSVG value={b.qrCode} size={150} />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '48px' }}>
                            <div style={{ padding: '24px', backgroundColor: '#eff6ff', borderRadius: '16px', border: '1px solid #dbeafe' }}>
                              <p style={{ color: '#60a5fa', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Adults</p>
                              <p style={{ fontSize: '30px', fontWeight: '900', color: '#2563eb' }}>{b.adults}</p>
                            </div>
                            <div style={{ padding: '24px', backgroundColor: '#fff7ed', borderRadius: '16px', border: '1px solid #ffedd5' }}>
                              <p style={{ color: '#fb923c', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Kids</p>
                              <p style={{ fontSize: '30px', fontWeight: '900', color: '#ea580c' }}>{b.kids}</p>
                            </div>
                            <div style={{ padding: '24px', backgroundColor: '#f0fdf4', borderRadius: '16px', border: '1px solid #dcfce7' }}>
                              <p style={{ color: '#4ade80', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Total Paid</p>
                              <p style={{ fontSize: '30px', fontWeight: '900', color: '#16a34a' }}>₹{b.totalPrice}</p>
                            </div>
                          </div>

                          <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '32px' }}>
                            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Terms & Conditions</p>
                            <ul style={{ fontSize: '10px', color: '#94a3b8', listStyleType: 'disc', listStylePosition: 'inside', padding: 0 }}>
                              <li style={{ marginBottom: '4px' }}>This ticket is valid only for the specified date of visit.</li>
                              <li style={{ marginBottom: '4px' }}>Please carry a valid ID proof along with this ticket.</li>
                              <li style={{ marginBottom: '4px' }}>Tickets are non-refundable and non-transferable.</li>
                              <li style={{ marginBottom: '4px' }}>Park rules and safety guidelines must be followed at all times.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-slate-400 italic">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {filtered.map((b) => (
              <div key={b.id} className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-lg">{b.userName || 'Guest'}</div>
                    <div className="text-xs text-slate-400">{b.userPhone}</div>
                    <div className="text-[10px] font-mono text-blue-500 mt-1 uppercase">{b.qrCode}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                    b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {b.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Visit Date</p>
                    <p className="text-sm font-bold">{format(new Date(b.visitDate), 'PP')}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Tickets</p>
                    <p className="text-sm font-bold">{b.adults}A, {b.kids}K</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Payment</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-blue-600">₹{b.totalPrice}</p>
                      {b.paymentProof && (
                        <button onClick={() => setSelectedImage(b.paymentProof)} className="text-blue-500">
                          <ImageIcon size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Used Status</p>
                    {b.used ? (
                      <p className="text-[10px] font-bold text-red-600 uppercase">Used at {format(new Date(b.usedAt), 'HH:mm')}</p>
                    ) : (
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Not Used</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {b.status !== 'confirmed' && (
                    <button 
                      onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                      disabled={confirming === b.id}
                      className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    >
                      {confirming === b.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <><CheckCircle size={18} /> Confirm</>
                      )}
                    </button>
                  )}
                  {b.status === 'confirmed' && (
                    <button 
                      onClick={() => generatePDF(b)}
                      disabled={downloading === b.id}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    >
                      {downloading === b.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <><Download size={18} /> PDF</>
                      )}
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(b.id)}
                    className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} /> Delete
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-12 text-center text-slate-400 italic">
                No bookings found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
