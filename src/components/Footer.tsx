import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Waves, Facebook, Instagram, Twitter, Phone, Mail, MapPin, Youtube } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Footer() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    });
    return () => unsub();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 overflow-hidden">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <motion.div variants={itemVariants} className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-white group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Waves size={28} className="text-blue-400" />
              </motion.div>
              <span className="text-xl font-bold group-hover:text-blue-400 transition-colors">Hindustan Waterpark</span>
            </Link>
            <p className="text-sm leading-relaxed opacity-70">
              Experience the ultimate splash of fun at Jafrabad's premier water destination. 
              Family-friendly rides, safe zones, and unforgettable memories.
            </p>
            <div className="flex gap-4">
              {settings?.socialLinks?.facebook && (
                <motion.a 
                  whileHover={{ scale: 1.2, y: -5 }}
                  href={settings.socialLinks.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-blue-400 transition-colors"
                >
                  <Facebook size={20} />
                </motion.a>
              )}
              {settings?.socialLinks?.instagram && (
                <motion.a 
                  whileHover={{ scale: 1.2, y: -5 }}
                  href={settings.socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-pink-400 transition-colors"
                >
                  <Instagram size={20} />
                </motion.a>
              )}
              {settings?.socialLinks?.youtube && (
                <motion.a 
                  whileHover={{ scale: 1.2, y: -5 }}
                  href={settings.socialLinks.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-red-500 transition-colors"
                >
                  <Youtube size={20} />
                </motion.a>
              )}
              {settings?.socialLinks?.twitter && (
                <motion.a 
                  whileHover={{ scale: 1.2, y: -5 }}
                  href={settings.socialLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-blue-300 transition-colors"
                >
                  <Twitter size={20} />
                </motion.a>
              )}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-widest text-xs">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/attractions" className="hover:text-blue-400 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" /> Attractions</Link></li>
              <li><Link to="/gallery" className="hover:text-blue-400 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" /> Gallery</Link></li>
              <li><Link to="/booking" className="hover:text-blue-400 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" /> Book Tickets</Link></li>
              <li><Link to="/about" className="hover:text-blue-400 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" /> About Us</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" /> Contact</Link></li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-widest text-xs">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3 group">
                <MapPin size={18} className="text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-white transition-colors">Jafrabad, Jalna, Maharashtra, India</span>
              </li>
              <li className="flex gap-3 group">
                <Phone size={18} className="text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-white transition-colors">{settings?.contactPhone || '+91 98765 43210'}</span>
              </li>
              <li className="flex gap-3 group">
                <Mail size={18} className="text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-white transition-colors">info@hindustanwaterpark.com</span>
              </li>
            </ul>
          </motion.div>

          {/* Opening Hours */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-widest text-xs">Opening Hours</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between border-b border-slate-800 pb-2">
                <span className="opacity-70">Mon - Fri</span>
                <span className="text-white font-bold">10:00 AM - 6:00 PM</span>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-2">
                <span className="opacity-70">Sat - Sun</span>
                <span className="text-white font-bold">9:30 AM - 7:00 PM</span>
              </li>
              <li className="pt-4 text-[10px] text-slate-500 italic uppercase tracking-wider">
                *Hours may vary on public holidays
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div 
          variants={itemVariants}
          className="pt-8 border-t border-slate-800 text-center text-[10px] text-slate-500 uppercase tracking-[0.2em]"
        >
          <p>© {new Date().getFullYear()} Hindustan Waterpark. All rights reserved.</p>
          <p className="mt-2 opacity-50">Designed for family fun and safety.</p>
        </motion.div>
      </motion.div>
    </footer>
  );
}
