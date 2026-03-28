// @ts-nocheck
"use client";

import { useState } from "react";
import { 
  BarChart3, Loader2, ExternalLink, 
  BookOpen, Compass, ShieldCheck, Zap,
  Briefcase, CheckCircle2, ChevronRight
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AIResourcesPanel({ ngoName, category, city, goal }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const generateResources = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ngo_name: ngoName,
          category: category,
          city: city,
          goal: goal
        })
      });
      if (!res.ok) throw new Error("AI intelligence service temporarily unavailable");
      const result = await res.json();
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 font-black">
      {!data ? (
        <div className="text-center py-10 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl group/btn p-6">
           <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mx-auto mb-6 group-hover/btn:scale-110 transition-transform">
              <Compass size={24} />
           </div>
           <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-6 leading-relaxed">System Intelligence Ready to Curate Growth Assets</p>
           <button 
             onClick={generateResources}
             disabled={loading}
             className="w-full py-3.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 disabled:opacity-50"
           >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
              Activate Strategic Sync
           </button>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
           <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
              <p className="text-[11px] text-blue-300 italic leading-relaxed font-medium">"{data.summary}"</p>
           </div>
           
           <div className="space-y-3">
              {data.resources.map((res, i) => (
                <a 
                  key={i} 
                  href={res.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-4 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.06] hover:border-blue-500/30 transition-all group/card"
                >
                   <div className="flex items-start justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-[8px] text-blue-400 border border-blue-500/20 uppercase tracking-widest leading-none">
                         {res.type}
                      </span>
                      <ExternalLink size={12} className="text-gray-600 group-hover/card:text-blue-400 transition-colors" />
                   </div>
                   <h5 className="text-xs text-white uppercase tracking-tight mb-1">{res.title}</h5>
                   <p className="text-[10px] text-gray-500 line-clamp-1 italic">{res.description}</p>
                </a>
              ))}
           </div>

           <button 
             onClick={() => setData(null)}
             className="w-full py-2.5 bg-white/[0.04] border border-white/[0.08] text-gray-500 text-[9px] font-black uppercase tracking-widest rounded-xl hover:text-white transition-all flex items-center justify-center gap-2"
           >
              Refresh Analysis
           </button>
        </div>
      )}
    </div>
  );
}
