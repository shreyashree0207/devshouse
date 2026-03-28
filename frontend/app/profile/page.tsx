"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Download, Award, ShieldCheck, HeartPulse, RefreshCw, Undo2 } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function DonorProfile() {
  const [balance, setBalance] = useState(5400); // sample returned funds

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <div className="pt-32 pb-20 max-w-6xl mx-auto px-4">
        
        {/* Wallet & Stats Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="col-span-1 md:col-span-2 card p-10 bg-gradient-to-br from-[#161b22] to-black border border-gray-800 rounded-[2.5rem] flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Impact Portfolio</p>
              <h2 className="text-5xl font-black font-jakarta tracking-tighter">1,240 <span className="text-xl text-[#16a34a]">LIVES CHANGED</span></h2>
              <div className="flex gap-4 mt-6">
                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10"><p className="text-[10px] text-gray-500 uppercase font-black">Total Donated</p><p className="font-bold">₹42,500</p></div>
                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10"><p className="text-[10px] text-gray-500 uppercase font-black">Donation Streak</p><p className="font-bold text-amber-500">🔥 4 Months</p></div>
              </div>
            </div>
            <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-[#16a34a]/10 text-[#16a34a] border border-[#16a34a]/30 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#16a34a] hover:text-white transition-all"><Download size={16}/> Impact Card</button>
          </div>

          <div className="card p-8 bg-[#16a34a] text-white border border-[#16a34a] rounded-[2.5rem] relative overflow-hidden flex flex-col justify-between shadow-[0_20px_40px_rgba(22,163,94,0.3)]">
            <Wallet className="absolute -right-4 -bottom-4 opacity-20" size={140} />
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-widest opacity-80 flex items-center gap-2"><ShieldCheck size={14}/> Secure Wallet</p>
              <h3 className="text-4xl font-black font-jakarta mt-4">₹{balance.toLocaleString('en-IN')}</h3>
              <p className="text-[10px] font-bold mt-1 opacity-80">Refunds heavily secured.</p>
            </div>
            <div className="flex gap-2 relative z-10 mt-8">
              <button className="flex-1 bg-white text-[#16a34a] py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-lg">Withdraw</button>
              <button className="flex-1 bg-black/20 backdrop-blur-md py-2 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black/30 transition-colors border border-white/20">Redonate</button>
            </div>
          </div>
        </div>

        {/* Donation History List */}
        <h3 className="text-2xl font-black font-jakarta mb-8 border-l-4 border-[#16a34a] pl-4">Your Donations</h3>
        <div className="space-y-4">
          {[
            { id: 1, ngo: 'Akshara Foundation', amount: 15000, status: 'ACTIVE', date: 'Oct 15, 2025' },
            { id: 2, ngo: 'Global Health Network', amount: 5400, status: 'RETURNED', date: 'Sep 02, 2025', reason: 'NGO Suspended' },
            { id: 3, ngo: 'Childrens Future', amount: 2100, status: 'UNDER REVIEW', date: 'Aug 20, 2025' }
          ].map(don => (
            <div key={don.id} className="flex items-center justify-between p-6 bg-[#161b22] border border-gray-800 rounded-3xl hover:border-gray-700 transition-colors">
              <div>
                <h4 className="font-bold text-lg">{don.ngo}</h4>
                <p className="text-xs text-gray-500 mt-1 font-bold">{don.date}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-xl mb-1">₹{don.amount.toLocaleString('en-IN')}</p>
                {don.status === 'ACTIVE' && <span className="text-[10px] px-3 py-1 rounded-full bg-[#16a34a]/10 text-[#16a34a] border border-[#16a34a]/20 font-black uppercase tracking-widest">Active</span>}
                {don.status === 'RETURNED' && <span className="text-[10px] px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase tracking-widest flex items-center gap-1"><Undo2 size={10}/> Returned</span>}
                {don.status === 'UNDER REVIEW' && <span className="text-[10px] px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-black uppercase tracking-widest">Under Review</span>}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
