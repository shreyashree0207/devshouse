// @ts-nocheck
"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ShieldCheck, ShieldX, Clock, MapPin, 
  CheckCircle2, Loader2, RefreshCw, 
  FileText, Users, Target, Zap, Activity,
  LayoutDashboard, Search, Filter,
  MoreVertical, ChevronRight, BarChart3,
  AlertTriangle, Hammer, Scale, Info,
  ExternalLink, Globe, Trash2, Database,
  Fingerprint, Award, Newspaper
} from "lucide-react";
import Navbar from "../../components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── NGO Item Card for Authority Dashboard ──────────────────────────────────────
function GovNGOCard({ ngo, onAction, onRequestDocs }) {
  const isSuspended = ngo.blacklisted;
  const isVerified = ngo.verified && !isSuspended;

  return (
    <div className={`bg-[#0b1219] border rounded-[2rem] p-8 hover:bg-white/[0.04] transition-all duration-500 group relative ${isSuspended ? 'border-red-500/30' : isVerified ? 'border-emerald-500/30' : 'border-white/[0.08]'}`}>
       
       {/* Authority Sanction Badge */}
       {isSuspended && (
         <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <ShieldX size={120} className="text-red-500" />
         </div>
       )}

       {/* Grid Content */}
       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
          
          <div className="flex items-center gap-6">
             <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 ${isSuspended ? 'bg-red-600/10 border border-red-500/40 text-red-500' : isVerified ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400' : 'bg-white/5 border border-white/10 text-gray-500'}`}>
                {isSuspended ? <ShieldX size={32} /> : isVerified ? <ShieldCheck size={32} /> : <Clock size={32} />}
             </div>
             <div>
                <div className="flex items-center gap-3 mb-1">
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter group-hover:text-emerald-400 transition-colors">{ngo.name}</h3>
                   {isVerified && <CheckCircle2 size={16} className="text-emerald-400" />}
                </div>
                <div className="flex flex-wrap items-center gap-4">
                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{ngo.category} • {ngo.city}</span>
                   <span className="text-[10px] font-black text-teal-500 uppercase tracking-widest bg-teal-500/5 px-2 py-0.5 rounded-lg border border-teal-500/20">DARPAN-ID: {ngo.id.slice(0, 8).toUpperCase()}</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center md:text-left">
             <div className="space-y-1">
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest block">Impact Verification</span>
                <span className={`text-xl font-black ${isVerified ? 'text-emerald-400' : 'text-white'}`}>{ngo.verified_proofs || 0} PROOFS</span>
             </div>
             <div className="space-y-1">
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest block">Trust Score</span>
                <span className="text-xl font-black text-white">{ngo.gov_points || 0} PTS</span>
             </div>
             <div className="space-y-1">
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest block">Updates</span>
                <span className="text-xl font-black text-gray-400">{ngo.total_updates || 0} TOTAL</span>
             </div>
             <div className="space-y-1">
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest block">Doc Status</span>
                <span className={`text-xl font-black ${ngo.pending_doc_request ? 'text-amber-500' : 'text-emerald-500'}`}>
                   {ngo.pending_doc_request ? 'PENDING' : 'SECURE'}
                </span>
             </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             {!isVerified && !isSuspended && (
               <button 
                 onClick={() => onAction('verify')} 
                 className="px-6 py-3 bg-emerald-500 text-black font-black uppercase tracking-widest text-[9px] rounded-xl flex items-center gap-2 hover:bg-emerald-400 shadow-xl transition-all hover:scale-105 active:scale-95"
               >
                  <ShieldCheck size={14} /> Verify NGO
               </button>
             )}
             {!isSuspended && (
               <button 
                 onClick={() => onAction('blacklist')}
                 className="px-6 py-3 bg-red-600 text-white font-black uppercase tracking-widest text-[9px] rounded-xl flex items-center gap-2 hover:bg-red-500 shadow-xl transition-all hover:scale-105 active:scale-95"
               >
                  <Hammer size={14} /> Suspend NGO
               </button>
             )}
             {isSuspended && (
               <button 
                 onClick={() => onAction('reinstate')}
                 className="px-6 py-3 bg-emerald-600 text-white font-black uppercase tracking-widest text-[9px] rounded-xl flex items-center gap-2 hover:bg-emerald-500 shadow-xl transition-all hover:scale-105 active:scale-95"
               >
                  <RefreshCw size={14} /> Reinstate
               </button>
             )}
             <button 
               onClick={() => onRequestDocs(ngo)}
               className="px-6 py-3 bg-white/[0.04] border border-white/10 text-gray-400 font-black uppercase tracking-widest text-[9px] rounded-xl flex items-center gap-2 hover:bg-white hover:text-black shadow-xl transition-all hover:scale-105 active:scale-95"
             >
                <FileText size={14} /> Request Specific Proof
             </button>
          </div>

       </div>
    </div>
  );
}

// ── AUTHORITY DASHBOARD MAIN PAGE ──────────────────────────────────────────────
export default function GovDashboard() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [docReason, setDocReason] = useState("");

  const fetchNgos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/gov/ngos`);
      if (!res.ok) throw new Error("Authority directory sync failed");
      const data = await res.json();
      setNgos(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNgos(); }, [fetchNgos]);

  const handleAction = async (ngoId, action) => {
    try {
      const res = await fetch(`${API}/gov/ngos/${ngoId}/${action}`, { method: "POST" });
      if (res.ok) fetchNgos();
    } catch (e) { console.error("Authority Command Center Failure:", e); }
  };

  const submitDocRequest = async () => {
    if (!selectedNgo || !docReason) return;
    try {
      const res = await fetch(`${API}/gov/ngos/${selectedNgo.id}/request-documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: docReason })
      });
      if (res.ok) {
        setSelectedNgo(null);
        setDocReason("");
        fetchNgos();
      }
    } catch (e) { console.error("Subpoena Generation Error:", e); }
  };

  if (loading) return (
     <div className="min-h-screen bg-[#040a04] flex items-center justify-center">
        <div className="flex flex-col items-center gap-8">
           <div className="w-20 h-20 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_50px_rgba(16,185,129,0.3)]" />
           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.6em] animate-pulse">Establishing Secure Authority Sync</p>
        </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-[#040a04] text-white selection:bg-emerald-400 selection:text-black pb-40">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 pt-32 z-10 relative">
        
        {/* Dash Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 animate-fade-in">
           <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Scale size={24} className="text-black" />
                 </div>
                 <span className="text-[12px] font-black text-emerald-500 uppercase tracking-[0.6em]">Authorized Command Center</span>
              </div>
              <h1 className="text-7xl font-black text-white uppercase tracking-tighter leading-none">Integrity <br/><span className="text-teal-500">Infrastructure</span></h1>
              <p className="text-gray-500 text-xl font-medium max-w-2xl leading-relaxed italic">Managing India's NGO transparency ecosystem through cryptographic impact monitoring.</p>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-3 gap-8 p-10 bg-white/[0.02] border border-white/[0.08] rounded-[3rem] shadow-2xl">
              <div>
                 <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest block mb-1">Impact Population</span>
                 <span className="text-4xl font-black">{ngos.length} ENTITIES</span>
              </div>
              <div>
                 <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest block mb-1">Platform Proofs</span>
                 <span className="text-4xl font-black text-white">{ngos.reduce((s,n)=>s+(n.total_updates || 0), 0)}</span>
              </div>
              <button 
                onClick={fetchNgos}
                className="p-4 bg-emerald-500 text-black rounded-2xl flex items-center justify-center hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                 <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
              </button>
           </div>
        </div>

        {/* Intelligence Filters - Placeholder UI */}
        <div className="flex flex-wrap items-center gap-6 mb-12">
            <div className="flex-1 min-w-[300px] relative group">
               <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-hover:text-emerald-400 transition-colors" />
               <input type="text" placeholder="CRITICAL SEARCH: DARPAN-ID, NGO NAME, SECTOR" className="w-full bg-white/[0.03] border-2 border-white/[0.08] rounded-2xl py-4.5 px-14 text-sm font-black text-white uppercase tracking-widest focus:outline-none focus:border-emerald-500/30 transition-all placeholder:text-gray-700" />
            </div>
            <button className="flex items-center gap-3 px-8 py-4.5 bg-white/[0.03] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">
               <Filter size={14} /> Filter Logic
            </button>
        </div>

        {/* Directory Cluster */}
        <div className="space-y-8">
           {ngos.length === 0 ? (
             <div className="py-40 text-center border-2 border-dashed border-white/[0.06] rounded-[5rem] animate-pulse">
                <Database size={64} className="text-gray-800 mx-auto mb-8" />
                <h3 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Directory Empty</h3>
                <p className="text-[10px] text-gray-800 font-bold uppercase tracking-[0.5em] mt-2">Authority connection establishes cluster registration</p>
             </div>
           ) : (
             ngos.map(ngo => (
               <GovNGOCard 
                 key={ngo.id} 
                 ngo={ngo} 
                 onAction={(action) => handleAction(ngo.id, action)} 
                 onRequestDocs={setSelectedNgo}
               />
             ))
           )}
        </div>
      </main>

      {/* Document Request Modal Infrastructure */}
      {selectedNgo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-8 animate-fade-in">
           <div className="max-w-2xl w-full bg-[#0b1219] border border-emerald-500/20 rounded-[3rem] p-12 shadow-[0_40px_100px_rgba(16,185,129,0.1)] relative overflow-hidden animate-scale-in">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <FileText size={200} className="text-emerald-500" />
              </div>
              <button 
                onClick={() => setSelectedNgo(null)}
                className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
              >
                 <ShieldX size={32} />
              </button>

              <div className="flex items-center gap-6 mb-12">
                 <div className="w-20 h-20 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                    <Fingerprint size={36} className="text-black" />
                 </div>
                 <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Security BRIEF <br/><span className="text-emerald-500">Subpoena</span></h2>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">{selectedNgo.name}</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Official Reasoning for Audit Request</label>
                    <textarea 
                      value={docReason}
                      onChange={e => setDocReason(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-6 px-8 text-lg text-white font-black italic focus:outline-none focus:border-emerald-500/50 min-h-[160px] resize-none transition-all"
                      placeholder="e.g. Provide original financial audit records for the 'Education for All' project to clear recent transparency warnings."
                    />
                 </div>
                 
                 <div className="p-6 bg-red-600/10 border border-red-500/20 rounded-2xl flex items-start gap-4 mb-4">
                    <AlertTriangle size={24} className="text-red-500 mt-1 shrink-0" />
                    <p className="text-[11px] font-bold text-red-500/80 leading-relaxed uppercase tracking-widest">Deploying this subpoena will mark the NGO as 'Pending Audit' in the global transparency feed and restrict public funding until compliance is established.</p>
                 </div>

                 <button 
                   onClick={submitDocRequest}
                   className="w-full py-6 bg-emerald-500 text-black font-black uppercase tracking-[0.3em] rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.2)] hover:bg-emerald-400 transition-all active:scale-95"
                 >
                    Broadcast Submission Protocols
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Network Watermark */}
      <div className="fixed bottom-10 left-10 flex items-center gap-4 opacity-10 pointer-events-none select-none z-0">
         <ShieldCheck size={40} className="text-teal-500" />
         <div className="flex flex-col">
            <span className="text-[12px] font-black uppercase tracking-[0.4em] text-white leading-none">Sustainify Integrity Infrastructure</span>
            <span className="text-[8px] font-black text-teal-500 uppercase tracking-[0.2em] mt-1">Authority Command Node - Audit Secure v4.0.1</span>
         </div>
      </div>
    </div>
  );
}
