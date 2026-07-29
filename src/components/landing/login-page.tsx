'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useAppStore } from '@/stores/app-store';
import { ParticleBackground } from './particle-background';
import { ThemeToggle } from './theme-toggle';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  User,
  Loader2,
  AlertCircle,
  Shield,
} from 'lucide-react';

// Demo credentials
const VALID_USERS = [
  { username: 'admin', password: 'admin123', name: 'System Administrator', role: 'Admin' },
  { username: 'kofi', password: 'kofi123', name: 'Kofi Mensah', role: 'Revenue Officer' },
  { username: 'ama', password: 'ama123', name: 'Ama Owusu', role: 'Revenue Officer' },
];

export function LoginPage() {
  const { resolvedTheme } = useTheme();
  const loginSuccess = useAppStore((s) => s.loginSuccess);
  const backToLanding = useAppStore((s) => s.backToLanding);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isDark = resolvedTheme === 'dark';
  const mounted = resolvedTheme !== undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      const user = VALID_USERS.find(
        (u) => u.username === username.trim() && u.password === password
      );

      if (user) {
        loginSuccess();
      } else {
        setError('Invalid username or password. Please try again.');
        setLoading(false);
      }
    }, 800);
  };

  const inputCls = (hasError: boolean) =>
    `w-full rounded-xl border ${hasError ? 'border-red-400 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200`;

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 -z-10 transition-colors duration-700"
        style={{
          background: isDark
            ? 'linear-gradient(160deg, #0b1120 0%, #0f172a 35%, #0c1524 65%, #0a0f1c 100%)'
            : 'linear-gradient(160deg, #f0fdf9 0%, #f8fafc 35%, #f1f5f9 65%, #ecfdf5 100%)',
        }}
      />

      {/* Ambient glow */
      <div
        className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none -z-10"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
        }}
      />
      <div
        className="fixed bottom-[-15%] right-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none -z-10"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(45,212,191,0.05) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(45,212,191,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Particles */}
      <div className="fixed inset-0 -z-10">
        <ParticleBackground />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 sm:px-8 relative z-10">
        <motion.button
          onClick={backToLanding}
          className="flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-2 transition-colors cursor-pointer"
          style={{
            color: isDark ? 'rgba(148,163,184,0.8)' : 'rgba(71,85,105,0.8)',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>
        <ThemeToggle />
      </header>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 relative z-10">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Logo */}
          <motion.div
            className="mx-auto mb-8 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #2dd4bf 100%)',
              boxShadow: isDark
                ? '0 8px 32px rgba(16,185,129,0.25)'
                : '0 8px 32px rgba(16,185,129,0.2)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" className="sm:w-10 sm:h-10">
              <path d="M8 12L20 6L32 12V28L20 34L8 28V12Z" stroke="white" strokeWidth="2" fill="none" />
              <path d="M20 6V34" stroke="white" strokeWidth="1.5" opacity="0.5" />
              <path d="M8 12L32 28" stroke="white" strokeWidth="1.5" opacity="0.3" />
              <path d="M32 12L8 28" stroke="white" strokeWidth="1.5" opacity="0.3" />
              <circle cx="20" cy="20" r="4" fill="white" opacity="0.9" />
            </svg>
          </motion.div>

          {/* Title */}
          <div className="text-center mb-8">
            <motion.h1
              className="text-2xl sm:text-3xl font-bold tracking-tight mb-2"
              style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Revenue Management System
            </motion.h1>
            <motion.p
              className="text-sm"
              style={{ color: isDark ? 'rgba(148,163,184,0.85)' : 'rgba(71,85,105,0.8)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Sign in to access the RMS portal
            </motion.p>
          </div>

          {/* Glass Card */}
          <motion.div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              background: isDark
                ? 'rgba(15,23,42,0.6)'
                : 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(20px)',
              border: isDark
                ? '1px solid rgba(51,65,85,0.5)'
                : '1px solid rgba(226,232,240,0.8)',
              boxShadow: isDark
                ? '0 25px 50px rgba(0,0,0,0.3)'
                : '0 25px 50px rgba(0,0,0,0.08)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>
                  Username
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: 'rgba(148,163,184,0.6)' }}
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                    placeholder="Enter your username"
                    autoComplete="username"
                    className={`${inputCls(!!error && !username)} pl-11`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: 'rgba(148,163,184,0.6)' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className={`${inputCls(!!error && !password)} pl-11 pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded cursor-pointer"
                    style={{ color: 'rgba(148,163,184,0.6)' }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
                }}
                whileHover={!loading ? { scale: 1.01, boxShadow: '0 6px 20px rgba(16,185,129,0.45)' } : {}}
                whileTap={!loading ? { scale: 0.99 } : {}}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </motion.button>
            </form>

            {/* Demo Credentials */}
            <div
              className="mt-6 pt-5"
              style={{ borderTop: isDark ? '1px solid rgba(51,65,85,0.4)' : '1px solid rgba(226,232,240,0.6)' }}
            >
              <p
                className="text-xs font-medium mb-3 flex items-center gap-1.5"
                style={{ color: isDark ? 'rgba(148,163,184,0.7)' : 'rgba(100,116,139,0.7)' }}
              >
                Demo Credentials
              </p>
              <div className="grid grid-cols-1 gap-2">
                {VALID_USERS.map((u) => (
                  <button
                    key={u.username}
                    type="button"
                    onClick={() => { setUsername(u.username); setPassword(u.password); setError(''); }}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-200 cursor-pointer"
                    style={{
                      background: isDark ? 'rgba(30,41,59,0.5)' : 'rgba(241,245,249,0.6)',
                      border: isDark ? '1px solid rgba(51,65,85,0.3)' : '1px solid rgba(226,232,240,0.5)',
                      color: isDark ? '#cbd5e1' : '#475569',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)';
                      e.currentTarget.style.background = isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = isDark ? 'rgba(51,65,85,0.3)' : 'rgba(226,232,240,0.5)';
                      e.currentTarget.style.background = isDark ? 'rgba(30,41,59,0.5)' : 'rgba(241,245,249,0.6)';
                    }}
                  >
                    <div>
                      <span className="text-sm font-semibold">{u.username}</span>
                      <span className="text-xs mx-1.5" style={{ color: 'rgba(148,163,184,0.5)' }}>/</span>
                      <span className="text-xs font-mono">{u.password}</span>
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)',
                        color: '#10b981',
                      }}
                    >
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Footer text */}
          <motion.p
            className="text-center text-xs mt-6"
            style={{ color: isDark ? 'rgba(100,116,139,0.5)' : 'rgba(100,116,139,0.4)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            Kumasi Metropolitan Assembly — Revenue Management System
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
}
