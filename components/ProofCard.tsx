"use client";

import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, Calendar, CheckSquare, AlertTriangle } from 'lucide-react';

interface ProofCardProps {
  proof: {
    id: number;
    image?: string;
    image_url?: string;
    city?: string;
    state?: string;
    date?: string;
    created_at?: string;
    description: string;
    ai_score?: number;
    score?: number;
    ai_verdict?: string;
    tags?: string[];
    authentic?: boolean;
  };
}

export default function ProofCard({ proof }: ProofCardProps) {
  const imageUrl = proof.image || proof.image_url || 'https://via.placeholder.com/800x600';
  const displayDate = proof.date || (proof.created_at ? new Date(proof.created_at).toLocaleDateString() : 'Recent');
  const score = proof.ai_score ?? proof.score ?? 0;
  const verdict = proof.ai_verdict || 'Pending verification';
  const isAuthentic = proof.authentic ?? (score >= 70);
  const tags = proof.tags || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card flex flex-col overflow-hidden bg-gradient-to-b from-[#161b22] to-black/40 border-gray-800 hover:border-[#16a34a]/30 shadow-2xl group"
    >
      <div className="relative h-56 w-full">
        <img 
          src={imageUrl} 
          alt="Proof update" 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" 
        />
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest border border-white/10 flex items-center gap-1.5 shadow-lg">
          <Calendar size={12} className="text-[#16a34a]" /> {displayDate}
        </div>
      </div>

      <div className="p-8 space-y-6">
        {proof.city && (
          <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest">
            <MapPin size={14} className="text-[#16a34a]" /> {proof.city}, {proof.state || 'India'}
          </div>
        )}
        
        <p className="text-gray-300 text-base leading-relaxed font-medium">
          {proof.description}
        </p>
        
        {/* AI Verdict Box */}
        <div className={`mt-4 rounded-2xl p-6 border transition-all duration-500 shadow-xl ${
          isAuthentic ? 'bg-[#16a34a]/5 border-[#16a34a]/20' : 'bg-red-500/5 border-red-500/20'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${
              isAuthentic ? 'text-[#16a34a]' : 'text-red-400'
            }`}>
              {isAuthentic ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />} 
              AI VERIFICATION RESULT
            </span>
            <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2 shadow-sm ${
              isAuthentic ? 'bg-[#16a34a] text-white' : 'bg-red-500 text-white'
            }`}>
              {isAuthentic ? <CheckSquare size={12} /> : <AlertTriangle size={12} />}
              {isAuthentic ? '✓ AUTHENTIC' : '⚠ FLAGGED'}
            </div>
          </div>
          
          <div className="flex items-center gap-6 mb-4">
            <div className={`text-4xl font-extrabold tracking-tighter ${
              isAuthentic ? 'text-[#16a34a]' : 'text-red-400'
            }`}>
              {score}% <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">MATCH</span>
            </div>
            <p className="text-xs text-gray-400 italic font-medium leading-relaxed">
              &quot;{verdict}&quot;
            </p>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.map((tag: string, i: number) => (
                <span key={i} className="text-[9px] border border-gray-800 px-2.5 py-1 rounded-lg uppercase tracking-tight text-gray-400 font-bold hover:border-gray-700 transition-colors">
                  #{tag.toLowerCase()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
