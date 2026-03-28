'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, ArrowRight, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GovLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    // Accept any Gmail or official email for demo
    localStorage.setItem('sustainify_govt_session', JSON.stringify({ email, name: email.split('@')[0] }));
    toast.success('Welcome to Government Portal');
    router.push('/gov-dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] px-4 py-20">
      {/* Blue government background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute left-1/3 top-1/4 w-[500px] h-[500px] bg-blue-900 opacity-[0.07] rounded-full blur-[150px]" />
        <div className="absolute right-1/4 bottom-1/4 w-64 h-64 bg-indigo-600 opacity-[0.05] rounded-full blur-[100px]" />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'linear-gradient(rgba(250,250,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(250,250,255,0.5) 1px,transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        className="relative w-full max-w-md"
      >
        {/* Gov emblem header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Government Portal</span>
          </div>
          <p className="text-xs text-gray-600">Tamil Nadu Social Welfare Department</p>
        </div>

        <div
          className="rounded-[2.5rem] p-10 overflow-hidden"
          style={{
            background: 'rgba(14,20,40,0.8)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(59,130,246,0.15)',
            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-blue-500/10 border-2 border-blue-500/20 rounded-2xl flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgb(96,165,250)" strokeWidth="1.5">
                <path d="M3 22h18M3 10h18M12 2 3 10h18L12 2zM7 10v12M17 10v12M12 10v12" />
              </svg>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Official Login</h1>
            <p className="text-xs text-gray-500 mt-1">Sign in with your government Google account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="officer@gmail.com"
                className="w-full bg-white/[0.04] text-white px-5 py-4 rounded-2xl border border-white/[0.08] outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all text-sm"
                autoFocus
              />
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </motion.div>
            )}

            <div className="p-4 bg-blue-500/5 border border-blue-500/15 rounded-xl text-xs text-blue-400/80 flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Any Gmail account is accepted for this demonstration. In production, only <strong>@tn.gov.in</strong> emails are authorized.</span>
            </div>

            <motion.button
              type="submit"
              disabled={loading || !email.trim()}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest disabled:opacity-40 flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(59,130,246,0.2)]"
            >
              {loading ? (
                <motion.span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
              ) : (
                <>Access Government Dashboard <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          {/* Quick demo fill */}
          <div className="mt-6 pt-5 border-t border-white/[0.05] text-center space-y-2">
            <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">Demo login</p>
            <button onClick={() => setEmail('officer@tn.gov.in')}
              className="text-[10px] text-blue-400/60 hover:text-blue-400 transition-colors font-mono">
              officer@tn.gov.in
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-700 mt-5">
          <a href="/login" className="hover:text-gray-500 transition-colors">← Back to public portal</a>
        </p>
      </motion.div>
    </div>
  );
}
