"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

interface NGO {
  id: string; name: string; city?: string; district?: string; category?: string;
  goal_amount?: number; raised_amount?: number; transparency_score?: number;
  cover_image?: string; beneficiaries?: number; description?: string;
}

export default function NGOCard({ ngo, index = 0 }: { ngo: NGO; index?: number }) {
  const goal = ngo.goal_amount || 0;
  const raised = ngo.raised_amount || 0;
  const pct = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;
  const score = ngo.transparency_score || 0;
  const scoreColor = score >= 80 ? '#00ff88' : score >= 60 ? '#eab308' : '#ef4444';

  const catColors: Record<string, string> = {
    education: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    healthcare: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    environment: 'bg-green-500/10 text-green-400 border-green-500/20',
    women: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    food: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    child: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px -15px rgba(0,255,136,0.1)' }}
    >
      <Link href={`/ngos/${ngo.id}`} className="block rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm hover:border-[#00ff88]/20 transition-all">
        <div className="relative h-44 overflow-hidden">
          <img src={ngo.cover_image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format'}
            alt={ngo.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f0a] via-transparent to-transparent" />
          {/* Trust badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full backdrop-blur-md text-[10px] font-bold flex items-center gap-1"
            style={{ background: `${scoreColor}15`, color: scoreColor, border: `1px solid ${scoreColor}30` }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
            {score}
          </div>
          {/* Status badge */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full backdrop-blur-md text-[9px] font-bold flex items-center gap-1 bg-black/60 shadow-lg text-white border border-white/10">
            {score > 75 ? '🟢 Verified' : score >= 40 ? '🟡 Under Review' : '🔴 Suspended'}
          </div>
          {/* Category */}
          <div className="absolute bottom-3 left-3">
            <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${catColors[ngo.category || ''] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
              {ngo.category}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <h3 className="text-base font-extrabold text-white truncate">{ngo.name}</h3>
          <p className="text-[11px] text-gray-500 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            {ngo.city}{ngo.district ? `, ${ngo.district}` : ''}
          </p>
          
          {ngo.description && (
            <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">{ngo.description}</p>
          )}

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-500">₹{raised.toLocaleString()} raised</span>
              <span className="font-bold" style={{ color: scoreColor }}>{pct}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: index * 0.05 }}
                className="h-full rounded-full" style={{ background: scoreColor }} />
            </div>
            <div className="flex justify-between text-[10px] text-gray-600">
              <span>Goal: ₹{goal.toLocaleString()}</span>
              {ngo.beneficiaries && <span>👥 {ngo.beneficiaries.toLocaleString()} helped</span>}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
