"use client";

import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, ShieldCheck, MapPin, Activity, Zap } from 'lucide-react';

interface VerificationProgressProps {
  currentStep: number;
  scores: {
    reverse: number | null;
    geotag: number | null;
    content: number | null;
    beforeAfter: number | null;
    overall: number | null;
  };
}

export default function VerificationProgress({ currentStep, scores }: VerificationProgressProps) {
  const steps = [
    { label: 'Checking image authenticity...', icon: <ShieldCheck size={18} />, value: scores.reverse },
    { label: 'Verifying GPS location...', icon: <MapPin size={18} />, value: scores.geotag },
    { label: 'Matching activity content...', icon: <Activity size={18} />, value: scores.content },
    { label: 'Comparing before & after...', icon: <Zap size={18} />, value: scores.beforeAfter },
    { label: 'Computing trust score...', icon: <CheckCircle2 size={18} />, value: scores.overall },
  ];

  return (
    <div className="card p-10 bg-[#161b22] border-[#16a34a]/30 shadow-3xl text-white">
      <h3 className="text-xl font-black font-jakarta tracking-tight mb-8 uppercase text-[#16a34a]">AI PROOF ANALYSIS</h3>
      
      <div className="space-y-6">
        {steps.map((step, i) => {
          const isActive = i === currentStep;
          const isDone = i < currentStep || (i === steps.length - 1 && scores.overall !== null);
          
          return (
            <motion.div 
               key={i}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               className={`flex items-center gap-4 transition-all duration-500 ${
                 isDone ? 'text-white' : isActive ? 'text-[#16a34a]' : 'text-gray-600'
               }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                isDone ? 'bg-[#16a34a] border-[#16a34a] text-black shadow-lg' : 
                isActive ? 'bg-[#16a34a]/10 border-[#16a34a]/40 text-[#16a34a] shadow-[0_0_15px_rgba(22,163,94,0.2)] animate-pulse' : 
                'bg-black/40 border-gray-800 text-gray-700'
              }`}>
                {isActive ? <Loader2 size={16} className="animate-spin" /> : step.icon}
              </div>
              
              <div className="flex-grow flex justify-between items-center">
                 <span className="text-sm font-bold tracking-tight">{step.label}</span>
                 {isDone && step.value !== null && (
                   <span className="text-xs font-black text-[#16a34a] bg-[#16a34a]/10 px-2 py-0.5 rounded border border-[#16a34a]/20 uppercase tracking-widest">
                     {step.value}/100
                   </span>
                 )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-10 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
         <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest leading-relaxed">
            Sustainify's Gemini 1.5 Flash is analyzing frame-level authenticity and geolocation markers...
         </p>
      </div>
    </div>
  );
}
