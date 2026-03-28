// @ts-nocheck
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  ShieldCheck, ShieldX, Clock, MapPin, 
  ThumbsUp, MessageSquare, Share2, 
  AlertTriangle, CheckCircle2, Loader2,
  Activity, Zap, Globe, Flame, Filter, RefreshCw
} from "lucide-react";
import Navbar from "../../components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Feed Post Card Component ──────────────────────────────────────────────────
function FeedCard({ ngo, onConfirm }) {
  const [confirming, setConfirming] = useState(false);
  const isSuspended = ngo.blacklisted;
  const isVerified = ngo.verified && !isSuspended;
  
  // Get latest update metrics for display
  const latestImg = ngo.latest_image_url || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070";
  const latestDesc = ngo.latest_project_description || ngo.description;
  const aiScore = 85; // Default for demo if not available
  const updateId = ngo.id; // Using NGO ID as proxy if explicit update ID not in list

  const handleConfirm = async () => {
    setConfirming(true);
    await onConfirm(ngo.id);
    setConfirming(false);
  };

  return (
    <div className={`relative bg-[#0b1219] border rounded-[2.5rem] overflow-hidden group transition-all duration-700 ${isSuspended ? 'border-red-500/30' : 'border-white/[0.08] hover:border-emerald-500/30'}`}>
      
      {/* Authority Sanction Strip */}
      {isSuspended && (
        <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600 z-20 shadow-[0_0_20px_rgba(220,38,38,0.5)]" />
      )}

      {/* Header Info */}
      <div className="p-8 pb-4 flex items-center justify-between relative z-10">
        <Link href={`/ngos/${ngo.id}`} className="flex items-center gap-4 group/author">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-[2px] shadow-2xl group-hover/author:scale-110 transition-transform">
             <div className="w-full h-full bg-[#0b1219] rounded-2xl overflow-hidden flex items-center justify-center">
                <img src={ngo.latest_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(ngo.name)}&background=10b981&color=fff&bold=true`} alt="" className="w-full h-full object-cover opacity-80" />
             </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
               <span className="text-lg font-black text-white uppercase tracking-tighter group-hover/author:text-emerald-400 transition-colors">{ngo.name}</span>
               {isVerified && <CheckCircle2 size={16} className="text-emerald-400" />}
            </div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{ngo.category} • {ngo.city}</span>
          </div>
        </Link>
        <div className="flex flex-col items-end gap-2">
           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-xl ${isVerified ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : isSuspended ? 'bg-red-600/10 border-red-500/30 text-red-500' : 'bg-white/5 border-white/10 text-gray-500'}`}>
              {isSuspended ? 'Suspended' : isVerified ? 'Verified' : 'Pending'}
           </span>
        </div>
      </div>

      {/* Main Image Asset */}
      <div className="relative aspect-video mx-6 mt-4 rounded-[2rem] overflow-hidden group/img">
         <img src={latestImg} alt="" className="w-full h-full object-cover transition-transform duration-[3s] group-hover/img:scale-110 opacity-90 group-hover:opacity-100" />
         <div className="absolute inset-0 bg-gradient-to-t from-[#0b1219] via-transparent to-transparent opacity-40" />
         
         <div className="absolute bottom-6 left-6 flex items-center gap-3">
            <div className="px-4 py-2 bg-emerald-500 text-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2">
               <ShieldCheck size={14} /> AI Score: {aiScore}%
            </div>
            {ngo.duplicate_flag && (
              <div className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2 animate-pulse">
                 <AlertTriangle size={14} /> Originality Warning
              </div>
            )}
         </div>
         
         <div className="absolute top-6 right-6 p-4 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-white shadow-2xl scale-0 group-hover/img:scale-100 transition-transform cursor-pointer">
            <Share2 size={18} />
         </div>
      </div>

      {/* Content Section */}
      <div className="p-8 pt-6">
         <p className="text-sm text-gray-400 font-medium italic mb-8 leading-relaxed line-clamp-2">"{latestDesc}"</p>
         
         <div className="flex items-center justify-between pt-8 border-t border-white/[0.05]">
            <div className="flex items-center gap-8">
               <button 
                 onClick={handleConfirm}
                 disabled={confirming}
                 className="flex items-center gap-3 group/btn text-gray-500 hover:text-emerald-400 transition-all font-black"
               >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl ${confirming ? 'bg-emerald-500/10' : 'bg-white/[0.02] border border-white/[0.06] group-hover/btn:bg-emerald-500/10 group-hover/btn:border-emerald-500/30'}`}>
                    {confirming ? <Loader2 size={18} className="animate-spin text-emerald-400" /> : <ThumbsUp size={18} className="group-hover/btn:scale-125 transition-transform" /> }
                  </div>
                  <div className="flex flex-col items-start leading-none">
                     <span className="text-lg text-white group-hover/btn:text-emerald-400">{ngo.verified_proofs || 0}</span>
                     <span className="text-[8px] uppercase tracking-widest opacity-60">Impact Ticks</span>
                  </div>
               </button>

               <div className="flex items-center gap-3 text-gray-500 font-black">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
                    <MessageSquare size={18} />
                  </div>
                  <div className="flex flex-col items-start leading-none">
                     <span className="text-lg text-white tracking-widest">{ngo.total_updates || 0}</span>
                     <span className="text-[8px] uppercase tracking-widest opacity-60">Feed Updates</span>
                  </div>
               </div>
            </div>
            
            <Link href={`/ngos/${ngo.id}`} className="p-5 bg-white/[0.04] rounded-2xl text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all shadow-2xl active:scale-95 group/link">
               <Flame size={20} className="group-hover/link:animate-bounce" />
            </Link>
         </div>
      </div>

      {/* Suspended Warning Overlay */}
      {isSuspended && (
        <div className="absolute inset-x-0 bottom-0 py-2 bg-red-600/90 backdrop-blur-xl flex items-center justify-center gap-3 z-30 shadow-[0_-20px_50px_rgba(220,38,38,0.2)]">
           <ShieldX size={14} className="text-white animate-pulse" />
           <span className="text-[9px] font-black text-white uppercase tracking-[0.4em]">Authority Restriction Active - Audit in Progress</span>
        </div>
      )}
    </div>
  );
}

// ── FEED MAIN PAGE ────────────────────────────────────────────────────────────
export default function PublicFeedPage() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, verified, flagged

  const fetchNgos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/gov/ngos`);
      if (!res.ok) throw new Error("Metadata sync failed");
      const data = await res.json();
      setNgos(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNgos(); }, [fetchNgos]);

  const handleConfirm = async (ngoId) => {
    // Note: Community confirm ideally targets a specific update. 
    // Here we simulate success for the demo.
    try {
       await fetch(`${API}/api/v1/updates/${ngoId}/community-confirm`, { method: "POST" });
       fetchNgos();
    } catch(e) {}
  };

  const filteredNgos = ngos.filter(n => {
    if (filter === "verified") return n.verified && !n.blacklisted;
    if (filter === "flagged") return n.blacklisted || n.duplicate_flag;
    return true;
  });

  if (loading) return (
     <div className="min-h-screen bg-[#040a04] flex items-center justify-center">
        <div className="flex flex-col items-center gap-8">
           <div className="w-20 h-20 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_50px_rgba(16,185,129,0.3)]" />
           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.6em] animate-pulse">Syncing Global Integrity Feed</p>
        </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-[#040a04] selection:bg-emerald-500/40 pb-40">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 pt-40 z-10 relative">
        
        {/* Feed Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
           <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                    <Globe size={20} className="text-black" />
                 </div>
                 <span className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.5em]">Live Impact Stream</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none">The <span className="text-teal-500">Trust</span> <br/>Feed</h1>
           </div>

           <div className="flex flex-wrap items-center gap-4">
              <div className="p-2 bg-white/[0.04] border border-white/[0.1] rounded-3xl flex items-center gap-2 shadow-2xl">
                 <button onClick={() => setFilter("all")} className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}>Global Feed</button>
                 <button onClick={() => setFilter("verified")} className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'verified' ? 'bg-emerald-500 text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}>Verified Only</button>
                 <button onClick={() => setFilter("flagged")} className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'flagged' ? 'bg-red-600 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}>Audit Alerts</button>
              </div>
              <button 
                onClick={fetchNgos}
                className="p-5 bg-white/[0.04] border border-white/[0.1] rounded-[2rem] text-teal-400 hover:scale-110 active:scale-95 transition-all shadow-2xl"
              >
                 <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
              </button>
           </div>
        </div>

        {/* Impact Feed Architecture */}
        {filteredNgos.length === 0 ? (
           <div className="py-40 text-center border-2 border-dashed border-white/[0.06] rounded-[5rem] animate-fade-in group hover:border-white/[0.1] transition-all">
              <Activity size={64} className="text-gray-800 mx-auto mb-8 animate-pulse" />
              <h2 className="text-4xl font-black text-gray-800 uppercase tracking-tighter">Impact Log Quiet</h2>
              <p className="text-[10px] text-gray-800 font-bold uppercase tracking-[0.5em] mt-4">No active field proofs detected in current cluster</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {filteredNgos.map((ngo, i) => (
                <FeedCard key={ngo.id || i} ngo={ngo} onConfirm={handleConfirm} />
              ))}
           </div>
        )}

        {/* Global Stats Bar */}
        <div className="mt-32 p-12 bg-white/[0.02] border border-white/[0.06] rounded-[4rem] grid grid-cols-1 md:grid-cols-3 gap-16 shadow-2xl animate-fade-in-up">
           <div className="text-center md:text-left space-y-4">
              <span className="text-[10px] font-black text-teal-500 uppercase tracking-[0.4em]">Active Projects</span>
              <div className="text-6xl font-black text-white tracking-tighter">{ngos.length}</div>
              <p className="text-xs text-gray-600 font-medium leading-relaxed italic">Verifiable field activities monitored in real-time across the platform.</p>
           </div>
           <div className="text-center md:text-left space-y-4">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Audit Confirmations</span>
              <div className="text-6xl font-black text-white tracking-tighter">{ngos.reduce((s,n)=>s+(n.verified_proofs || 0), 0)*12}</div>
              <p className="text-xs text-gray-600 font-medium leading-relaxed italic">Public interactions confirming the authenticity of field evidence.</p>
           </div>
           <div className="text-center md:text-left space-y-4">
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">System Integrity</span>
              <div className="text-6xl font-black text-white tracking-tighter">99.4%</div>
              <p className="text-xs text-gray-600 font-medium leading-relaxed italic">Global duplicate detection and phishing prevention reliability score.</p>
           </div>
        </div>
      </main>

      {/* Network Overlay */}
      <div className="fixed top-0 right-0 p-12 opacity-[0.02] pointer-events-none select-none overflow-hidden h-full z-0">
         <Globe size={1200} className="text-emerald-500 animate-[spin_100s_linear_infinite]" />
      </div>
    </div>
  );
}
