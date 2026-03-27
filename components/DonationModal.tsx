"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Share2, Compass, ArrowRight, Heart, X } from 'lucide-react';
import Link from 'next/link';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  donorName: string;
  impactMessage: string;
  ngoName: string;
}

export default function DonationModal({ isOpen, onClose, donorName, impactMessage, ngoName }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={() => onClose()}
           className="fixed inset-0 bg-black/90 backdrop-blur-xl"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          className="w-full max-w-lg z-10"
        >
          <div className="card rounded-[2rem] p-10 border-[#16a34a] border-2 text-center relative overflow-hidden shadow-[0_0_50px_rgba(22,163,94,0.1)]">
            <button 
              onClick={() => onClose()}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#16a34a] opacity-5 rounded-full blur-[50px]"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#22c55e] opacity-5 rounded-full blur-[50px]"></div>
            
            <motion.div 
              initial={{ rotate: -15, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="mb-8 flex justify-center"
            >
              <div className="w-24 h-24 bg-[#16a34a] rounded-full shadow-[0_0_40px_rgba(22,163,94,0.3)] flex items-center justify-center">
                <CheckCircle size={48} className="text-white" />
              </div>
            </motion.div>

            <h2 className="text-4xl font-extrabold font-jakarta text-white mb-2 leading-tight tracking-tighter">
              Thank you, <span className="text-[#16a34a]">{donorName}!</span> 🎉
            </h2>
            <p className="text-gray-500 font-bold mb-8 uppercase tracking-[0.2em] text-[10px]">Donation Successfully Impacted</p>

            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-8 mb-8 relative shadow-inner">
              <p className="text-xl font-medium text-gray-100 italic leading-relaxed font-jakarta">
                "{impactMessage || `Your contribution to ${ngoName} is making a real difference today.`}"
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`I just donated to ${ngoName} on Sustainify! ${impactMessage}`);
                  alert("Impact message copied to clipboard!");
                }}
                className="w-full btn-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-[0_4px_20px_rgba(22,163,94,0.2)]"
              >
                <Share2 size={20} /> SHARE YOUR IMPACT
              </button>
              
              <Link href="/ngos" className="w-full">
                <button 
                  onClick={() => onClose()}
                  className="w-full bg-transparent border border-gray-800 text-gray-400 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:text-white hover:border-white transition-all flex items-center justify-center gap-2"
                >
                  <Compass size={16} /> EXPLORE MORE NGOs <ArrowRight size={14} />
                </button>
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-3 opacity-30">
              <span className="text-[18px] font-black font-jakarta text-[#16a34a] tracking-tight">Sustainify</span>
              <div className="h-4 w-px bg-gray-600"></div>
              <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest leading-none text-left">
                TRACKED.<br/>TRANSPARENT.<br/>REAL.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
