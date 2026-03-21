import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Plus, Trash2, Edit2, Waves, Image as ImageIcon, Upload } from 'lucide-react';
import FileUploader from '../../components/FileUploader';

export default function AdminAttractions() {
  const [attractions, setAttractions] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    category: 'family'
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'attractions'), (snapshot) => {
      setAttractions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      alert("Please upload an image for the attraction.");
      return;
    }
    try {
      await addDoc(collection(db, 'attractions'), formData);
      setFormData({ name: '', description: '', imageUrl: '', category: 'family' });
      setIsAdding(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this attraction?')) {
      await deleteDoc(doc(db, 'attractions', id));
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-black">MANAGE ATTRACTIONS</h1>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            {isAdding ? 'Cancel' : <><Plus size={20} /> Add Attraction</>}
          </button>
        </div>

        {isAdding && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-blue-100 mb-12 max-w-2xl">
            <h3 className="text-xl font-black mb-6">NEW ATTRACTION</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="thrill">Thrill Ride</option>
                    <option value="family">Family Fun</option>
                    <option value="kids">Kids Zone</option>
                  </select>
                </div>
              </div>
              <FileUploader 
                label="Attraction Image"
                onUpload={(base64) => setFormData({...formData, imageUrl: base64})}
                className="mb-6"
              />
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 resize-none"
                ></textarea>
              </div>
              <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all">
                SAVE ATTRACTION
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {attractions.map((attr) => (
            <div key={attr.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 group">
              <div className="relative h-48">
                <img src={attr.imageUrl} alt={attr.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => handleDelete(attr.id)}
                    className="p-2 bg-white/90 backdrop-blur text-red-600 rounded-xl shadow-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-600">
                  {attr.category}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{attr.name}</h3>
                <p className="text-slate-500 text-sm line-clamp-2">{attr.description}</p>
              </div>
            </div>
          ))}
          {attractions.length === 0 && !isAdding && (
            <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <Waves size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-medium">No attractions added yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
