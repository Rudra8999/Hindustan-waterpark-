import React from 'react';
import { motion } from 'motion/react';
import { signInWithGoogle } from '../firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Waves, LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-blue-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl text-center border border-blue-100"
      >
        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-blue-200">
          <Waves size={40} />
        </div>
        
        <h1 className="text-3xl font-black mb-4">WELCOME BACK!</h1>
        <p className="text-slate-500 mb-12">
          Login to book your tickets and view your booking history at Hindustan Waterpark.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-4 bg-white border-2 border-slate-100 py-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-blue-200 transition-all shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          Sign in with Google
        </button>

        <div className="mt-12 pt-8 border-t border-slate-50">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">
            Safe • Secure • Fast
          </p>
        </div>
      </motion.div>
    </div>
  );
}
