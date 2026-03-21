import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Link } from 'react-router-dom';
import { Waves, ShieldCheck, Utensils, Ticket, ArrowRight, Star, CalendarDays, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import CountdownTimer from '../components/CountdownTimer';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const statsY = useTransform(scrollYProgress, [0.1, 0.3], [100, 0]);
  const statsOpacity = useTransform(scrollYProgress, [0.1, 0.2], [0, 1]);

  const attractions = [
    { name: 'Giant Wave Pool', icon: Waves, color: 'bg-blue-500' },
    { name: 'Tornado Slide', icon: Zap, color: 'bg-orange-500' },
    { name: 'Kids Splash Zone', icon: Star, color: 'bg-yellow-500' },
    { name: 'Lazy River', icon: Waves, color: 'bg-cyan-500' },
  ];

  return (
    <div ref={containerRef} className="overflow-hidden bg-white">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center bg-blue-600 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, 0],
              x: [0, 50, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -15, 0],
              x: [0, -40, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -right-20 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          />
        </div>

        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-4 text-center text-white"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/20 backdrop-blur-md text-sm font-semibold tracking-wide uppercase">
              Jafrabad's #1 Destination
            </span>
            <h1 className="text-5xl md:text-8xl font-black mb-6 leading-tight">
              SPLASH INTO <br />
              <span className="text-cyan-300">PURE FUN!</span>
            </h1>
            <p className="text-lg md:text-xl mb-10 text-blue-100 max-w-2xl mx-auto">
              Experience the thrill of India's most vibrant waterpark. 
              Family-friendly rides, delicious snacks, and memories that last a lifetime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/booking"
                className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-blue-50 transition-all shadow-2xl flex items-center justify-center gap-2"
              >
                Book Tickets <Ticket size={20} />
              </Link>
              <Link
                to="/attractions"
                className="bg-blue-500/30 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                Explore Rides <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Wave Overlay */}
        <div className="absolute bottom-0 left-0 w-full leading-[0]">
          <svg className="relative block w-full h-24" viewBox="0 24 150 28" preserveAspectRatio="none">
            <defs>
              <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
            </defs>
            <g className="parallax">
              <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
              <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
              <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
              <use xlinkHref="#gentle-wave" x="48" y="7" fill="#fff" />
            </g>
          </svg>
        </div>
      </section>

      {/* Quick Stats / Features */}
      <motion.section 
        style={{ y: statsY, opacity: statsOpacity }}
        className="py-20 bg-white relative z-20"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl bg-blue-50 border border-blue-100 text-center"
            >
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-blue-200">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Safety First</h3>
              <p className="text-slate-600">Certified lifeguards and international safety standards for all rides.</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl bg-orange-50 border border-orange-100 text-center"
            >
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-orange-200">
                <Utensils size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Delicious Food</h3>
              <p className="text-slate-600">Wide variety of snacks and meals to keep your energy high all day.</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl bg-green-50 border border-green-100 text-center"
            >
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-green-200">
                <Ticket size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Best Experience</h3>
              <p className="text-slate-600">Unforgettable memories with friends and family. No hidden charges, just pure enjoyment.</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Countdown Section */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 text-orange-600 mb-4">
                <CalendarDays size={24} />
                <span className="font-bold uppercase tracking-widest text-sm">Upcoming Event</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-6">SUMMER SPLASH <br />FESTIVAL 2026</h2>
              <p className="text-lg text-slate-600 mb-8 max-w-lg">
                Get ready for the biggest water festival of the year! Live music, 
                special water games, and exclusive food stalls. Don't miss out!
              </p>
              <Link to="/booking" className="text-blue-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
                Pre-book Tickets <ArrowRight size={20} />
              </Link>
            </div>
            <div className="relative">
              <CountdownTimer 
                targetDate="2026-05-01T00:00:00" 
                title="Hurry! Festival Starts In:" 
              />
              {/* Decorative background element */}
              <div className="absolute -z-10 -top-10 -right-10 w-full h-full bg-blue-100 rounded-[3rem] rotate-3" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Attractions Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-black mb-4">OUR TOP ATTRACTIONS</h2>
              <p className="text-slate-600 max-w-xl">From high-speed thrills to relaxing pools, we have something for everyone in the family.</p>
            </div>
            <Link to="/attractions" className="text-blue-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
              View All Rides <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {attractions.map((attr, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative h-80 rounded-3xl overflow-hidden shadow-xl"
              >
                <img
                  src={`https://picsum.photos/seed/waterpark-${idx}/600/800`}
                  alt={attr.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", attr.color)}>
                    <attr.icon size={20} />
                  </div>
                  <h4 className="text-xl font-bold">{attr.name}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black mb-8">READY FOR A SPLASH?</h2>
              <p className="text-xl mb-12 text-blue-100 max-w-2xl mx-auto">
                Don't wait in lines! Book your tickets online and get instant confirmation. 
                Jafrabad's best waterpark is waiting for you.
              </p>
              <Link
                to="/booking"
                className="inline-block bg-white text-blue-600 px-12 py-5 rounded-full text-xl font-black hover:scale-105 transition-transform shadow-2xl"
              >
                BOOK TICKETS NOW
              </Link>
            </div>
            
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
          </div>
        </div>
      </section>
    </div>
  );
}
