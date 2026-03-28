"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Layout, Activity, ShieldCheck, TrendingUp, Filter,
  School, HeartPulse, Users, Globe, Info, Zap
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { apiRequest } from '../../lib/api';

// Loading MapComponent dynamically to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('../../components/MapComponent'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#161b22] animate-pulse rounded-[2.5rem] flex items-center justify-center text-gray-700 font-black uppercase tracking-widest">Initializing Geographic Layer...</div>
});

export default function ExploreMapPage() {
  const [ngos, setNgos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchNgos = async () => {
      try {
        const data = await apiRequest('/ngos/map');
        if (data.features) setNgos(data.features);
      } catch (err) {
        console.error("Failed to fetch map data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNgos();
  }, []);

  const categories = [
    { name: 'All', icon: <Globe size={16} />, count: ngos.length },
    { name: 'Education', icon: <School size={16} />, count: ngos.filter(n => n.properties.category === 'Education').length },
    { name: 'Health', icon: <HeartPulse size={16} />, count: ngos.filter(n => n.properties.category === 'Health').length },
    { name: 'Community', icon: <Users size={16} />, count: ngos.filter(n => n.properties.category === 'Community').length },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-jakarta overflow-hidden h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-10 px-4 md:px-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 h-[80px]">
           <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs font-black text-[#16a34a] uppercase tracking-[0.3em]">
                 <Compass size={16} /> Impact Explorer Map
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-none shadow-sm">
                 Radical <span className="text-[#16a34a]">Transparency</span> Map
              </h1>
           </div>
           
           {/* Dynamic Category Filters */}
           <div className="flex gap-3 bg-[#161b22] p-2 rounded-2xl border border-gray-800 shadow-xl overflow-x-auto scrollbar-hide max-w-full">
              {categories.map((cat) => (
                 <button
                    key={cat.name}
                    onClick={() => setFilter(cat.name)}
                    className={`flex items-center gap-3 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                       filter === cat.name 
                         ? 'bg-[#16a34a] text-white shadow-[0_10px_20px_rgba(22,163,94,0.3)] scale-[1.05]' 
                         : 'text-gray-500 hover:text-white hover:bg-black/40'
                    }`}
                 >
                    {cat.icon} {cat.name} <span className="opacity-40">{cat.count}</span>
                 </button>
              ))}
           </div>
        </div>

        {/* Map Container */}
        <div className="flex-grow relative h-full">
           <AnimatePresence mode="wait">
             {loading ? (
                <motion.div
                   key="loading"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="h-full w-full bg-[#161b22] animate-pulse rounded-[2.5rem] flex items-center justify-center text-gray-700 font-black uppercase tracking-widest flex flex-col gap-6"
                >
                   <Activity size={64} className="text-[#16a34a]" />
                   Sustainify AI Mapping In Progress...
                </motion.div>
             ) : (
                <motion.div
                   key="map"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.8 }}
                   className="h-full w-full"
                >
                   <MapComponent ngos={ngos} filter={filter} />
                </motion.div>
             )}
           </AnimatePresence>

           {/* Stats Overlay */}
           <div className="absolute top-10 right-10 z-[50] hidden md:flex flex-col gap-4">
              <div className="card p-6 border-[#16a34a]/20 bg-black/60 backdrop-blur-xl shadow-2xl min-w-[220px]">
                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3">Total Impact Hubs</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">{ngos.length}</span>
                    <span className="text-xs font-black text-[#16a34a]">STATIONS</span>
                 </div>
                 <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#16a34a] animate-ping" />
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Real-time Location Sync</span>
                 </div>
              </div>

              <div className="card p-6 border-red-500/20 bg-black/60 backdrop-blur-xl shadow-2xl">
                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[#16a34a]" /> Governance Mode
                 </p>
                 <div className="space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-bold">
                       <span className="text-gray-400">BLACKLISTED NGOs</span>
                       <span className="text-red-400">{ngos.filter(n => n.properties.status === 'blacklisted').length}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold">
                       <span className="text-gray-400">GOV FUNDED</span>
                       <span className="text-yellow-400">{ngos.filter(n => n.properties.status === 'gov_funded').length}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </main>

      {/* Background UI Decor */}
      <div className="fixed bottom-[-10vw] right-[-10vw] w-[40vw] h-[40vw] bg-[#16a34a] opacity-[0.02] rounded-full blur-[200px] pointer-events-none" />
      <div className="fixed top-[-10vw] left-[-10vw] w-[40vw] h-[40vw] bg-[#3b82f6] opacity-[0.02] rounded-full blur-[200px] pointer-events-none" />
    </div>
  );
}
