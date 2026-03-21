import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: string;
  title: string;
}

export default function CountdownTimer({ targetDate, title }: CountdownTimerProps) {
  const calculateTimeLeft = (): TimeLeft | null => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft: TimeLeft | null = null;

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  const timerItems = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds },
  ];

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 rounded-[2.5rem] shadow-2xl text-white text-center relative overflow-hidden">
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-6 uppercase tracking-widest">{title}</h3>
        <div className="flex justify-center gap-4 md:gap-8">
          {timerItems.map((item, idx) => (
            <div key={item.label} className="flex flex-col items-center">
              <div className="relative w-16 h-20 md:w-24 md:h-28 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-2 border border-white/30 overflow-hidden">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={item.value}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-3xl md:text-5xl font-black"
                  >
                    {item.value.toString().padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
                {/* Decorative line */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-white/10" />
              </div>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-80">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Decorative background circles */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
    </div>
  );
}
