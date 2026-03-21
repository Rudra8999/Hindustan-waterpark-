import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { setupRecaptcha, signInWithPhone } from '../firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Waves, Phone, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { ConfirmationResult } from 'firebase/auth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'phone' | 'code'>('phone');

  useEffect(() => {
    // Cleanup recaptcha on unmount
    return () => {
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (recaptchaContainer) recaptchaContainer.innerHTML = '';
    };
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number with country code (e.g., +919876543210)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const appVerifier = setupRecaptcha('recaptcha-container');
      const result = await signInWithPhone(phoneNumber, appVerifier);
      setConfirmationResult(result);
      setStep('code');
    } catch (err: any) {
      console.error("Phone auth failed:", err);
      setError(err.message || 'Failed to send verification code. Please try again.');
      // Reset recaptcha
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (recaptchaContainer) recaptchaContainer.innerHTML = '';
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (confirmationResult) {
        await confirmationResult.confirm(verificationCode);
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error("Verification failed:", err);
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
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
        
        <h1 className="text-3xl font-black mb-4 uppercase tracking-tight">Hindustan Waterpark</h1>
        <p className="text-slate-500 mb-8">
          {step === 'phone' 
            ? 'Enter your mobile number to receive a verification code.' 
            : `Enter the 6-digit code sent to ${phoneNumber}`}
        </p>

        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.form
              key="phone-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSendCode}
              className="space-y-4"
            >
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
                  required
                />
              </div>
              
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
                {!loading && <ArrowRight size={20} />}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="code-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyCode}
              className="space-y-4"
            >
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium tracking-[0.5em] text-center"
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Verify & Login'}
              </button>
              
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-blue-600 text-sm font-bold hover:underline"
              >
                Change Phone Number
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div id="recaptcha-container"></div>

        <div className="mt-12 pt-8 border-t border-slate-50">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">
            Safe • Secure • Fast
          </p>
        </div>
      </motion.div>
    </div>
  );
}
