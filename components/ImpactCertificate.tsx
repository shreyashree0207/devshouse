"use client";

import { Leaf, ShieldCheck, Award, Zap, Globe } from 'lucide-react';

interface CertificateProps {
  donorName: string;
  amount: number;
  activityTitle: string;
  district: string;
  ngoName: string;
  proofImageUrl: string;
  trustScore: number;
  darpanId: string;
}

export default function ImpactCertificate({ donorName, amount, activityTitle, district, ngoName, proofImageUrl, trustScore, darpanId }: CertificateProps) {
  return (
    <div id="impact-certificate" className="w-[800px] h-[500px] bg-[#0d1117] text-white p-12 border-[12px] border-[#16a34a]/30 relative overflow-hidden font-jakarta flex flex-col justify-between">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-[#16a34a] opacity-[0.05] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#3b82f6] opacity-[0.05] rounded-full blur-[100px] pointer-events-none" />
      
      {/* Header */}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-[#16a34a] p-2 rounded-xl shadow-2xl">
            <Leaf className="text-[#0d1117]" size={32} />
          </div>
          <span className="text-3xl font-black tracking-tighter">Sustainify</span>
        </div>
        <div className="text-right">
          <h1 className="text-sm font-black text-[#16a34a] uppercase tracking-[0.4em] mb-1">CERTIFICATE OF IMPACT</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">VERIFIED TRUST PROTOCOL v1.0</p>
        </div>
      </div>

      {/* Main Quote */}
      <div className="relative z-10 py-8">
        <p className="text-4xl font-extrabold tracking-tighter leading-tight max-w-2xl text-[#16a34a]">
          &quot;I helped <span className="text-white">deliver {activityTitle}</span> in {district}, Tamil Nadu&quot;
        </p>
      </div>

      {/* Details Section */}
      <div className="flex justify-between items-end relative z-10">
        <div className="space-y-6">
          <div className="space-y-1">
             <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Presented to</p>
             <h2 className="text-3xl font-black tracking-tight text-white">{donorName}</h2>
          </div>
          
          <div className="flex gap-10">
             <div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Contribution</p>
                <p className="text-2xl font-black text-white">₹{amount.toLocaleString()}</p>
             </div>
             <div>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Validated NGO</p>
                <p className="text-xl font-bold text-white mb-0.5">{ngoName}</p>
                <p className="text-[8px] text-[#16a34a] font-black uppercase tracking-widest leading-none">Darpan ID: {darpanId}</p>
             </div>
          </div>
        </div>

        {/* Proof Section */}
        <div className="flex items-end gap-6 relative">
           <div className="relative">
              <div className="w-40 h-40 rounded-3xl overflow-hidden border-2 border-gray-800 shadow-2xl">
                 <img src={proofImageUrl} alt="Proof" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 px-4 py-2 bg-[#16a34a] text-white border-2 border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl">
                 <ShieldCheck size={14} /> AI VERIFIED {trustScore}/100
              </div>
           </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-8 border-t border-gray-800 flex justify-between items-center relative z-10">
         <div className="flex items-center gap-6 opacity-40 grayscale">
            <Globe size={24} />
            <Zap size={24} />
            <Award size={32} />
         </div>
         <div className="text-right flex items-center gap-4">
            <span className="text-[12px] font-black text-white tracking-widest">SUSTAINIFY.IN</span>
            <div className="h-10 w-px bg-gray-800" />
            <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest text-left leading-relaxed">
               TRACKED.<br/>TRANSPARENT.<br/>REAL IMPACT.
            </div>
         </div>
      </div>
    </div>
  );
}
