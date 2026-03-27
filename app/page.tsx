"use client";

import { motion } from 'framer-motion';
import { 
  Building2, 
  Coins, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  ShieldCheck, 
  Zap, 
  Target, 
  Award,
  Globe,
  Heart
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import NGOCard from '../components/NGOCard';
import { supabase } from '../lib/supabase';

const SDG_GOALS = [
  { id: 1, label: 'SDG 1 No Poverty', color: 'bg-red-500' },
  { id: 3, label: 'SDG 3 Good Health', color: 'bg-green-500' },
  { id: 4, label: 'SDG 4 Quality Education', color: 'bg-red-600' },
  { id: 5, label: 'SDG 5 Gender Equality', color: 'bg-orange-600' },
  { id: 13, label: 'SDG 13 Climate Action', color: 'bg-green-700' },
  { id: 17, label: 'SDG 17 Partnerships', color: 'bg-blue-900' },
];

export default function Home() {
  const [featuredNgos, setFeaturedNgos] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from('ngos')
        .select('*')
        .limit(3);
      if (data) setFeaturedNgos(data);
    };
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-4 md:px-8 overflow-hidden grid-pattern">
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-[#16a34a] opacity-[0.03] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] bg-[#22c55e] opacity-[0.03] rounded-full blur-[80px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-[#16a34a]/10 border border-[#16a34a]/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[#16a34a] shadow-lg">
              <Zap size={14} className="fill-[#16a34a]" /> Radical Transparency for Radical Impact
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold font-jakarta tracking-tighter leading-[1.1] mb-8">
              <span className="block text-white opacity-95">Donate with <span className="text-[#16a34a]">Proof.</span></span>
              <span className="block text-white opacity-95">Give with <span className="text-[#16a34a]">Purpose.</span></span>
              <span className="block text-[#16a34a] mt-4 shadow-sm">Sustainify</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-lg leading-relaxed mb-12 font-medium opacity-80">
              Sustainify empowers you to track every rupee against real-world milestones verified by AI. Experience the future of secure social giving.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <Link href="/ngos">
                <button className="btn-primary text-lg flex items-center gap-3 px-10 py-5 group shadow-[0_10px_30px_rgba(22,163,94,0.3)]">
                  Explore NGOs <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
                </button>
              </Link>
              <button className="btn-outline text-lg flex items-center gap-3 px-10 py-5 group border-gray-800 text-gray-400 hover:text-[#16a34a] hover:border-[#16a34a]">
                <Play className="fill-current" size={20} /> Watch How It Works
              </button>
            </div>
          </motion.div>

          {/* Hero Visual Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="card w-full max-w-md p-1 bg-gradient-to-br from-[#21262d] to-black shadow-2xl skew-y-1 animate-float relative z-10 group">
              <div className="absolute -top-4 -right-4 bg-[#16a34a] text-white px-4 py-2 rounded-xl text-xs font-black shadow-2xl z-50 flex items-center gap-2 border border-white/20">
                <ShieldCheck size={16} /> AI VERIFIED ✓
              </div>
              <div className="bg-[#161b22] rounded-xl overflow-hidden shadow-inner">
                <div className="h-48 bg-gray-900 relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-extrabold text-white mb-1 group-hover:text-[#16a34a] transition-colors">Akshara Foundation — M2</h4>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Milestone 2: Complete ✓</p>
                    </div>
                    <div className="p-2 bg-[#16a34a]/10 rounded-lg">
                      <Zap size={20} className="text-[#16a34a]" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-gray-400">
                      <span>Funded</span>
                      <span className="text-[#16a34a]">64%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill w-[64%]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-700" />
                      <div className="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-600" />
                      <div className="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-500" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-white">89/100</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Transparency</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -inset-10 bg-[#16a34a]/20 blur-[60px] opacity-10 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-gradient-to-r from-[#161b22] to-black py-16 px-4 border-y border-gray-800 relative shadow-2xl overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-grid-pattern pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          <StatCard icon={Building2} value={47} label="NGOs Verified" suffix="" />
          <StatCard icon={Coins} value={24000000} label="Total Donated" prefix="₹" />
          <StatCard icon={Users} value={123000} label="Lives Impacted" suffix="" />
          <StatCard icon={CheckCircle2} value={312} label="Milestones Completed" suffix="" />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-4 md:px-8 bg-black">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-extrabold font-jakarta tracking-tight mb-6 leading-tight">
              Giving was never this <span className="text-[#16a34a]">Transparent.</span>
            </h2>
            <div className="w-24 h-1 bg-[#16a34a] mx-auto rounded-full mb-8 shadow-[0_0_10px_rgba(22,163,94,0.5)]" />
            <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
              Three simple steps to ensure your contribution creates the maximum footprint.
            </p>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { step: '01', title: 'Discover', desc: 'Browse verified NGOs by cause and location with verified transparency logs.', icon: Globe },
            { step: '02', title: 'Donate', desc: 'Give securely via Supabase and track every rupee in real-time as it allocates.', icon: Heart },
            { step: '03', title: 'Verify', desc: 'NGOs upload geo-tagged proof, and our Gemini AI confirms legitimacy instantly.', icon: ShieldCheck }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="card p-10 bg-gradient-to-br from-[#161b22] to-black/40 border-gray-800 hover:border-[#16a34a]/30 transition-all duration-300 relative group overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 text-8xl font-black text-white/5 opacity-50 group-hover:text-[#16a34a]/10 transition-colors pointer-events-none uppercase tracking-tighter">
                {item.step}
              </div>
              <item.icon className="text-[#16a34a] mb-8" size={40} />
              <h3 className="text-2xl font-bold font-jakarta text-white mb-4 leading-none tracking-tight">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-32 px-4 md:px-8 bg-[#0d1117] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-5xl md:text-6xl font-extrabold font-jakarta tracking-tighter leading-tight mb-8">
              Why <span className="text-[#16a34a]">Sustainify?</span>
            </h2>
            <p className="text-xl text-gray-500 leading-relaxed font-medium mb-12 max-w-md">
              The platform that bridges the gap between donors and impact through radical transparency.
            </p>
          </div>
          <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              "Real-time milestone tracking",
              "AI-powered proof verification",
              "Transparency index built on data",
              "100% donation goes to the cause"
            ].map((text, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-6 glass border border-gray-800 rounded-2xl hover:bg-gray-800/20 transition-all group"
              >
                <div className="bg-[#16a34a]/10 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={24} className="text-[#16a34a]" />
                </div>
                <p className="text-white font-bold text-sm tracking-tight leading-snug">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured NGOs Section */}
      <section className="py-32 px-4 md:px-8 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end mb-16 px-4">
          <div className="max-w-lg mb-8 md:mb-0">
            <h2 className="text-4xl md:text-5xl font-extrabold font-jakarta tracking-tight mb-4 leading-tight">
              NGOs Making <span className="text-[#16a34a]">Real Impact</span>
            </h2>
            <p className="text-gray-500 font-medium text-lg italic opacity-90">Our top-performing verified partners.</p>
          </div>
          <Link href="/ngos">
            <button className="btn-outline px-10 py-5 flex items-center gap-3 group whitespace-nowrap border-[#16a34a]/30 hover:border-[#16a34a]">
              View All NGOs <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredNgos.length > 0 ? (
            featuredNgos.map(ngo => (
              <NGOCard key={ngo.id} ngo={ngo} />
            ))
          ) : (
            [...Array(3)].map((_, i) => (
              <div key={i} className="card h-96 bg-[#161b22] border-gray-800 animate-pulse rounded-2xl" />
            ))
          )}
        </div>
      </section>

      {/* SDG Goals */}
      <section className="py-24 px-4 bg-gradient-to-b from-black to-[#0d1117] border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-12 opacity-80">Global Alignment</p>
          <h2 className="text-3xl font-extrabold font-jakarta text-white mb-16 tracking-tight">Aligned with <span className="text-[#16a34a]">United Nations SDGs</span></h2>
          <div className="flex flex-wrap justify-center gap-4">
            {SDG_GOALS.map(goal => (
              <div key={goal.id} className="inline-flex items-center gap-3 px-6 py-3 border border-gray-800 hover:border-[#16a34a]/40 bg-[#161b22]/50 hover:bg-[#161b22] transition-all rounded-full cursor-default shadow-md group">
                <div className={`w-3 h-3 rounded-full ${goal.color} shadow-lg`} />
                <span className="text-xs font-bold text-gray-300 tracking-tight group-hover:text-white transition-colors">{goal.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-4 md:px-8 bg-[#0d1117] border-t border-gray-800 relative z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#16a34a] opacity-[0.02] rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 pb-16 border-b border-gray-800 gap-12">
            <div className="max-w-sm">
              <Link href="/" className="flex items-center gap-2 mb-6 group">
                <div className="bg-[#16a34a] p-1.5 rounded-lg shadow-xl shadow-[#16a34a]/10">
                  <Leaf className="text-white" size={24} />
                </div>
                <span className="text-3xl font-black font-jakarta text-white tracking-tighter">Sustainify</span>
              </Link>
              <p className="text-gray-500 font-medium leading-relaxed italic opacity-80">
                Radical transparency for radical impact. Experience the future of secure social giving.
              </p>
            </div>
            
            <div className="flex gap-20">
              <div className="flex flex-col gap-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#16a34a]">Impact</p>
                <div className="flex flex-col gap-4">
                  <Link href="/ngos" className="text-gray-400 hover:text-white text-sm font-bold transition-colors">Explore NGOs</Link>
                  <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm font-bold transition-colors">Transparency Registry</Link>
                  <Link href="/" className="text-gray-400 hover:text-white text-sm font-bold transition-colors">How it works</Link>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#16a34a]">Support</p>
                <div className="flex flex-col gap-4">
                  <Link href="/" className="text-gray-400 hover:text-white text-sm font-bold transition-colors">Help Center</Link>
                  <Link href="/" className="text-gray-400 hover:text-white text-sm font-bold transition-colors">Terms of Service</Link>
                  <Link href="/login" className="text-gray-400 hover:text-white text-sm font-bold transition-colors">Login to Portal</Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-gray-600 font-bold text-xs uppercase tracking-[0.2em]">&copy; 2026 SUSTAINIFY. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6">
              <Link href="#" className="p-3 bg-[#161b22] rounded-full border border-gray-800 text-gray-400 hover:text-[#16a34a] hover:border-[#16a34a] transition-all shadow-xl">
                <Globe size={18} />
              </Link>
              <Link href="#" className="p-3 bg-[#161b22] rounded-full border border-gray-800 text-gray-400 hover:text-[#16a34a] hover:border-[#16a34a] transition-all shadow-xl">
                <Award size={18} />
              </Link>
              <Link href="#" className="p-3 bg-[#161b22] rounded-full border border-gray-800 text-gray-400 hover:text-[#16a34a] hover:border-[#16a34a] transition-all shadow-xl">
                <CheckCircle2 size={18} />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Leaf({ className, size }: { className?: string; size?: number }) {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8a7 7 0 0 1-10 10Z"></path>
      <path d="M11 20c-1.2.6-3.4 1-5 1a7 7 0 0 1 0-14c1.6 0 3.8.4 5 1"></path>
      <path d="M19 21c-2.4-1.2-4.5-5-3-9"></path>
    </svg>
  );
}
