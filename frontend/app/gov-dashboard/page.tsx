// @ts-nocheck
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck, ShieldX, Clock, MapPin, Tag, AlertTriangle,
  CheckCircle2, Loader2, RefreshCw, FileText, Users, Target,
  Zap, Activity, Search, Filter, TrendingUp, MoreVertical,
  Flag, Ban, UploadCloud, ChevronRight
} from "lucide-react";
import Navbar from "../../components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── NGO Card Component ────────────────────────────────────────────────────────
function GovNGOCard({ ngo, onAction }) {
  const [loading, setLoading] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [docReason, setDocReason] = useState("");

  const handleStatusChange = async (action) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/gov/ngos/${ngo.id}/${action}`, { method: "POST" });
      if (res.ok) onAction();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDocs = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/gov/ngos/${ngo.id}/request-documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: docReason, document_types: ["Audit Report", "Visual Proof"] })
      });
      if (res.ok) {
        setShowDocModal(false);
        setDocReason("");
        onAction();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group relative bg-[#0b1219] border border-white/[0.08] rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-blue-500/30 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
      
      {/* Visual Indicator Background */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-10 ${ngo.blacklisted ? 'bg-red-500' : ngo.verified ? 'bg-emerald-500' : 'bg-amber-500'}`} />

      {/* Card Body */}
      <div className="p-8 pb-4 relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${ngo.blacklisted ? 'bg-red-500/10 border-red-500/20 text-red-400' : ngo.verified ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                {ngo.blacklisted ? <ShieldX size={28} /> : ngo.verified ? <ShieldCheck size={28} /> : <Clock size={28} />}
             </div>
             <div>
               <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{ngo.name}</h3>
               <div className="flex items-center gap-3 mt-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <span className="text-blue-500">{ngo.category}</span>
                  <span>•</span>
                  <span>{ngo.city}</span>
               </div>
             </div>
          </div>
          
          <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border-2 shadow-xl ${ngo.blacklisted ? 'bg-red-600 text-white border-red-500' : ngo.verified ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-amber-500 text-black border-amber-400'}`}>
             {ngo.blacklisted ? 'Suspended' : ngo.verified ? 'Approved' : 'Pending Review'}
          </div>
        </div>

        {/* Audit Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
           <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col items-center">
              <span className="text-[9px] font-black text-gray-600 uppercase mb-1">Impact</span>
              <span className="text-sm font-bold text-white">{ngo.verified_proofs ?? 0}</span>
           </div>
           <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col items-center">
              <span className="text-[9px] font-black text-gray-600 uppercase mb-1">Progress</span>
              <span className="text-sm font-bold text-white">{ngo.milestones_done ?? 0}/{ngo.milestones_total ?? 0}</span>
           </div>
           <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col items-center">
              <span className="text-[9px] font-black text-gray-600 uppercase mb-1">Audits</span>
              <span className="text-sm font-bold text-white">{ngo.total_updates ?? 0}</span>
           </div>
        </div>

        {/* Doc Request State */}
        {ngo.pending_doc_request && (
          <div className="mb-6 px-4 py-3 bg-blue-600/10 border border-blue-500/30 rounded-2xl flex items-center gap-3">
             <Activity size={14} className="text-blue-400 animate-pulse" />
             <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Document Submission Awaited</span>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="p-6 bg-black/40 border-t border-white/[0.05] grid grid-cols-2 gap-3">
         {!ngo.verified && !ngo.blacklisted && (
            <button 
              onClick={() => handleStatusChange('verify')} 
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <ShieldCheck size={14} /> Verify NGO
            </button>
         )}
         
         {ngo.blacklisted ? (
            <button 
              onClick={() => handleStatusChange('reinstate')} 
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <RefreshCw size={14} /> Reinstate
            </button>
         ) : (
            <button 
              onClick={() => handleStatusChange('blacklist')} 
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <Ban size={14} /> Suspend
            </button>
         )}

         <button 
           onClick={() => setShowDocModal(true)}
           disabled={loading}
           className="col-span-2 flex items-center justify-center gap-2 py-3 bg-white/[0.08] hover:bg-white/[0.12] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
         >
           <FileText size={14} /> Request Specific Proof
         </button>
      </div>

      {/* Doc Request Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#0d1520] border border-white/10 rounded-[3rem] p-10 shadow-2xl animate-fade-in-up">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                   <UploadCloud size={24} className="text-white" />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Issue Subpoena</h2>
                   <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Document Proof Request</p>
                </div>
             </div>
             
             <form onSubmit={handleRequestDocs} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Investigation Grounds</label>
                   <textarea
                     required
                     value={docReason}
                     onChange={(e) => setDocReason(e.target.value)}
                     className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-blue-500/50 min-h-[120px] transition-all"
                     placeholder="State the reason for mandatory document verification..."
                   />
                </div>

                <div className="flex gap-4 pt-4">
                   <button 
                     type="button" 
                     onClick={() => setShowDocModal(false)}
                     className="flex-1 py-4 bg-white/[0.05] text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white/[0.1] transition-all"
                   >
                     Withdraw
                   </button>
                   <button 
                     type="submit" 
                     className="flex-1 py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-500 shadow-xl transition-all"
                   >
                     Push Request
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function GovDashboard() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/gov/ngos`);
      if (!res.ok) throw new Error("Government Core unreachable");
      const data = await res.json();
      setNgos(Array.isArray(data) ? data : data.ngos || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredNgos = ngos.filter(n => {
    const matchesSearch = n.name.toLowerCase().includes(search.toLowerCase()) || n.city.toLowerCase().includes(search.toLowerCase());
    if (filter === "verified") return matchesSearch && n.verified && !n.blacklisted;
    if (filter === "suspended") return matchesSearch && n.blacklisted;
    if (filter === "pending") return matchesSearch && !n.verified && !n.blacklisted;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#04080c] text-white selection:bg-blue-500/30 overflow-x-hidden">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 pt-32 pb-40 relative z-10">
        
        {/* Statistics Banner */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
           {[
             { label: "Registered NGOs", value: ngos.length, icon: Users, color: "#3b82f6" },
             { label: "Approved Funds", value: "₹4.2Cr", icon: TrendingUp, color: "#10b981" },
             { label: "Active Suspensions", value: ngos.filter(n => n.blacklisted).length, icon: Ban, color: "#ef4444" },
             { label: "Impact Proofs", value: ngos.reduce((s,n)=>s+(n.verified_proofs??0), 0), icon: Zap, color: "#f59e0b" }
           ].map((stat, i) => (
             <div key={i} className="bg-white/[0.03] border border-white/[0.07] p-8 rounded-[2rem] hover:bg-white/[0.05] transition-all duration-500 group">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-black/40 border border-white/10 group-hover:scale-110 transition-transform">
                      <stat.icon size={20} style={{ color: stat.color }} />
                   </div>
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{stat.label}</span>
                </div>
                <div className="text-3xl font-black text-white">{stat.value}</div>
             </div>
           ))}
        </section>

        {/* Dashboard Control Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-10">
           <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                 <ShieldCheck size={14} /> Regulatory Control System v4.0.2
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-white">Central Monitoring <span className="text-blue-500">Authority</span></h1>
           </div>

           <div className="flex items-center gap-4">
              <div className="relative">
                 <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" />
                 <input 
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   type="text" 
                   placeholder="Search DARPAN Directory..." 
                   className="bg-white/[0.04] border border-white/[0.08] hover:border-white/20 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:outline-none focus:border-blue-500/50 w-full md:w-[320px] transition-all"
                 />
              </div>
              <button onClick={loadData} className="p-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl hover:text-blue-400 transition-all">
                 <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
              </button>
           </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-12 border-b border-white/[0.05] overflow-x-auto pb-4 scrollbar-hide">
           {[
             { id: 'all', label: 'All Entities' },
             { id: 'verified', label: 'Approved only' },
             { id: 'pending', label: 'Pending Review' },
             { id: 'suspended', label: 'Blacklisted' }
           ].map(f => (
             <button 
               key={f.id}
               onClick={() => setFilter(f.id)}
               className={`px-8 py-3 rounded-t-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${filter === f.id ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}
             >
               {f.label}
             </button>
           ))}
        </div>

        {/* NGOs Directory */}
        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-96 rounded-[2.5rem] bg-white/[0.03] border border-white/[0.06] animate-pulse" />
                ))}
             </div>
        ) : error ? (
            <div className="py-24 text-center bg-red-600/5 border border-red-500/20 rounded-[3rem]">
               <ShieldX size={48} className="text-red-500 mx-auto mb-6 opacity-30" />
               <h2 className="text-2xl font-black mb-2 text-white">Authority Connection Severed</h2>
               <p className="text-gray-500 text-sm mb-8">{error}</p>
               <button onClick={loadData} className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl">Re-Authenticate</button>
            </div>
        ) : filteredNgos.length === 0 ? (
          <div className="py-32 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-[3rem]">
             <Users size={48} className="text-gray-800 mx-auto mb-6" />
             <h3 className="text-2xl font-black text-gray-600">No matching entities found in current directory</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {filteredNgos.map(n => (
               <GovNGOCard key={n.id} ngo={n} onAction={loadData} />
             ))}
          </div>
        )}

      </main>

      {/* Authority Watermark */}
      <div className="fixed bottom-10 right-10 flex flex-col items-end opacity-20 pointer-events-none select-none">
         <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Department of Social Justice</span>
         <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">Digital Governance Initiative</span>
      </div>
    </div>
  );
}
