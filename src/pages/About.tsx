import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Heart, Users, MapPin } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative py-24 bg-blue-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl font-black mb-6 text-slate-900">OUR STORY</h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Hindustan Waterpark was born from a simple dream: to bring world-class 
              water entertainment to the heart of Jafrabad. We believe every family 
              deserves a place to laugh, play, and escape the heat.
            </p>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-100/50 skew-x-12 translate-x-1/2" />
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="rounded-3xl overflow-hidden shadow-2xl"
            >
              <img 
                src="https://picsum.photos/seed/park-about/800/600" 
                alt="Waterpark Fun" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                  <Heart className="text-red-500" /> Our Mission
                </h2>
                <p className="text-slate-600 text-lg">
                  To provide a safe, clean, and exhilarating environment where families 
                  can create lasting memories through water-based fun and adventure.
                </p>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                  <ShieldCheck className="text-green-500" /> Safety & Trust
                </h2>
                <p className="text-slate-600 text-lg">
                  Your safety is our priority. We employ trained professionals and 
                  regularly inspect all our rides to ensure they meet the highest 
                  safety standards.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="p-6 bg-blue-50 rounded-2xl">
                  <div className="text-3xl font-black text-blue-600 mb-1">10+</div>
                  <div className="text-sm text-slate-500 uppercase font-bold tracking-wider">Exciting Rides</div>
                </div>
                <div className="p-6 bg-blue-50 rounded-2xl">
                  <div className="text-3xl font-black text-blue-600 mb-1">100k+</div>
                  <div className="text-sm text-slate-500 uppercase font-bold tracking-wider">Happy Visitors</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black mb-12">LOCATED IN THE HEART OF JALNA</h2>
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-[2rem] shadow-xl flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0">
              <MapPin size={40} />
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-bold mb-2">Jafrabad, Maharashtra</h3>
              <p className="text-slate-600 text-lg">
                Conveniently located for visitors from Jalna, Aurangabad, and surrounding areas. 
                Easy access and ample parking space for a stress-free visit.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
