'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DARPAN_MAP, MOCK_NGOS } from '../../lib/mockData';
import { Building2, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function NgoLoginPage() {

  const router = useRouter();
  const [darpanId, setDarpanId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = darpanId.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 900)); // simulate auth delay

    let ngoId = DARPAN_MAP[trimmed];
    
    if (!ngoId) {
      // Demo fallback: Try to fetch from backend or just use the ID as slug
      try {
        const res = await fetch(`${API}/gov/ngos`);
        if (res.ok) {
          const ngos = await res.json();
          const found = ngos.find((n: any) => n.darpan_id === trimmed);
          if (found) ngoId = found.id;
        }

      } catch (e) {}
    }

    if (!ngoId) {
       // if still not found, for the HACKATHON DEMO, we allow login but fallback to a default view
       ngoId = 'shiksha-foundation'; 
    }

    const ngo = MOCK_NGOS[ngoId] || { name: 'Verified NGO Cluster' };

    if (!ngo) {
      setError('NGO profile not found.');
      setLoading(false);
      return;
    }

    // Store in localStorage as session
    localStorage.setItem('sustainify_ngo_session', JSON.stringify({ ngoId, darpanId: trimmed }));
    toast.success(`Welcome back, ${ngo.name}!`);
    router.push(`/ngo-admin/${ngoId}`);
  };

  const quickFills = [
    { label: 'Shiksha Foundation', id: 'MH/2018/0187432' },
    { label: 'Annamayya Trust', id: 'TN/2017/0156789' },
    { label: 'Aarogya Health', id: 'MH/2016/0123456' },
    { label: 'Vriksh Protectors', id: 'DL/2021/0345678' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#040a04] px-4 py-20">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute left-1/4 top-1/3 w-96 h-96 bg-[#16a34a] opacity-[0.04] rounded-full blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/3 w-64 h-64 bg-emerald-500 opacity-[0.03] rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        className="relative w-full max-w-md"
      >
        <div
          className="rounded-[2.5rem] p-10 overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(22,163,74,0.15)',
            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.6)',
          }}
        >
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#16a34a] to-transparent opacity-50" />

          <div className="text-center mb-10 space-y-3">
            <div className="w-16 h-16 mx-auto bg-[#16a34a]/10 border border-[#16a34a]/20 rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-[#16a34a]" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">NGO Portal</h1>
            <p className="text-xs text-gray-500 uppercase tracking-[0.2em] font-bold">Enter your DARPAN ID to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
                DARPAN Registration ID
              </label>
              <input
                type="text"
                value={darpanId}
                onChange={e => { setDarpanId(e.target.value); setError(''); }}
                placeholder="e.g. MH/2018/0187432"
                className="w-full bg-white/[0.04] text-white font-mono text-base px-5 py-4 rounded-2xl border border-white/[0.08] outline-none focus:border-[#16a34a]/50 focus:ring-2 focus:ring-[#16a34a]/10 transition-all placeholder-gray-700"
                autoFocus
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading || !darpanId.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] text-white font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(22,163,74,0.25)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
            >
              {loading ? (
                <motion.span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
              ) : (
                <>Login to NGO Dashboard <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          {/* Quick picks for demo */}
          <div className="mt-8 pt-6 border-t border-white/[0.05]">
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] text-center mb-3">Quick demo accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {quickFills.map(q => (
                <button
                  key={q.id}
                  onClick={() => setDarpanId(q.id)}
                  className="text-[10px] font-bold text-gray-500 hover:text-[#16a34a] py-2 px-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-[#16a34a]/20 transition-all text-left truncate"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <a href="/login" className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors">
              ← Back to main login
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
