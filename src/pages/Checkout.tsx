import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../App';
import { CreditCard, ShieldCheck, ArrowLeft, CheckCircle2, IndianRupee, Upload } from 'lucide-react';
import FileUploader from '../components/FileUploader';

export default function Checkout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketPrice, setTicketPrice] = useState(249);
  const [qrPaymentImage, setQrPaymentImage] = useState('');
  const [paymentProof, setPaymentProof] = useState('');

  useEffect(() => {
    if (!bookingData) {
      navigate('/booking');
      return;
    }

    const unsub = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setTicketPrice(doc.data().ticketPrice || 249);
        setQrPaymentImage(doc.data().qrPaymentImage || '');
      }
    });
    return () => unsub();
  }, [bookingData, navigate]);

  const handlePlaceOrder = async () => {
    if (!user) return;
    if (!paymentProof) {
      alert("Please upload a screenshot of your payment proof.");
      return;
    }
    setLoading(true);

    try {
      const qrCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const booking = {
        userId: user.uid,
        userPhone: user.phoneNumber,
        userName: user.displayName,
        adults: bookingData.adults,
        kids: bookingData.kids,
        totalPrice: (bookingData.adults + bookingData.kids) * ticketPrice,
        visitDate: bookingData.visitDate,
        status: 'pending', // Admin will confirm
        paymentId: 'PAY-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        paymentProof,
        qrCode,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'bookings'), booking);
      setSuccess(true);
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-md w-full border border-green-100"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black mb-4">ORDER PLACED!</h2>
          <p className="text-slate-600 mb-8">
            Your booking request has been sent. Please wait for admin confirmation. 
            You will receive your digital ticket once confirmed.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={20} /> Back to Selection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Order Summary */}
          <div className="space-y-8">
            <h1 className="text-3xl font-black">CHECKOUT</h1>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold mb-6 uppercase tracking-widest text-slate-400">Order Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Adult Tickets ({bookingData?.adults}x)</span>
                  <span className="font-bold">₹{bookingData?.adults * ticketPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Kids Tickets ({bookingData?.kids}x)</span>
                  <span className="font-bold">₹{bookingData?.kids * ticketPrice}</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xl font-black">Total Amount</span>
                  <span className="text-2xl font-black text-blue-600">₹{(bookingData?.adults + bookingData?.kids) * ticketPrice}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-3xl flex gap-4 border border-blue-100">
              <ShieldCheck className="text-blue-600 shrink-0" />
              <p className="text-sm text-blue-700">
                Your payment is secure. We use industry-standard encryption to protect your data.
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100">
            <h3 className="text-xl font-black mb-8">PAYMENT METHOD</h3>
            <div className="space-y-6">
              <div className="p-6 border-2 border-blue-500 bg-blue-50 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                    <IndianRupee size={24} />
                  </div>
                  <div>
                    <div className="font-bold">Pay at Counter / UPI</div>
                    <div className="text-xs text-slate-500">Fast & Secure</div>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full border-4 border-blue-600 bg-white" />
              </div>

              <div className="space-y-6">
                {qrPaymentImage && (
                  <div className="p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Scan to Pay</p>
                    <div className="bg-white p-4 rounded-2xl shadow-sm inline-block mb-4">
                      <img src={qrPaymentImage} alt="Payment QR" className="w-48 h-48 object-contain" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">
                      Scan the QR code above to pay ₹{(bookingData?.adults + bookingData?.kids) * ticketPrice}
                    </p>
                  </div>
                )}

                <FileUploader 
                  label="Upload Payment Screenshot (UPI/Receipt)" 
                  onUpload={setPaymentProof} 
                  className="mb-6"
                />
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue={user?.displayName || ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mobile Number</label>
                  <input 
                    type="tel" 
                    defaultValue={user?.phoneNumber || ''}
                    readOnly
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-slate-500"
                  />
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3"
              >
                {loading ? 'Processing...' : <><CreditCard size={20} /> PLACE ORDER</>}
              </button>
              <p className="text-center text-xs text-slate-400">
                By clicking "Place Order", you agree to our terms and conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
