// @ts-nocheck
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  ShieldCheck, ShieldX, Clock, MapPin, Tag, AlertTriangle,
  CheckCircle2, ThumbsUp, Loader2, RefreshCw, ArrowLeft,
  FileText, Users, Target, Zap, Activity, UploadCloud,
  ChevronRight, LayoutDashboard, Database, TrendingUp, Info,
  Sparkles, Camera, BarChart3, Settings, Globe, MoreVertical
} from "lucide-react";
import Navbar from "../../../components/Navbar";
import ProofUploader from "../../../components/ProofUploader";
import AIResourcesPanel from "../../../components/AIResourcesPanel";
import AIRewritePanel from "../../../components/AIRewritePanel";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Admin Stat Component ──────────────────────────────────────────────────────
function AdminStat({ icon: Icon, label, value, color = "#10b981" }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] p-8 rounded-[2rem] hover:bg-white/[0.05] transition-all group">
       <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
             <Icon size={20} style={{ color }} />
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{label}</span>
       </div>
       <div className="text-4xl font-black text-white tracking-widest leading-none">{value}</div>
    </div>
  );
}

// ── Update Card Item Component ────────────────────────────────────────────────
function UpdateItem({ update }) {
  const ts = update.created_at
    ? new Date(update.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;
  const isGood = (update.ai_score ?? 0) >= 70;

  return (
    <div className="group relative bg-[#0b1219] border border-white/[0.08] rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-emerald-500/30">
       <div className="relative aspect-video overflow-hidden">
          <img src={update.image_url} alt={update.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-[2s] group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1219] via-transparent to-transparent opacity-60" />
          
          <div className="absolute top-6 right-6 flex flex-col gap-3 items-end">
             <div className={`px-4 py-2 rounded-2xl backdrop-blur-xl border flex flex-col items-end shadow-2xl ${isGood ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-red-500/20 border-red-500/40 text-red-500'}`}>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80">AI Impact</span>
                <span className="text-xl font-black">{update.ai_score}%</span>
             </div>
             {update.duplicate_flag && (
                <div className="px-4 py-2 rounded-2xl bg-orange-600/90 text-white border border-orange-500 font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-2xl animate-bounce">
                   <AlertTriangle size={12} /> Duplicate Detected
                </div>
             )}
          </div>

          <div className="absolute bottom-6 left-6 text-[10px] font-bold text-gray-300 flex items-center gap-2">
             <Clock size={12} className="text-emerald-500" /> {ts}
          </div>
       </div>

       <div className="p-8">
          <h4 className="text-lg font-black text-white mb-2 leading-tight uppercase tracking-tighter group-hover:text-emerald-400 transition-colors">{update.title}</h4>
          <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed font-medium">{update.description}</p>
          
          {update.ai_verdict && (
             <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl mb-6">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-2">Automated Audit Response</span>
                <p className="text-[11px] text-gray-400 italic leading-relaxed line-clamp-3">"{update.ai_verdict}"</p>
             </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-white/[0.05]">
             <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                   <CheckCircle2 size={16} />
                </div>
                <div>
                  <span className="block font-black text-emerald-400 text-base leading-none">{update.community_ticks ?? 0}</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest opacity-50">Community Confirms</span>
                </div>
             </div>
             <button className="p-3 bg-white/[0.04] border border-white/[0.1] rounded-xl text-gray-500 hover:text-white transition-all">
                <MoreVertical size={16} />
             </button>
          </div>
       </div>
    </div>
  );
}

// ── MAIN NGO ADMIN PAGE ───────────────────────────────────────────────────────
export default function NGOAdminDashboard() {
  const { id } = useParams();
  const [ngo, setNgo] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNgoData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/ngos/${id}`);
      if (!res.ok) throw new Error("Database connectivity issue or NGO not found");
      const data = await res.json();
      setNgo(data.ngo || data);
      const upd = data.proof_updates || data.updates || [];
      setUpdates(upd.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchNgoData(); }, [fetchNgoData]);

  const handleVerified = async (payload) => {
    try {
      const res = await fetch(`${API}/api/v1/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, ngo_id: id })
      });
      if (res.ok) {
        // Refetch to reflect the new state immediately
        fetchNgoData();
      }
    } catch (e) {
      console.error("Critical failure publishing update:", e);
    }
  };

  if (loading) return (
     <div className="min-h-screen bg-[#040a04] flex items-center justify-center">
        <div className="flex flex-col items-center gap-8">
           <div className="w-20 h-20 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_40px_rgba(16,185,129,0.3)]" />
           <p className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.6em] animate-pulse">Syncing Command Center</p>
        </div>
     </div>
  );

  if (error || !ngo) return (
     <div className="min-h-screen bg-[#040a04] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-red-600/5 border border-red-500/20 rounded-[3rem] p-12 text-center space-y-8 animate-fade-in">
           <ShieldX size={64} className="text-red-500 mx-auto opacity-40 shadow-[0_0_50px_rgba(239,68,68,0.2)]" />
           <h2 className="text-4xl font-black text-white tracking-tighter">Access Denied</h2>
           <p className="text-gray-500 text-sm font-medium leading-relaxed">{error || "Direct access restricted via DARPAN protocols."}</p>
           <button onClick={() => window.location.reload()} className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all active:scale-95 shadow-2xl">Re-Authenticate System</button>
        </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-[#040a04] text-white selection:bg-emerald-500/40 selection:text-black">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 pt-32 pb-40 relative z-10">
        
        {/* NGO Status Alerts */}
        {ngo.blacklisted && (
          <div className="mb-12 p-10 bg-red-600/10 border-2 border-red-500/40 rounded-[3rem] flex items-center gap-10 shadow-2xl animate-fade-in overflow-hidden relative">
             <div className="absolute top-0 right-0 p-12 opacity-5">
                <ShieldX size={200} className="text-red-500" />
             </div>
             <div className="w-20 h-20 bg-red-600 rounded-[2rem] flex items-center justify-center shadow-xl shrink-0 animate-pulse">
                <ShieldX size={40} className="text-white" />
             </div>
             <div className="relative z-10">
                <h3 className="text-3xl font-black text-red-500 uppercase tracking-tighter mb-2">Notice: Authority Blockade Active</h3>
                <p className="text-gray-400 font-bold text-base leading-relaxed max-w-2xl">Our global listing and funding channels are suspended by the central authority. Verification benchmarks must be met to reinstate operational status.</p>
             </div>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 animate-fade-in">
           <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                 <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2 shadow-2xl ${ngo.verified && !ngo.blacklisted ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-red-600 text-white border-red-500'}`}>
                    {ngo.blacklisted ? 'Status: Suspended' : ngo.verified ? 'Status: Verified' : 'Status: Review En Route'}
                 </span>
                 <span className="px-5 py-2 rounded-full bg-white/[0.04] border border-white/[0.1] text-gray-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                   <Database size={12} className="text-teal-500" /> Identifier: DARPAN-{id.slice(0,8).toUpperCase()}
                 </span>
              </div>
              <div>
                <h1 className="text-7xl font-black tracking-tighter text-white uppercase leading-none mb-4">Command <span className="text-teal-500">Center</span></h1>
                <p className="text-gray-400 text-xl font-medium max-w-2xl leading-relaxed italic">Managing "{ngo.name}" impact transparency portfolio.</p>
              </div>
           </div>

           <div className="flex flex-wrap gap-4">
              <button 
                onClick={fetchNgoData}
                className="p-6 bg-white/[0.04] border border-white/[0.08] hover:border-teal-500/30 rounded-[2rem] shadow-2xl transition-all active:scale-90"
              >
                 <RefreshCw size={24} className={loading ? "animate-spin" : "text-gray-500 group-hover:text-teal-400"} />
              </button>
              <button className="flex items-center gap-4 px-10 py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-teal-400 transition-all hover:scale-105 active:scale-95">
                 <Settings size={22} className="text-black" /> Account Protocols
              </button>
           </div>
        </div>

        {/* Audit Intelligence Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
           <AdminStat icon={ShieldCheck} label="Public Impact Evidence" value={ngo.verified_proofs ?? 0} color="#10b981" />
           <AdminStat icon={Target} label="Objectives Finalized" value={`${ngo.milestones_done ?? 0}/${ngo.milestones_total ?? 0}`} color="#3b82f6" />
           <AdminStat icon={Zap} label="Authority Trust Score" value={`${ngo.gov_points ?? 0} pts`} color="#fbcfe8" />
           <AdminStat icon={TrendingUp} label="Public Confirmations" value={updates.reduce((s,u)=>s+(u.community_ticks??0), 0)} color="#a855f7" />
        </section>

        {/* Dashboard Architecture */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-16 items-start">
           
           {/* Primary Channel: NGO Activity Upload */}
           <div className="xl:col-span-2 space-y-16">
              
              {/* Critical Notice: Document Subpoena */}
              {ngo.pending_doc_request && (
                <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-[3rem] p-12 shadow-2xl animate-fade-in-up">
                   <div className="flex items-center gap-6 mb-8">
                      <div className="w-16 h-16 bg-amber-500 rounded-[2rem] flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                        <FileText size={32} className="text-black" />
                      </div>
                      <h3 className="text-3xl font-black text-amber-500 uppercase tracking-tighter leading-none">Security Brief: <br/>Mandatory Audit Request</h3>
                   </div>
                   <div className="p-8 bg-black/50 border border-white/10 rounded-[2rem] mb-10 overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                         <Info size={100} className="text-white" />
                      </div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Authority Logic</p>
                      <p className="text-lg text-gray-300 leading-relaxed italic font-black">"{ngo.doc_request_reason || 'Provide high-fidelity evidence for Q4 project milestones.'}"</p>
                   </div>
                   <button className="w-full py-6 bg-amber-500 text-black font-black uppercase tracking-[0.3em] rounded-3xl shadow-[0_20px_50px_rgba(245,158,11,0.2)] hover:bg-amber-400 transition-all hover:scale-[1.02] active:scale-95">
                     Deploy Requested Documents
                   </button>
                </div>
              )}

              {/* Core System: Proof Verification Vault */}
              <ProofUploader 
                ngoId={id} 
                onVerified={handleVerified}
              />

              {/* Verified Ledger Preview */}
              <div className="space-y-10">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Impact Ledger</h2>
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Publicly broadcasted field activity</p>
                    </div>
                    <span className="text-[10px] font-black px-5 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-2xl text-gray-500 uppercase tracking-widest">
                       {updates.length} TOTAL VERIFIED ENTRIES
                    </span>
                 </div>
                 
                 {updates.length === 0 ? (
                    <div className="py-32 text-center bg-white/[0.01] border-2 border-dashed border-white/[0.08] rounded-[3rem] animate-pulse">
                       <Activity size={48} className="text-gray-800 mx-auto mb-6" />
                       <h3 className="text-2xl font-black text-gray-700 uppercase tracking-tighter">No Active Ledger Records</h3>
                       <p className="text-[10px] text-gray-800 font-black uppercase tracking-[0.4em] mt-2">Begin field evidence broadcast above</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       {updates.slice(0, 10).map((u, i) => (
                         <UpdateItem key={u.id || i} update={u} />
                       ))}
                    </div>
                 )}
              </div>
           </div>

           {/* Secondary Channel: AI Intelligence Suite */}
           <div className="space-y-12 xl:sticky xl:top-36 animate-fade-in-up">
              
              {/* AI Narrative Orchestrator */}
              <div className="relative overflow-hidden bg-white/[0.02] border border-white/[0.1] rounded-[3rem] p-1 shadow-2xl">
                 <div className="p-8">
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-10 h-10 bg-teal-500/20 border border-teal-500/40 rounded-xl flex items-center justify-center text-teal-400">
                          <Sparkles size={20} />
                       </div>
                       <h3 className="text-xl font-black uppercase tracking-tighter leading-none text-white">Narrative <br/><span className="text-teal-500">Intelligence</span></h3>
                    </div>
                    <AIRewritePanel ngoName={ngo.name} />
                 </div>
              </div>

              {/* Sector Compliance Tools */}
              <div className="relative overflow-hidden bg-white/[0.02] border border-white/[0.1] rounded-[3rem] p-1 shadow-2xl">
                 <div className="p-8">
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/40 rounded-xl flex items-center justify-center text-blue-400">
                          <BarChart3 size={20} />
                       </div>
                       <h3 className="text-xl font-black uppercase tracking-tighter leading-none text-white">Resource <br/><span className="text-blue-500">Analytics</span></h3>
                    </div>
                    <AIResourcesPanel 
                      ngoName={ngo.name} 
                      category={ngo.category} 
                      city={ngo.city}
                      goal={ngo.latest_project_description || "Scale social impact transparency."}
                    />
                 </div>
              </div>

              {/* Integrity Handbook */}
              <div className="p-10 bg-teal-600/10 border border-teal-500/20 rounded-[3rem] relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ShieldCheck size={120} className="text-teal-500" />
                 </div>
                 <div className="relative z-10">
                    <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center shadow-2xl mb-8">
                       <Info size={24} className="text-white" />
                    </div>
                    <h4 className="text-teal-400 font-black text-lg uppercase tracking-widest mb-4 leading-tight">Operating Protocols</h4>
                    <p className="text-[12px] text-gray-400 leading-relaxed font-bold mb-8">To maintain a transparency score {'>'} 85%, ensure visual evidence captures on-field community engagement. Avoid studio environments.</p>
                    <button className="text-[10px] font-black text-white hover:text-teal-400 transition-all uppercase tracking-[0.4em] flex items-center gap-2 group-hover:translate-x-2">
                       Protocol Docs <ChevronRight size={14} className="opacity-50" />
                    </button>
                 </div>
              </div>

           </div>

        </div>
      </main>

      {/* Authority Watermark */}
      <div className="fixed bottom-10 left-10 flex items-center gap-4 opacity-10 pointer-events-none select-none z-0">
         <Globe size={32} className="text-teal-500" />
         <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white leading-none">Sustainify Integrity Infrastructure</span>
            <span className="text-[8px] font-black text-teal-500 uppercase tracking-[0.2em] mt-1">Global Transparency System v2.0.4 - Audit Secure</span>
         </div>
      </div>
    </div>
  );
}
