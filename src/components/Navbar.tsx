import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { Waves, Menu, X, User, LogOut, LayoutDashboard, Ticket, CalendarDays, Settings as SettingsIcon, Zap, Image as ImageIcon } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { cn } from '../lib/utils';

export default function Navbar() {
  const { user, userRole } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Attractions', path: '/attractions' },
    { name: 'Events', path: '/events' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  if (user) {
    navLinks.push({ name: 'Dashboard', path: '/dashboard' });
  }

  if (userRole === 'admin') {
    navLinks.push({ name: 'Admin', path: '/admin' });
  }

  const handleLogout = async () => {
    await signOut(auth);
  };

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Bookings', path: '/admin/bookings', icon: Ticket },
    { name: 'Attractions', path: '/admin/attractions', icon: Waves },
    { name: 'Events', path: '/admin/events', icon: CalendarDays },
    { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 15 }}
              className="bg-blue-500 p-2 rounded-xl text-white"
            >
              <Waves size={24} />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Hindustan Waterpark
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-blue-600",
                  location.pathname === link.path ? "text-blue-600" : "text-slate-600"
                )}
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/booking"
                  className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Book Now
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-600"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-blue-50 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 text-base font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-blue-50 mt-4">
                {user ? (
                  <>
                    {userRole === 'admin' && (
                      <div className="pt-4 border-t border-blue-50 mt-4">
                        <p className="px-3 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Panel</p>
                        <div className="space-y-1">
                          {adminLinks.map((link) => (
                            <Link
                              key={link.path}
                              to={link.path}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "block px-3 py-2 text-sm font-bold rounded-xl transition-all",
                                location.pathname === link.path ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                              )}
                            >
                              {link.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="pt-4 border-t border-blue-50 mt-4">
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="block w-full px-3 py-3 text-base font-medium text-red-600"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center bg-blue-600 text-white py-3 rounded-xl font-semibold"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
