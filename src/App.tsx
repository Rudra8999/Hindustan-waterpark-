import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Phone } from 'lucide-react';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Attractions from './pages/Attractions';
import Gallery from './pages/Gallery';
import Events from './pages/Events';
import Booking from './pages/Booking';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import UserDashboard from './pages/UserDashboard';
import Dashboard from './pages/Admin/Dashboard';
import AdminBookings from './pages/Admin/Bookings';
import AdminAttractions from './pages/Admin/Attractions';
import AdminEvents from './pages/Admin/Events';
import AdminSettings from './pages/Admin/Settings';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Auth Context
interface AuthContextType {
  user: FirebaseUser | null;
  userRole: 'admin' | 'user' | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userRole: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubRole: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      // Cleanup previous role listener if it exists
      if (unsubRole) {
        unsubRole();
        unsubRole = null;
      }

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        unsubRole = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const currentRole = data.role as 'admin' | 'user';
            
            // Auto-upgrade to admin if email matches
            if (firebaseUser.email === 'leaninkclothing@gmail.com' && currentRole !== 'admin') {
              updateDoc(userRef, { role: 'admin' }).catch(console.error);
              setUserRole('admin');
            } else {
              setUserRole(currentRole);
            }
          } else {
            const role = firebaseUser.email === 'leaninkclothing@gmail.com' ? 'admin' : 'user';
            setUserRole(role);
            setDoc(userRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'Guest User',
              photoURL: firebaseUser.photoURL,
              role: role,
              createdAt: new Date().toISOString()
            }).catch(console.error);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user role:", error);
          setUserRole('user');
          setLoading(false);
        });
      } else {
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubRole) unsubRole();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userRole, loading }}>
      <Router>
        <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900">
          <Navbar />
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/attractions" element={<Attractions />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/events" element={<Events />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                
                {/* Protected Routes */}
                <Route path="/booking" element={
                  <ProtectedRoute>
                    <Booking />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <Dashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/bookings" element={
                  <AdminRoute>
                    <AdminBookings />
                  </AdminRoute>
                } />
                <Route path="/admin/attractions" element={
                  <AdminRoute>
                    <AdminAttractions />
                  </AdminRoute>
                } />
                <Route path="/admin/events" element={
                  <AdminRoute>
                    <AdminEvents />
                  </AdminRoute>
                } />
                <Route path="/admin/settings" element={
                  <AdminRoute>
                    <AdminSettings />
                  </AdminRoute>
                } />
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
          
          {/* Floating WhatsApp Button */}
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-50 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
          >
            <Phone size={24} />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 font-bold whitespace-nowrap">
              Chat with us
            </span>
          </a>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
