"use client";

import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface TrustScoreProps {
  reverse: number;
  geotag: number;
  content: number;
  beforeAfter: number;
  overall: number;
  flags: string[];
}

export default function TrustScoreBreakdown({ reverse, geotag, content, beforeAfter, overall, flags }: TrustScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-[#16a34a] border-[#16a34a]';
    if (score >= 50) return 'text-amber-400 border-amber-400';
    return 'text-red-400 border-red-400';
  };

  const scores = [
    { label: 'Image Authenticity', value: reverse },
    { label: 'Location Match', value: geotag },
    { label: 'Activity Match', value: content },
    { label: 'Progress Shown', value: beforeAfter },
  ];

  return (
    <div className="card p-8 bg-[#161b22] border-gray-800 shadow-2xl">
      <div className="flex flex-col md:flex-row items-center gap-10 mb-10">
        <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center bg-black/40 shadow-xl ${getScoreColor(overall)}`}>
          <span className="text-4xl font-black">{overall}</span>
          <span className="text-[8px] font-black uppercase tracking-widest">Trust Score</span>
        </div>
        
        <div className="flex-grow space-y-4 w-full">
          {scores.map((s, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                <span>{s.label}</span>
                <span>{s.value}/100</span>
              </div>
              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${s.value}%` }}
                  className={`h-full ${s.value >= 70 ? 'bg-[#16a34a]' : s.value >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-gray-800">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Integrity Check</h4>
        <div className="flex flex-wrap gap-3">
          {flags.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16a34a]/10 border border-[#16a34a]/20 text-[#16a34a] text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck size={14} /> No red flags detected
            </div>
          ) : (
            flags.map((flag, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest">
                <AlertTriangle size={14} /> {flag}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
