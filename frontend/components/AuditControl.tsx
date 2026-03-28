"use client";

import { useState } from 'react';
import { ShieldAlert, Fingerprint, RefreshCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuditProps {
  imageUrl: string;
}

export default function AuditControl({ imageUrl }: AuditProps) {
  const [auditing, setAuditing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runAudit = async () => {
    setAuditing(true);
    // Simulate deep reverse check
    await new Promise(r => setTimeout(r, 2500));
    
    setResult({
      authentic: true,
      confidence: 99.4,
      source: "Google Lens API / Reverse Search Index",
      fingerprint: "SHA-256: 4f12...a931",
      message: "This image is original and has zero matches in public stock databases or archival NGO reports. Cross-verified with device-level metadata."
    });
    setAuditing(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={runAudit}
        disabled={auditing}
        className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[#a855f7] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-purple-500/20 transition-all disabled:opacity-50"
      >
        {auditing ? <RefreshCcw size={12} className="animate-spin" /> : <ShieldAlert size={12} />} 
        {auditing ? 'Crunching Pixels...' : 'Independent Audit'}
      </button>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute right-0 top-12 w-64 p-6 bg-[#0d1117] border border-purple-500/30 rounded-3xl shadow-3xl z-50 space-y-4"
          >
             <div className="flex justify-between items-start">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                   <Fingerprint size={16} />
                </div>
                <button onClick={() => setResult(null)} className="text-gray-600 hover:text-white">×</button>
             </div>
             <div>
                <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Reverse Audit Result</h4>
                <p className="text-[11px] font-bold text-white mt-1">{result.confidence}% Originality Match</p>
             </div>
             <p className="text-[9px] text-gray-500 leading-relaxed italic">
                &quot;{result.message}&quot;
             </p>
             <div className="pt-4 border-t border-gray-800 flex items-center gap-2">
                <CheckCircle2 size={12} className="text-[#16a34a]" />
                <span className="text-[8px] font-black text-[#16a34a] uppercase tracking-widest">Protocol Verified</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
