import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lock, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

const CORRECT_PIN = import.meta.env.VITE_ADMIN_PIN || '2025';
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

export default function AdminLockScreen({ onUnlock }) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const inputs = useRef([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (!locked) return;
    setCountdown(LOCKOUT_SECONDS);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setLocked(false);
          setAttempts(0);
          setError('');
          setDigits(['', '', '', '']);
          setTimeout(() => inputs.current[0]?.focus(), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [locked]);

  const handleDigit = (index, value) => {
    if (locked || success) return;
    const v = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = v;
    setDigits(next);
    setError('');
    if (v && index < 3) {
      inputs.current[index + 1]?.focus();
    }
    if (v && index === 3) {
      const pin = [...next.slice(0, 3), v].join('');
      setTimeout(() => checkPin(pin, next), 50);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const checkPin = (pin, currentDigits) => {
    if (pin === CORRECT_PIN) {
      setSuccess(true);
      sessionStorage.setItem('booked_admin_auth', Date.now().toString());
      setTimeout(onUnlock, 1200);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setDigits(['', '', '', '']);
      setTimeout(() => inputs.current[0]?.focus(), 100);
      if (newAttempts >= MAX_ATTEMPTS) {
        setLocked(true);
        setError('');
      } else {
        setError(`Incorrect PIN. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts !== 1 ? 's' : ''} remaining.`);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(219,39,119,0.12), transparent), linear-gradient(160deg, #0f0008, #1a0010, #0f0008)' }}
    >
      {/* Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full animate-orb" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.15), transparent 70%)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full animate-orb-delayed" style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.12), transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0], transition: { duration: 0.5 } } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card-dark rounded-3xl p-8 w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles size={16} className="text-pink-400" />
            <span className="font-cormorant text-3xl font-bold gradient-text">BOOKED</span>
            <Sparkles size={16} className="text-pink-400" />
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-pink-300/60 font-dm">Admin Portal</p>
        </div>

        {/* Status icon */}
        <div className="flex justify-center mb-6">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
                <ShieldCheck size={28} className="text-green-400" />
              </motion.div>
            ) : locked ? (
              <motion.div key="locked" initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle size={28} className="text-red-400" />
              </motion.div>
            ) : (
              <motion.div key="lock" initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-14 h-14 rounded-full bg-pink-500/20 flex items-center justify-center">
                <Lock size={28} className="text-pink-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {success ? (
          <div className="text-center">
            <p className="font-cormorant text-2xl text-white font-semibold mb-1">Welcome back</p>
            <p className="text-pink-300/60 text-sm font-dm">Redirecting...</p>
          </div>
        ) : locked ? (
          <div className="text-center">
            <p className="text-red-400 font-dm text-sm mb-2">Too many failed attempts</p>
            <p className="text-pink-300/60 text-xs font-dm">Try again in <span className="text-white font-semibold">{countdown}s</span></p>
            <div className="flex justify-center gap-1 mt-4">
              {Array(MAX_ATTEMPTS).fill(0).map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-red-500" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <p className="text-center text-pink-200/70 text-sm font-dm mb-6">Enter your 4-digit PIN</p>

            {/* PIN inputs */}
            <div className="flex gap-3 justify-center mb-4">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => inputs.current[i] = el}
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="w-14 h-14 text-center text-xl font-bold text-white rounded-2xl outline-none transition-all font-dm"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: `1.5px solid ${d ? 'rgba(236,72,153,0.6)' : 'rgba(255,150,185,0.2)'}`,
                  }}
                />
              ))}
            </div>

            {/* Show/hide toggle */}
            <button
              onClick={() => setShowPin(v => !v)}
              className="flex items-center gap-1.5 mx-auto text-pink-300/60 hover:text-pink-300 text-xs font-dm transition-colors mb-4"
            >
              {showPin ? <EyeOff size={12} /> : <Eye size={12} />}
              {showPin ? 'Hide' : 'Show'} PIN
            </button>

            {/* Error */}
            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs text-center font-dm mb-3">
                {error}
              </motion.p>
            )}

            {/* Attempt dots */}
            {attempts > 0 && (
              <div className="flex justify-center gap-1">
                {Array(MAX_ATTEMPTS).fill(0).map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i < attempts ? 'bg-red-500' : 'bg-white/20'}`} />
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}