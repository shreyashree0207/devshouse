// @ts-nocheck
"use client";

import { useState, useRef } from "react";
import { 
  Camera, UploadCloud, Loader2, CheckCircle2, 
  AlertTriangle, ShieldCheck, Activity, Sparkles,
  Zap, FileText, Globe, Flame, XCircle
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ProofUploader({ ngoId, onVerified }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, verifying, success, error
  const [aiResult, setAiResult] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setStatus("idle");
    setAiResult(null);
    setTitle("");
    setDescription("");
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const runVerification = async () => {
    if (!file || !title || !description) return;
    setStatus("verifying");
    
    try {
      // 1. AI Verification
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ngo_id", ngoId);
      formData.append("description", description);
      
      const aiRes = await fetch(`${API}/api/v1/ai/verify-file`, {
        method: "POST",
        body: formData,
      });

      if (!aiRes.ok) throw new Error("AI Verification Failed");
      const result = await aiRes.json();
      setAiResult(result);

      // 2. Storage Upload
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error: storageError } = await supabase.storage
        .from("ngo-proofs")
        .upload(`${ngoId}/${fileName}`, file);

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from("ngo-proofs")
        .getPublicUrl(`${ngoId}/${fileName}`);

      // 3. Callback
      onVerified({
        title,
        description,
        image_url: publicUrl,
        ai_score: result.score,
        ai_verdict: result.verdict,
        labels: result.labels,
        image_hash: result.image_hash,
        duplicate_flag: result.duplicate_flag,
        duplicate_ngos: result.duplicate_ngos
      });

      setStatus("success");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.1] rounded-[2.5rem] p-8 space-y-8 animate-fade-in group">
        <div className="flex items-center gap-4 mb-6">
           <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-500">
              <Camera size={24} />
           </div>
           <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">AI Verification Hub</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Field Proof Submission System</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Update Title</label>
                 <input 
                   value={title}
                   onChange={e => setTitle(e.target.value)}
                   type="text" 
                   className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-all font-medium"
                   placeholder="e.g. Free Medical Camp Success"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Project Description</label>
                 <textarea 
                   value={description}
                   onChange={e => setDescription(e.target.value)}
                   className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-teal-500/50 min-h-[120px] transition-all font-medium resize-none"
                   placeholder="Describe what is happening in the photo..."
                 />
              </div>
           </div>

           <div className="space-y-4">
              {!preview ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer aspect-video rounded-3xl bg-white/[0.03] border-2 border-dashed border-white/10 hover:border-teal-500/50 transition-all flex flex-col items-center justify-center gap-4 group/drop"
                >
                   <UploadCloud size={32} className="text-gray-500 group-hover/drop:text-teal-400 group-hover/drop:scale-110 transition-all" />
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Select Proof Image</p>
                   <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                </div>
              ) : (
                <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 group/preview">
                   <img src={preview} alt="Upload Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-110" />
                   {status === "idle" && (
                     <div 
                       onClick={() => reset()}
                       className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                     >
                        <XCircle size={32} className="text-white" />
                     </div>
                   )}
                </div>
              )}
              
              <button 
                onClick={runVerification}
                disabled={status === "verifying" || !file || !title || !description}
                className="w-full py-4 bg-teal-500 text-black font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-teal-400 disabled:bg-white/5 disabled:text-gray-600 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {status === "verifying" ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : <Sparkles size={18} />}
                Deploy Field Proof
              </button>
           </div>
        </div>

        {aiResult && (
           <div className={`mt-8 p-6 rounded-[2rem] border-2 animate-fade-in-up ${aiResult.duplicate_flag ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
              <div className="flex items-start gap-4">
                 <div className="mt-1">
                    {aiResult.duplicate_flag ? <AlertTriangle size={24} /> : <ShieldCheck size={24} />}
                 </div>
                 <div>
                    <h4 className="text-lg font-black uppercase tracking-tighter mb-1">
                       {aiResult.duplicate_flag ? "Verification Warning" : "Integrity Confirmed"}
                    </h4>
                    <p className="text-sm font-medium mb-4 opacity-80">{aiResult.verdict}</p>
                    <div className="flex flex-wrap gap-2">
                       {aiResult.labels.map(l => (
                          <span key={l} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black tracking-widest uppercase opacity-60">#{l}</span>
                       ))}
                    </div>
                    {aiResult.duplicate_flag && aiResult.duplicate_ngos?.length > 0 && (
                       <div className="mt-4 p-4 bg-black/20 rounded-xl">
                          <p className="text-[10px] font-black uppercase mb-1 opacity-50">Original Source Match</p>
                          <p className="text-xs font-bold text-red-500">{aiResult.duplicate_ngos.join(", ")}</p>
                       </div>
                    )}
                 </div>
                 <div className="ml-auto flex flex-col items-center">
                    <span className="text-4xl font-black">{aiResult.score}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Score</span>
                 </div>
              </div>
           </div>
        )}
    </div>
  );
}