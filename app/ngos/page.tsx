"use client";

import { motion } from 'framer-motion';
import { Search, Loader2, MapPin, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import { supabase } from '../../lib/supabase';
import NGOCard from '../../components/NGOCard';

const CATEGORIES = ["All", "Education", "Healthcare", "Environment", "Women", "Food", "Child"];

function NGODiscoveryContent() {
  const [ngos, setNgos] = useState<any[]>([]);
  const [filteredNgos, setFilteredNgos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('ngos')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) { setNgos(data); setFilteredNgos(data); }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...ngos];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(n => n.name?.toLowerCase().includes(q) || n.city?.toLowerCase().includes(q) || n.district?.toLowerCase().includes(q));
    }
    if (activeCategory !== "All") {
      result = result.filter(n => n.category?.toLowerCase() === activeCategory.toLowerCase());
    }
    if (sortBy === "Most Funded") result.sort((a, b) => (b.raised_amount || 0) - (a.raised_amount || 0));
    else if (sortBy === "Highest Trust") result.sort((a, b) => (b.transparency_score || 0) - (a.transparency_score || 0));
    else if (sortBy === "Most Beneficiaries") result.sort((a, b) => (b.beneficiaries || 0) - (a.beneficiaries || 0));
    setFilteredNgos(result);
  }, [searchTerm, activeCategory, sortBy, ngos]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-[#0a0f0a]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-full">
            <MapPin size={14} className="text-[#00ff88]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00ff88]">Tamil Nadu NGOs</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold text-white tracking-tight">
            Discover & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#39ff14]">Donate with Proof</span>
          </motion.h1>
          <p className="text-gray-500 text-sm">{filteredNgos.length} verified NGOs across 38 districts</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search NGOs, cities, districts..."
              className="w-full bg-white/[0.03] text-white pl-12 pr-4 py-3.5 rounded-2xl border border-white/[0.08] outline-none focus:border-[#00ff88]/30 transition-all text-sm" />
          </div>
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-3 py-2">
            <SlidersHorizontal size={14} className="text-gray-500" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="bg-transparent text-gray-300 text-sm outline-none cursor-pointer">
              <option value="Newest">Newest</option>
              <option value="Most Funded">Most Funded</option>
              <option value="Highest Trust">Highest Trust</option>
              <option value="Most Beneficiaries">Most Beneficiaries</option>
            </select>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-full border transition-all ${
                activeCategory === cat
                  ? 'bg-[#00ff88] text-[#0a0f0a] border-[#00ff88]'
                  : 'text-gray-400 border-white/10 hover:border-[#00ff88]/30 hover:text-[#00ff88]'
              }`}>
              {cat === 'All' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <Loader2 size={40} className="text-[#00ff88]" />
            </motion.div>
          </div>
        ) : filteredNgos.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNgos.map((ngo, i) => (
              <NGOCard key={ngo.id} ngo={ngo} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl font-bold mb-2">No NGOs found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NGODiscoveryPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#0a0f0a]" />}><NGODiscoveryContent /></Suspense>;
}
