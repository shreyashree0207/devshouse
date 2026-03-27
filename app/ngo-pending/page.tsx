"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../../lib/supabase';
import { Clock, Search, Mail } from 'lucide-react';

export default function NgoPendingPage() {
  const [darpanId, setDarpanId] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser();
      if (user?.user_metadata?.darpan_id) setDarpanId(user.user_metadata.darpan_id);
      if (user?.email) setEmail(user.email);
    };
    init();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f0a] px-4 pt-20">
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }} className="w-full max-w-lg">
        <div className="rounded-[2rem] overflow-hidden relative" style={{
          background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(40px)',
          border: '1px solid rgba(234,179,8,0.2)', boxShadow: '0 30px 100px -20px rgba(0,0,0,0.5)',
        }}>
          <div className="p-10 space-y-8 text-center">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}
              className="w-20 h-20 mx-auto bg-yellow-500/10 border border-yellow-500/20 rounded-3xl flex items-center justify-center">
              <Clock size={40} className="text-yellow-500" />
            </motion.div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-white">Under Review</h1>
              <p className="text-gray-400 text-sm">Your NGO registration is being verified against the Darpan portal. We&apos;ll check within <strong className="text-yellow-400">24-48 hours</strong>.</p>
            </div>
            {darpanId && (
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5">
                <p className="text-[9px] text-yellow-500/60 uppercase tracking-widest font-bold mb-2">Darpan ID Submitted</p>
                <p className="text-xl font-black text-yellow-400 tracking-wider font-mono">{darpanId}</p>
              </div>
            )}
            {email && <p className="text-xs text-gray-500">Confirmation will be sent to <strong className="text-gray-400">{email}</strong></p>}
            <div className="space-y-3 text-left">
              {['Account Created', 'Darpan ID Submitted', 'Manual Verification', 'Dashboard Access'].map((s, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${i === 2 ? 'bg-yellow-500/5 border border-yellow-500/10' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i < 2 ? 'bg-[#00ff88] text-[#0a0f0a]' : i === 2 ? 'bg-yellow-500 text-[#0a0f0a] animate-pulse' : 'bg-white/5 text-gray-600'
                  }`}>{i < 2 ? '✓' : i + 1}</div>
                  <span className={`text-sm font-medium ${i < 2 ? 'text-gray-300' : i === 2 ? 'text-yellow-400' : 'text-gray-600'}`}>{s}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <Link href="/ngos" className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white font-bold hover:border-[#00ff88]/30 transition-all">
                <Search size={18} /> Browse NGOs as a Visitor
              </Link>
              <a href="mailto:support@sustainify.in" className="flex items-center justify-center gap-2 w-full py-3 text-gray-500 hover:text-[#00ff88] font-medium text-sm transition-all">
                <Mail size={16} /> Contact support
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
