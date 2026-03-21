import React from 'react';
import { Link } from 'react-router-dom';
import { Waves, Facebook, Instagram, Twitter, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-white">
              <Waves size={28} className="text-blue-400" />
              <span className="text-xl font-bold">Hindustan Waterpark</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Experience the ultimate splash of fun at Jafrabad's premier water destination. 
              Family-friendly rides, safe zones, and unforgettable memories.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-blue-400 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="hover:text-pink-400 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="hover:text-blue-300 transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/attractions" className="hover:text-white transition-colors">Attractions</Link></li>
              <li><Link to="/gallery" className="hover:text-white transition-colors">Gallery</Link></li>
              <li><Link to="/booking" className="hover:text-white transition-colors">Book Tickets</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin size={18} className="text-blue-400 shrink-0" />
                <span>Jafrabad, Jalna, Maharashtra, India</span>
              </li>
              <li className="flex gap-3">
                <Phone size={18} className="text-blue-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex gap-3">
                <Mail size={18} className="text-blue-400 shrink-0" />
                <span>info@hindustanwaterpark.com</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-white font-semibold mb-6">Opening Hours</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <span>Mon - Fri</span>
                <span className="text-white">10:00 AM - 6:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sat - Sun</span>
                <span className="text-white">9:30 AM - 7:00 PM</span>
              </li>
              <li className="pt-4 text-xs text-slate-500 italic">
                *Hours may vary on public holidays
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Hindustan Waterpark. All rights reserved.</p>
          <p className="mt-2">Designed for family fun and safety.</p>
        </div>
      </div>
    </footer>
  );
}
