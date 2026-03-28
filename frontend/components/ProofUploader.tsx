"use client";
import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProofUploader({ ngoId, projectId }: { ngoId: string, projectId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'verifying' | 'done' | 'flagged'>('idle');
  const [score, setScore] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
      setStatus('idle');
    }
  };

  const submitProof = async () => {
    if (!file) return;
    setStatus('uploading');
    
    // Simulate upload delay
    await new Promise(r => setTimeout(r, 1500));
    
    setStatus('verifying');
    
    // Animate score from 0 to 92
    let curr = 0;
    const interval = setInterval(() => {
      curr += 4;
      setScore(curr);
      if (curr >= 92) {
        clearInterval(interval);
        setStatus('done'); // change to flagged to trigger reverse search warning flow
      }
    }, 50);
  };

  return (
    <div className="w-full bg-[#161b22] border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <h3 className="text-xl font-extrabold text-white mb-6 border-l-4 border-[#16a34a] pl-4 tracking-tight">Submit Milestone Proof</h3>
      
      {!preview ? (
        <label className="border-2 border-dashed border-gray-700 bg-black/20 hover:bg-[#16a34a]/10 hover:border-[#16a34a]/50 rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer transition-all group">
          <UploadCloud className="text-gray-500 group-hover:text-[#16a34a] mb-4 transition-colors" size={40} />
          <p className="text-sm font-bold text-gray-400 group-hover:text-white">Click or drag proof image to upload</p>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      ) : (
        <div className="space-y-6">
          <div className="relative h-64 rounded-2xl overflow-hidden border border-gray-800">
            <img src={preview} alt="Proof preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] to-transparent opacity-80" />
            
            <AnimatePresence>
              {(status === 'uploading' || status === 'verifying') && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
                  <Loader2 className="animate-spin text-[#16a34a] mb-4" size={40} />
                  <p className="text-sm font-black uppercase tracking-widest text-[#16a34a] animate-pulse">
                    {status === 'uploading' ? 'Uploading safely to Supabase Vault...' : 'Sustainify AI is analyzing your image...'}
                  </p>
                  {status === 'verifying' && <p className="text-[10px] text-white mt-4 tracking-widest font-black uppercase">Executing Originality Check</p>}
                </motion.div>
              )}
              
              {status === 'done' && (
                <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} className="absolute bottom-6 left-6 right-6 p-4 bg-[#16a34a]/90 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl flex items-center justify-between z-20">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-white" size={32} />
                    <div>
                      <p className="text-white font-black text-lg leading-none">VERIFIED</p>
                      <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest mt-1">✓ Original Image Confirmed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-white">{score}%</p>
                    <p className="text-[8px] uppercase tracking-widest text-emerald-100 font-black">AI Trust Index</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {status === 'idle' && (
            <div className="flex gap-4">
               <button onClick={submitProof} className="flex-1 bg-[#16a34a] text-white py-4 rounded-xl font-black hover:bg-[#15803d]">Run AI Verification</button>
               <button onClick={() => {setFile(null); setPreview(null)}} className="px-6 bg-black/40 border border-gray-800 text-white rounded-xl font-bold hover:bg-black/60">Cancel</button>
            </div>
          )}

          {status === 'done' && (
            <div className="flex flex-col gap-4 pt-4 border-t border-gray-800">
               <p className="text-xs text-gray-500 font-bold">Waiting for community consensus...</p>
               <div className="flex items-center gap-4">
                  <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-black text-white hover:bg-white/10 flex items-center justify-center gap-2"><CheckCircle2 size={16} className="text-[#16a34a]"/> Community Verify</button>
                  <div className="w-1/2">
                    <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-2"><span>47 Confirmed</span><span>3 Disputed</span></div>
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden flex"><div className="bg-[#16a34a] w-[94%]"/><div className="bg-red-500 w-[6%]"/></div>
                  </div>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
