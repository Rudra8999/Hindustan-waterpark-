import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Plus, Trash2, Calendar, Megaphone } from 'lucide-react';

export default function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'events'), (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'events'), formData);
      setFormData({ title: '', description: '', isActive: true });
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this event?')) {
      await deleteDoc(doc(db, 'events', id));
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-black">SPECIAL EVENTS & OFFERS</h1>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
          >
            {isAdding ? 'Cancel' : <><Plus size={20} /> Add Event</>}
          </button>
        </div>

        {isAdding && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-orange-100 mb-12 max-w-2xl">
            <h3 className="text-xl font-black mb-6">NEW EVENT / OFFER</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Title</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
                  placeholder="e.g. Summer Splash 2026"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 resize-none"
                  placeholder="Details about the event or offer..."
                ></textarea>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-5 h-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="isActive" className="font-bold text-slate-700">Active and Visible</label>
              </div>
              <button className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition-all">
                PUBLISH EVENT
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.map((ev) => (
            <div key={ev.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                  <Megaphone size={24} />
                </div>
                <button 
                  onClick={() => handleDelete(ev.id)}
                  className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              <h3 className="text-2xl font-bold mb-3">{ev.title}</h3>
              <p className="text-slate-500 mb-6">{ev.description}</p>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${ev.isActive ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {ev.isActive ? 'Live Now' : 'Draft'}
                </span>
              </div>
            </div>
          ))}
          {events.length === 0 && !isAdding && (
            <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <Megaphone size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-medium">No special events or offers yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
