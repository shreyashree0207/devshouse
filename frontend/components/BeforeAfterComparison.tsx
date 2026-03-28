"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Zap, ShieldCheck } from 'lucide-react';

interface Props {
  beforeUrl: string;
  afterUrl: string;
}

export default function BeforeAfterComparison({ beforeUrl, afterUrl }: Props) {
  const [activeTab, setActiveTab] = useState<'before' | 'after'>('after');

  return (
    <div className="card h-[400px] bg-[#161b22] border-gray-800 relative overflow-hidden flex flex-col group">
      <div className="flex-grow relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeTab}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            src={activeTab === 'before' ? beforeUrl : afterUrl}
            alt={activeTab}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        
        <div className="absolute top-6 left-6 z-10 flex gap-2">
           <div className={`px-4 py-2 rounded-xl backdrop-blur-md text-[10px] font-black uppercase tracking-widest border shadow-xl flex items-center gap-2 ${
             activeTab === 'before' 
               ? 'bg-gray-800/80 text-gray-300 border-white/10' 
               : 'bg-[#16a34a]/80 text-white border-[#16a34a]/30'
           }`}>
              {activeTab === 'before' ? <ImageIcon size={14} /> : <ShieldCheck size={14} />}
              {activeTab === 'before' ? 'BEFORE PHOTO' : 'AFTER — VERIFIED ✓'}
           </div>
        </div>
      </div>

      <div className="p-6 bg-black/40 border-t border-gray-800 flex justify-center gap-4">
        <button 
          onClick={() => setActiveTab('before')}
          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
            activeTab === 'before' 
              ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
              : 'bg-transparent text-gray-500 border-gray-800 hover:text-white hover:border-gray-600'
          }`}
        >
          Before
        </button>
        <button 
          onClick={() => setActiveTab('after')}
          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
            activeTab === 'after' 
              ? 'bg-[#16a34a] text-white border-[#16a34a] shadow-[0_0_20px_rgba(22,163,94,0.3)]' 
              : 'bg-transparent text-gray-500 border-gray-800 hover:text-white hover:border-gray-600'
          }`}
        >
          After
        </button>
      </div>
    </div>
  );
}
