import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Waves, Star, ShieldCheck, Zap, Info, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Attractions() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const headerY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  const categories = [
    { id: 'thrill', name: 'Thrill Rides', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500' },
    { id: 'family', name: 'Family Fun', icon: Waves, color: 'text-blue-500', bg: 'bg-blue-500' },
    { id: 'kids', name: 'Kids Zone', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500' },
  ];

  const [attractions, setAttractions] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredRide, setHoveredRide] = useState<string | null>(null);
  const [selectedRide, setSelectedRide] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'attractions'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAttractions(data.length > 0 ? data : [
        {
          id: 'tornado',
          name: 'The Tornado',
          category: 'thrill',
          description: 'A massive funnel slide that will leave you breathless!',
          imageUrl: 'https://picsum.photos/seed/tornado/800/600',
          intensity: 'High'
        },
        {
          id: 'wave',
          name: 'Wave Paradise',
          category: 'family',
          description: 'Experience the ocean waves right here in Jafrabad.',
          imageUrl: 'https://picsum.photos/seed/wave/800/600',
          intensity: 'Medium'
        },
        {
          id: 'splash',
          name: 'Splash Kingdom',
          category: 'kids',
          description: 'A safe and colorful playground for our little guests.',
          imageUrl: 'https://picsum.photos/seed/splash/800/600',
          intensity: 'Low'
        }
      ]);
    });
    return () => unsub();
  }, []);

  const filteredAttractions = activeCategory === 'all' 
    ? attractions 
    : attractions.filter(a => a.category === activeCategory);

  return (
    <div ref={containerRef} className="bg-slate-50 min-h-screen pb-24 overflow-hidden">
      {/* Parallax Header */}
      <section className="relative h-[60vh] flex items-center justify-center bg-blue-600 overflow-hidden">
        <motion.div 
          style={{ y: headerY, opacity: headerOpacity }}
          className="relative z-10 text-center text-white px-4"
        >
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black mb-6"
          >
            OUR ATTRACTIONS
          </motion.h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg md:text-xl">
            Explore our wide range of water attractions designed for all ages and thrill levels.
          </p>
        </motion.div>
        
        {/* Animated bubbles */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, -1000],
              opacity: [0, 1, 0],
              x: [0, Math.sin(i) * 50]
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute bottom-0 bg-white/10 rounded-full blur-sm"
            style={{
              width: 20 + Math.random() * 60,
              height: 20 + Math.random() * 60,
              left: `${Math.random() * 100}%`
            }}
          />
        ))}
      </section>

      {/* Interactive Ride Selector */}
      <section className="max-w-7xl mx-auto px-4 -mt-20 relative z-20 mb-20">
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border border-blue-100">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                <Star className="text-yellow-500" /> QUICK RIDE SELECTOR
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {attractions.map((ride) => (
                  <motion.button
                    key={ride.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={() => setHoveredRide(ride.id)}
                    onMouseLeave={() => setHoveredRide(null)}
                    onClick={() => setSelectedRide(ride)}
                    className={cn(
                      "aspect-square rounded-2xl flex items-center justify-center transition-all overflow-hidden relative group",
                      hoveredRide === ride.id || selectedRide?.id === ride.id 
                        ? "ring-4 ring-blue-500 ring-offset-4" 
                        : "bg-slate-100"
                    )}
                  >
                    <img 
                      src={ride.imageUrl || ride.image} 
                      alt={ride.name} 
                      className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-opacity"
                      referrerPolicy="no-referrer"
                    />
                    <div className="relative z-10 bg-white/80 backdrop-blur-sm p-3 rounded-xl">
                      {(() => {
                        const cat = categories.find(c => c.id === ride.category);
                        if (!cat) return null;
                        const Icon = cat.icon;
                        return <Icon size={32} className={cat.color} />;
                      })()}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="w-full md:w-1/2 min-h-[300px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {selectedRide || hoveredRide ? (
                  <motion.div
                    key={selectedRide?.id || hoveredRide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full bg-slate-50 rounded-[2rem] p-8 border border-slate-200 relative overflow-hidden group"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white",
                          categories.find(c => c.id === (selectedRide?.category || attractions.find(r => r.id === hoveredRide)?.category))?.bg
                        )}>
                          {selectedRide?.category || attractions.find(r => r.id === hoveredRide)?.category}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase">
                          {selectedRide?.intensity || attractions.find(r => r.id === hoveredRide)?.intensity} Intensity
                        </span>
                      </div>
                      <h3 className="text-3xl font-black mb-4 uppercase">
                        {selectedRide?.name || attractions.find(r => r.id === hoveredRide)?.name}
                      </h3>
                      <p className="text-slate-600 mb-8 leading-relaxed">
                        {selectedRide?.description || attractions.find(r => r.id === hoveredRide)?.description}
                      </p>
                      <button className="flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all">
                        View Full Details <ArrowRight size={18} />
                      </button>
                    </div>
                    
                    {/* Background Preview (Video or Image) */}
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                      <Zap size={200} className="text-slate-200 absolute -right-10 -bottom-10 rotate-12" />
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center text-slate-400">
                    <Info size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-medium">Hover or click a ride icon to see a preview</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              "px-8 py-3 rounded-full font-bold transition-all",
              activeCategory === 'all' ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-600 hover:bg-blue-50"
            )}
          >
            All Rides
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2",
                activeCategory === cat.id ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-600 hover:bg-blue-50"
              )}
            >
              <cat.icon size={18} className={activeCategory === cat.id ? "text-white" : cat.color} />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAttractions.map((attr, idx) => (
            <motion.div
              layout
              key={attr.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-shadow border border-slate-100"
            >
              <div className="relative aspect-square">
                <img 
                  src={attr.imageUrl || attr.image} 
                  alt={attr.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-900">
                  {attr.intensity || 'Medium'} Intensity
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  {(() => {
                    const cat = categories.find(c => c.id === attr.category);
                    if (!cat) return null;
                    const Icon = cat.icon;
                    return <Icon size={16} className={cat.color} />;
                  })()}
                  <span className="text-xs font-bold uppercase text-slate-400 tracking-widest">
                    {categories.find(c => c.id === attr.category)?.name}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-3">{attr.name}</h3>
                <p className="text-slate-600 leading-relaxed">{attr.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
