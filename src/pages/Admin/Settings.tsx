import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { Settings as SettingsIcon, Save, Info, AlertCircle, QrCode } from 'lucide-react';
import { motion } from 'motion/react';
import FileUploader from '../../components/FileUploader';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    ticketPrice: 249,
    parkStatus: 'open',
    contactPhone: '+91 98765 43210',
    whatsappNumber: '+91 98765 43210',
    socialLinks: {
      facebook: '',
      instagram: '',
      youtube: '',
      twitter: ''
    },
    qrPaymentImage: ''
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as any);
      }
    });
    return () => unsub();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-black mb-12 flex items-center gap-3">
          <SettingsIcon className="text-slate-600" /> GLOBAL SETTINGS
        </h1>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <form onSubmit={handleSave} className="space-y-12">
              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Info size={20} className="text-blue-500" /> GENERAL INFO
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ticket Price (₹)</label>
                    <input 
                      type="number" 
                      value={settings.ticketPrice}
                      onChange={(e) => setSettings({...settings, ticketPrice: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-xl outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Park Status</label>
                    <select 
                      value={settings.parkStatus}
                      onChange={(e) => setSettings({...settings, parkStatus: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-xl outline-none focus:border-blue-500"
                    >
                      <option value="open">Open for Visitors</option>
                      <option value="closed">Closed / Maintenance</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Info size={20} className="text-blue-500" /> CONTACT DETAILS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Phone</label>
                    <input 
                      type="text" 
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-medium outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">WhatsApp Number</label>
                    <input 
                      type="text" 
                      value={settings.whatsappNumber}
                      onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-medium outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <SettingsIcon size={20} className="text-blue-500" /> SOCIAL LINKS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Facebook URL</label>
                    <input 
                      type="text" 
                      value={settings.socialLinks?.facebook || ''}
                      onChange={(e) => setSettings({...settings, socialLinks: {...(settings.socialLinks || {}), facebook: e.target.value}})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-medium outline-none focus:border-blue-500"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Instagram URL</label>
                    <input 
                      type="text" 
                      value={settings.socialLinks?.instagram || ''}
                      onChange={(e) => setSettings({...settings, socialLinks: {...(settings.socialLinks || {}), instagram: e.target.value}})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-medium outline-none focus:border-blue-500"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">YouTube URL</label>
                    <input 
                      type="text" 
                      value={settings.socialLinks?.youtube || ''}
                      onChange={(e) => setSettings({...settings, socialLinks: {...(settings.socialLinks || {}), youtube: e.target.value}})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-medium outline-none focus:border-blue-500"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Twitter URL</label>
                    <input 
                      type="text" 
                      value={settings.socialLinks?.twitter || ''}
                      onChange={(e) => setSettings({...settings, socialLinks: {...(settings.socialLinks || {}), twitter: e.target.value}})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-medium outline-none focus:border-blue-500"
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <QrCode size={20} className="text-blue-500" /> PAYMENT QR CODE
                </h3>
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200">
                  <p className="text-sm text-slate-500 mb-6 font-medium">
                    Upload your UPI QR code or any payment QR code. This will be shown to users 
                    during the checkout process so they can pay and upload the screenshot.
                  </p>
                  <FileUploader 
                    label="Payment QR Code"
                    onUpload={(base64) => setSettings({...settings, qrPaymentImage: base64})}
                    className="max-w-sm"
                  />
                  {settings.qrPaymentImage && (
                    <div className="mt-6 p-4 bg-white rounded-2xl border border-slate-200 inline-block">
                      <img src={settings.qrPaymentImage} alt="QR Preview" className="w-32 h-32 object-contain" />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-blue-50 rounded-3xl flex gap-4">
                <Info className="text-blue-600 shrink-0" />
                <p className="text-sm text-blue-700">
                  These settings affect the entire website. Ticket price changes will be reflected 
                  immediately in the booking system for new bookings.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  disabled={loading}
                  className="flex-grow bg-slate-900 text-white py-5 rounded-3xl text-lg font-black hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  {loading ? 'Saving...' : <><Save size={20} /> SAVE SETTINGS</>}
                </button>
                {saved && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-green-600 font-bold flex items-center gap-2"
                  >
                    <CheckCircle size={20} /> Saved!
                  </motion.div>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="mt-12 p-8 bg-red-50 rounded-[2.5rem] border border-red-100 flex gap-6 items-start">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <h4 className="font-bold text-red-900 mb-1 text-lg">Danger Zone</h4>
            <p className="text-red-700 text-sm mb-4">
              Be careful when changing the park status. Closing the park will prevent users from 
              making new bookings.
            </p>
            <button className="text-red-600 font-bold text-sm hover:underline">
              Clear All Booking History (Permanent)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircle({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
