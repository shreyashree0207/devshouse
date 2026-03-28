// @ts-nocheck
"use client";

import { useState } from "react";
import { 
  Sparkles, Loader2, Send, 
  MessageSquare, Users, ShieldCheck, 
  ChevronRight, Copy, CheckCircle2,
  RefreshCw, Globe, ArrowRight,
  Target, BarChart3, Quote
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const RewriteCard = ({ title, content, icon: Icon, color = "#14b8a6" }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group relative bg-[#0b1219]/[0.6] border border-white/[0.08] rounded-[2rem] p-6 hover:border-teal-500/30 transition-all duration-300">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg flex items-center justify-center text-teal-400 bg-teal-500/10 border border-teal-500/20">
                    <Icon size={16} />
                 </div>
                 <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{title}</h4>
              </div>
              <button 
                onClick={handleCopy}
                className="p-2 transition-all hover:scale-110 active:scale-90 text-gray-500 hover:text-teal-400"
                title="Copy to clipboard"
              >
                {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
           </div>
           <p className="text-sm text-gray-400 leading-relaxed font-medium italic">"{content}"</p>
        </div>
    );
};

export default function AIRewritePanel({ ngoName }) {
    const [rawText, setRawText] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleRewrite = async () => {
        if (!rawText.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`${API}/ai/rewrite-update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ngo_name: ngoName, raw_text: rawText })
            });
            if (!res.ok) throw new Error("Narrative Intelligence offline");
            const result = await res.json();
            setResult(result);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 font-black">
            {!result ? (
               <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <MessageSquare size={12} className="text-teal-500" /> Raw Impact Notes
                     </span>
                  </div>
                  <textarea 
                    value={rawText}
                    onChange={e => setRawText(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-teal-500/50 min-h-[140px] transition-all font-medium resize-none placeholder:text-gray-700"
                    placeholder="e.g. Completed a high quality cleaning drive at Marine Drive today. 20 volunteers helped us collect 10kg plastic..."
                  />
                  <button 
                    onClick={handleRewrite}
                    disabled={loading || !rawText.trim()}
                    className="w-full py-4 bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-teal-500 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 disabled:opacity-50"
                  >
                     {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                     Optimize Mission Narrative
                  </button>
                  <p className="text-[9px] text-gray-600 text-center uppercase tracking-[0.2em] font-bold mt-4">AI generates audience-specific versions for donors and authorities</p>
               </div>
            ) : (
                <div className="space-y-4 animate-fade-in">
                   <RewriteCard title="Public Broadcast" content={result.description} icon={Globe} />
                   <RewriteCard title="Donor Summary" content={result.donor_summary} icon={Users} />
                   <RewriteCard title="Audit Protocol Version" content={result.gov_summary} icon={ShieldCheck} />
                   
                   <button 
                     onClick={() => setResult(null)}
                     className="w-full mt-4 flex items-center justify-center gap-2 text-[9px] text-teal-400 font-black uppercase tracking-[0.3em] hover:text-white transition-all py-3 border border-white/[0.05] rounded-xl bg-white/[0.02] hover:bg-teal-500/10"
                   >
                      <RefreshCw size={12} /> New Narrative Draft
                   </button>
                </div>
            )}
        </div>
    );
}
