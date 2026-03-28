// @ts-nocheck
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ShieldCheck, ShieldX, Clock, MapPin, Tag, AlertTriangle, 
  CheckCircle2, ThumbsUp, Loader2, RefreshCw, ArrowLeft,
  FileText, Users, Target, Zap, Activity, Globe,
  Briefcase, Award, Newspaper, Info, ExternalLink, Flame
} from "lucide-react";
import Navbar from "../../../components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Update Card Component ─────────────────────────────────────────────────────
function UpdateCard({ update, onConfirm }) {
  const [confirming, setConfirming] = useState(false);
  const ts = update.created_at 
    ? new Date(update.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const handleConfirm = async () => {
     setConfirming(true);
     await onConfirm(update.id);
     setConfirming(false);
  };

  return (
    <div className="bg-[#0b1219] border border-white/[0.08] rounded-[2.5rem] overflow-hidden hover:border-emerald-500/30 transition-all duration-500 group animate-fade-in">
       <div className="relative aspect-video">
          <img src={update.image_url} alt={update.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] opacity-80 group-hover:opacity-100" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1219] via-transparent to-transparent opacity-60" />
          
          <div className="absolute top-6 right-6 flex flex-col items-end gap-3">
             <div className="px-5 py-2.5 rounded-2xl backdrop-blur-xl border border-white/20 bg-black/40 flex flex-col items-end shadow-2xl">
                <span className="text-[8px] font-black uppercase tracking-widest opacity-60">AI Integrity</span>
                <span className={`text-xl font-black ${update.ai_score >= 70 ? 'text-emerald-400' : 'text-red-500'}`}>{update.ai_score}%</span>
             </div>
             {update.duplicate_flag && (
                <div className="px-4 py-2 rounded-2xl bg-red-600/90 text-white border border-red-500 font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-2xl animate-pulse">
                   <AlertTriangle size={12} /> Duplicate Verification Warning
                </div>
             )}
          </div>
          
          <div className="absolute bottom-6 left-6 text-[10px] font-bold text-gray-300 flex items-center gap-2">
             <Clock size={12} className="text-emerald-500" /> {ts}
          </div>
       </div>

       <div className="p-8">
          <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tighter group-hover:text-emerald-400 transition-colors">{update.title}</h3>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed font-medium line-clamp-3">{update.description}</p>
          
          <div className="p-5 bg-white/[0.02] border border-white/[0.05] rounded-3xl mb-8 space-y-3">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">AI Audit Response</span>
             </div>
             <p className="text-[11px] text-gray-400 leading-relaxed italic">"{update.ai_verdict}"</p>
             <div className="pt-2 flex flex-wrap gap-2">
                {update.labels?.map(l => (
                  <span key={l} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-gray-500">#{l}</span>
                ))}
             </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-white/[0.05]">
             <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                   <CheckCircle2 size={18} />
                </div>
                <div>
                  <span className="block text-lg font-black text-white">{update.community_ticks || 0}</span>
                  <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Community Ticks</span>
                </div>
             </div>
             <button 
               onClick={handleConfirm}
               disabled={confirming}
               className="px-8 py-3.5 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-emerald-400 transition-all shadow-xl active:scale-95 flex items-center gap-2"
             >
                {confirming ? <Loader2 size={14} className="animate-spin" /> : <ThumbsUp size={14} />}
                Confirm Proof
             </button>
          </div>
       </div>
    </div>
  );
}

// ── MAIN NGO DETAIL PAGE ──────────────────────────────────────────────────────
export default function NgoDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ngo, setNgo] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/ngos/${id}`);
      if (!res.ok) throw new Error("Database integrity breach");
      const data = await res.json();
      setNgo(data.ngo || data);
      const upd = data.proof_updates || data.updates || [];
      setUpdates(upd.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleConfirm = async (updateId) => {
     try {
       const res = await fetch(`${API}/api/v1/updates/${updateId}/community-confirm`, { method: "POST" });
       if (res.ok) await fetchData();
     } catch (err) {
       console.error("Critical Confirm Error:", err);
     }
  };

  if (loading) return (
     <div className="min-h-screen bg-[#040a04] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_50px_rgba(16,185,129,0.3)]" />
           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] animate-pulse">Establishing Trust Sync</p>
        </div>
     </div>
  );

  if (error || !ngo) return (
     <div className="min-h-screen bg-[#040a04] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-red-600/5 border border-red-500/20 rounded-[3rem] p-12 text-center space-y-8 animate-fade-in shadow-2xl">
           <ShieldX size={64} className="text-red-500 mx-auto opacity-40 shadow-[0_0_50px_rgba(239,68,68,0.2)]" />
           <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Identifier Gap</h2>
           <p className="text-gray-500 text-sm font-medium leading-relaxed italic">"{error || "NGO metadata not found within authority directory."}"</p>
           <button onClick={() => router.back()} className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all shadow-2xl">Return to Feed</button>
        </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-[#040a04] text-white selection:bg-emerald-500/40 selection:text-black pb-40">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden border-b border-white/[0.06]">
         <img src={ngo.latest_image_url || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070"} alt="" className="w-full h-full object-cover opacity-30 animate-scale-in" />
         <div className="absolute inset-0 bg-gradient-to-t from-[#040a04] via-[#040a04]/40 to-transparent" />
         
         <div className="absolute bottom-0 left-0 w-full p-12 md:p-24 pb-16 z-10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-12">
               <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-4">
                     <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 shadow-2xl ${ngo.blacklisted ? 'bg-red-600 text-white border-red-500' : ngo.verified ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                        {ngo.blacklisted ? 'Operational Ban' : ngo.verified ? 'Authority Verified' : 'Transparency Processing'}
                     </span>
                     <span className="px-5 py-2 rounded-full bg-white/[0.04] border border-white/[0.1] text-gray-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                       <MapPin size={12} className="text-emerald-500" /> {ngo.city}, {ngo.state}
                     </span>
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase leading-none drop-shadow-2xl">{ngo.name}</h1>
                  <p className="text-gray-400 text-xl font-medium max-w-2xl leading-relaxed italic drop-shadow-lg leading-relaxed line-clamp-2">"{ngo.description}"</p>
               </div>
               
               <div className="flex gap-4">
                  <button className="px-10 py-5 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95">Support Mission</button>
               </div>
            </div>
         </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 pt-20 relative z-10">
          
          {/* Documentary Audit Warning */}
          {ngo.pending_doc_request && (
             <div className="mb-20 p-12 bg-amber-500/10 border-2 border-amber-500/40 rounded-[3rem] shadow-2xl animate-fade-in overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                   <FileText size={180} className="text-amber-500" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row gap-12">
                    <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.3)] shrink-0 animate-pulse">
                       <AlertTriangle size={36} className="text-black" />
                    </div>
                    <div className="space-y-4">
                       <h3 className="text-3xl font-black text-amber-500 uppercase tracking-tighter leading-none">Transparency Alert: Mandatory Audit Active</h3>
                       <p className="text-gray-400 font-bold text-lg leading-relaxed max-w-2xl italic">"Our transparency algorithms has triggered a government document request: <span className="text-amber-400/80">{ngo.doc_request_reason || 'Verification of recent field proofs requested.'}</span>"</p>
                    </div>
                </div>
             </div>
          )}

          {/* Impact Dashboard */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
              <div className="bg-white/[0.02] border border-white/[0.08] p-10 rounded-[2.5rem] group hover:bg-white/[0.04] transition-all">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform"><ShieldCheck size={24} /></div>
                 <span className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Verified Proofs</span>
                 <span className="text-4xl font-black text-white">{ngo.verified_proofs || 0}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.08] p-10 rounded-[2.5rem] group hover:bg-white/[0.04] transition-all">
                 <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform"><Target size={24} /></div>
                 <span className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Target Score</span>
                 <span className="text-4xl font-black text-white">{ngo.milestones_done || 0}/{ngo.milestones_total || 20}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.08] p-10 rounded-[2.5rem] group hover:bg-white/[0.04] transition-all">
                 <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform"><Zap size={24} /></div>
                 <span className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Transparency Pts</span>
                 <span className="text-4xl font-black text-white">{ngo.gov_points || 0}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.08] p-10 rounded-[2.5rem] group hover:bg-white/[0.04] transition-all">
                 <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 transition-transform"><Users size={24} /></div>
                 <span className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Community Trust</span>
                 <span className="text-4xl font-black text-white">{updates.reduce((s, u)=>s+(u.community_ticks || 0), 0)}</span>
              </div>
          </section>

          {/* Verified Proof Ledger */}
          <div className="space-y-12">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div className="space-y-2">
                   <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Impact <span className="text-emerald-500">Ledger</span></h2>
                   <p className="text-lg text-gray-500 font-medium italic">Verified field proof updates from the ground.</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-5 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-gray-400 text-[10px] font-black uppercase tracking-widest">
                     {updates.length} TOTAL RECORDS
                  </span>
                  <button onClick={fetchData} className="p-4 bg-white/[0.04] border border-white/[0.1] rounded-2xl hover:border-emerald-500/50 transition-all active:scale-90">
                     <RefreshCw size={20} className={loading ? 'animate-spin' : 'text-emerald-400'} />
                  </button>
                </div>
             </div>

             {updates.length === 0 ? (
                <div className="py-40 text-center border-2 border-dashed border-white/[0.06] rounded-[4rem] group hover:border-white/[0.1] transition-all">
                   <div className="w-20 h-20 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                    <Activity size={40} className="text-gray-800" />
                   </div>
                   <h3 className="text-3xl font-black text-gray-800 uppercase tracking-tighter mb-2">Ledger Empty</h3>
                   <p className="text-[10px] text-gray-800 font-bold uppercase tracking-[0.5em]">System Awaiting Field Proof Input</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   {updates.map((update, i) => (
                      <UpdateCard key={update.id || i} update={update} onConfirm={handleConfirm} />
                   ))}
                </div>
             )}
          </div>
      </main>

      {/* Trust Badge Watermark */}
      <div className="fixed bottom-10 left-10 flex items-center gap-4 opacity-10 pointer-events-none select-none z-0">
         <Globe size={40} className="text-emerald-500" />
         <div className="flex flex-col">
            <span className="text-[12px] font-black uppercase tracking-[0.4em] text-white leading-none">Sustainify Integrity Infrastructure</span>
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">Live Transparency Channel - DARPAN Secured</span>
         </div>
      </div>
    </div>
  );
}
