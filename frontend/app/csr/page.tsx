"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Building, Target, CheckCircle, FileText, Download } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function CSRPortal() {
  const [selectedSdk, setSelectedSdk] = useState('All');

  const sdgs = ["No Poverty", "Quality Education", "Clean Water", "Climate Action"];
  const ngos = [
    { name: 'Water for All', sdg: 'Clean Water', req: '₹50,00,000', verified: true, score: 96 },
    { name: 'Educate India', sdg: 'Quality Education', req: '₹25,00,000', verified: true, score: 92 }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest mb-4">
              <Building size={12} /> Enterprise B2B
            </div>
            <h1 className="text-5xl font-extrabold font-jakarta tracking-tighter">Corporate Social Responsibility</h1>
            <p className="text-gray-400 text-lg mt-3 font-medium">Align your corporate investments directly with UN Sustainable Development Goals.</p>
          </div>
          <button className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-black shadow-xl hover:bg-gray-200 transition-colors">
            <Download size={20}/> Generate CSR Compliance Report
          </button>
        </div>

        {/* SDG Impact Counter Widget */}
        <div className="w-full bg-gradient-to-r from-[#161b22] to-black border border-gray-800 rounded-3xl p-8 mb-16 flex items-center justify-between shadow-2xl">
           <div className="flex items-center gap-6">
             <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
               <Globe className="text-blue-500" size={40} />
             </div>
             <div>
               <h3 className="text-2xl font-black text-white">Sustainify has contributed to <span className="text-blue-500">8 of 17</span> UN SDGs this month.</h3>
               <p className="text-sm text-gray-500 font-bold mt-1">Fully audited and AI-verified field results.</p>
             </div>
           </div>
        </div>

        <h3 className="text-xl font-black mb-6 border-l-4 border-blue-500 pl-4">Filter by UN SDG Goal</h3>
        <div className="flex gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
          <button onClick={() => setSelectedSdk('All')} className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${selectedSdk === 'All' ? 'bg-blue-600 text-white' : 'bg-[#161b22] text-gray-400 hover:text-white'}`}>All Goals</button>
          {sdgs.map(s => (
            <button key={s} onClick={() => setSelectedSdk(s)} className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${selectedSdk === s ? 'bg-blue-600 text-white' : 'bg-[#161b22] text-gray-400 hover:text-white'}`}>
              ◆ {s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ngos.filter(n => selectedSdk === 'All' || n.sdg === selectedSdk).map((n, i) => (
            <div key={i} className="card p-8 bg-[#161b22] border border-gray-800 rounded-[2rem] hover:border-blue-500/50 transition-colors group">
              <div className="flex justify-between items-start mb-6">
                 <div>
                   <h4 className="text-2xl font-black font-jakarta group-hover:text-blue-400 transition-colors">{n.name}</h4>
                   <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-2">{n.sdg}</p>
                 </div>
                 <div className="w-12 h-12 rounded-full border border-[#16a34a] flex items-center justify-center text-[#16a34a] font-black text-sm shadow-[0_0_15px_rgba(22,163,94,0.2)]">
                   {n.score}
                 </div>
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-gray-300 mb-8 border-t border-gray-800 pt-6">
                 <span className="flex items-center gap-2"><Target size={16} className="text-gray-500"/> Requirement: {n.req}</span>
                 <span className="flex items-center gap-2"><CheckCircle size={16} className="text-[#16a34a]"/> Due Diligence Cleared</span>
              </div>
              <button className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-black text-sm hover:bg-white hover:text-black transition-all">Review Portfolio & Invest</button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
