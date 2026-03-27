"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface TransparencyRingProps {
  score: number;
  explanation: string;
}

export default function TransparencyRing({ score, explanation }: TransparencyRingProps) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = score;
    const duration = 1500;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [score]);

  const scoreColor = score >= 80 ? '#16a34a' : score >= 60 ? '#facc15' : '#ef4444';
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * score) / 100;

  return (
    <div className="flex flex-col md:flex-row items-center gap-10 card p-10 border-[#16a34a]/10 bg-gradient-to-br from-[#161b22] to-black/40 shadow-2xl overflow-hidden relative group">
      <div className="absolute inset-0 bg-[#16a34a]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[80px]" />
      
      <div className="relative w-44 h-44 shrink-0">
        <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(22,163,74,0.1)]">
          <circle
            cx="88" cy="88" r={radius}
            stroke="#21262d" strokeWidth="12"
            fill="transparent"
          />
          <motion.circle
            cx="88" cy="88" r={radius}
            stroke={scoreColor} strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            className="animate-ring shadow-lg"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-extrabold text-white tracking-tighter">{count}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-1">Trust Score</span>
        </div>
      </div>

      <div className="flex-1 space-y-4 relative z-10 text-center md:text-left">
        <h3 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-3 text-white">
          <ShieldCheck className="text-[#16a34a]" size={28} /> AI Verification Index
        </h3>
        <p className="text-gray-400 italic text-lg opacity-90 leading-relaxed font-medium">
          "{explanation || "Generating deep transparency analysis based on recent field evidence..."}"
        </p>
        <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
          {["Documents Verified", "Field Audit Clear", "Real-time Proofs"].map((tag, i) => (
            <span key={i} className="px-3 py-1 bg-[#16a34a]/10 border border-[#16a34a]/30 rounded-lg text-[10px] font-bold text-[#16a34a] uppercase tracking-widest">
              {tag} ✓
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
