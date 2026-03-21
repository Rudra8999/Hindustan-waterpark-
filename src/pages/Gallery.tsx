import React from 'react';
import { motion } from 'motion/react';
import { Play, Image as ImageIcon, Maximize2 } from 'lucide-react';

export default function Gallery() {
  const images = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    url: `https://picsum.photos/seed/gallery-${i}/800/800`,
    type: i % 4 === 0 ? 'video' : 'image',
    title: `Park Moment ${i + 1}`
  }));

  const [selected, setSelected] = React.useState<null | number>(null);

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black mb-6">PARK GALLERY</h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            A glimpse into the fun, laughter, and splashes at Hindustan Waterpark.
          </p>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative group cursor-pointer overflow-hidden rounded-3xl"
              onClick={() => setSelected(item.id)}
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-auto transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {item.type === 'video' ? (
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600">
                    <Play fill="currentColor" size={24} />
                  </div>
                ) : (
                  <Maximize2 className="text-white" size={32} />
                )}
              </div>
              {item.type === 'video' && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-bold uppercase px-2 py-1 rounded">
                  Video
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox (Mock) */}
      {selected !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div className="relative max-w-5xl w-full">
            <img 
              src={images[selected].url} 
              className="w-full h-auto rounded-xl shadow-2xl" 
              alt="Preview"
              referrerPolicy="no-referrer"
            />
            <button 
              className="absolute -top-12 right-0 text-white hover:text-blue-400 transition-colors"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
