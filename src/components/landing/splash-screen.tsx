'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2200;
    const interval = 30;
    const steps = duration / interval;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      const eased = 1 - Math.pow(1 - current / steps, 3);
      setProgress(Math.min(eased * 100, 100));

      if (current >= steps) {
        clearInterval(timer);
        setTimeout(onComplete, 400);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1b2a 40%, #1b2838 100%)',
        }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Ambient glow orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
              top: '10%',
              left: '20%',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(45,212,191,0.12) 0%, transparent 70%)',
              bottom: '15%',
              right: '15%',
            }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Logo animation */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.div
            className="w-20 h-20 rounded-2xl flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #2dd4bf 100%)',
              boxShadow: '0 0 40px rgba(16,185,129,0.3), 0 0 80px rgba(16,185,129,0.1)',
            }}
            animate={{
              boxShadow: [
                '0 0 40px rgba(16,185,129,0.3), 0 0 80px rgba(16,185,129,0.1)',
                '0 0 60px rgba(16,185,129,0.5), 0 0 120px rgba(16,185,129,0.2)',
                '0 0 40px rgba(16,185,129,0.3), 0 0 80px rgba(16,185,129,0.1)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M8 12L20 6L32 12V28L20 34L8 28V12Z" stroke="white" strokeWidth="2" fill="none" />
              <path d="M20 6V34" stroke="white" strokeWidth="1.5" opacity="0.5" />
              <path d="M8 12L32 28" stroke="white" strokeWidth="1.5" opacity="0.3" />
              <path d="M32 12L8 28" stroke="white" strokeWidth="1.5" opacity="0.3" />
              <circle cx="20" cy="20" r="4" fill="white" opacity="0.9" />
            </svg>
          </motion.div>

          {/* Rotating rings */}
          <motion.div
            className="absolute inset-[-8px] rounded-2xl border border-emerald-400/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-[-16px] rounded-2xl border border-teal-400/15"
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        {/* Organization name */}
        <motion.h1
          className="text-2xl font-bold text-white tracking-tight mb-2"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        >
          Organization
        </motion.h1>

        <motion.p
          className="text-sm text-slate-400 mb-10 tracking-widest uppercase"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
        >
          Digital Services Portal
        </motion.p>

        {/* Progress bar */}
        <motion.div
          className="w-64 h-[2px] bg-slate-700/50 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #10b981, #2dd4bf, #10b981)',
              backgroundSize: '200% 100%',
            }}
            animate={{
              width: `${progress}%`,
              backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
            }}
            transition={{
              width: { duration: 0.1 },
              backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' },
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
