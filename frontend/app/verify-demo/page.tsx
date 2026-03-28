"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Upload, Camera, ArrowRight, Image, 
  Layers, ScanLine, Sparkles, ChevronLeft, Eye
} from 'lucide-react';
import Link from 'next/link';
import VerificationResultCard from '../../components/VerificationResultCard';
import CrowdVoting from '../../components/CrowdVoting';
import ImpactFeed from '../../components/ImpactFeed';
import NgoHealthDashboard from '../../components/NgoHealthDashboard';

export default function VerifyDemoPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [ngoCity, setNgoCity] = useState('Chennai');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'verify' | 'feed' | 'health'>('verify');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleVerify = async () => {
    if (!imageFile) return;
    setVerifying(true);
    setResult(null);

    try {
      // Try backend first
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('description', description || 'NGO project activity');
      formData.append('ngo_city', ngoCity);
      formData.append('ngo_state', 'Tamil Nadu');

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/v1/ai/verify-file`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        // Fallback: Use Gemini directly from frontend
        await fallbackVerify();
      }
    } catch {
      await fallbackVerify();
    } finally {
      setVerifying(false);
    }
  };

  const fallbackVerify = async () => {
    // Direct Gemini call from frontend as fallback
    const KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!KEY) {
      setResult({
        layer1_authenticity: { is_real: false, confidence: 0, type: "unknown", reason: "No API key configured", signals_detected: [] },
        layer2_relevance: { matches_description: false, confidence: 0, reason: "No API key", detected_objects: [] },
        layer3_geo_consistency: { location_plausible: false, confidence: 0, reason: "No API key", detected_region_cues: [] },
        overall_trust_score: 0,
        verdict: "REJECTED",
        verdict_reason: "API key not configured. Set NEXT_PUBLIC_GEMINI_API_KEY in .env.local",
        tags: [], spoofing_flags: ["no_api_key"], authentic: false,
      });
      return;
    }

    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(imageFile!);
    });
    const base64 = await base64Promise;

    const URL_API = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`;

    const prompt = `You are a fraud detection AI for Sustainify.
This image was uploaded as proof: "${description || 'NGO project activity'}"
NGO location: ${ngoCity}, Tamil Nadu

Respond ONLY with this JSON:
{
  "short_description": "a small, concise, and catchy 1-sentence description of the image content only",
  "layer1_authenticity": { "is_real": true/false, "confidence": 0-100, "type": "real_photo"/"ai_generated"/"stock_image", "reason": "...", "signals_detected": [] },
  "layer2_relevance": { "matches_description": true/false, "confidence": 0-100, "reason": "...", "detected_objects": [] },
  "layer3_geo_consistency": { "location_plausible": true/false, "confidence": 0-100, "reason": "...", "detected_region_cues": [] },
  "overall_trust_score": 0-100,
  "verdict": "VERIFIED"/"FLAGGED"/"REJECTED",
  "verdict_reason": "2 sentence honest assessment",
  "tags": [],
  "spoofing_flags": [],
  "authentic": true if score>=70,
  "requires_manual_review": true if 50-70
}

**STRICT RULE**: DO NOT include any technical metadata or literal coordinate numbers (like 0.0, 0, or 0.0.0.0) in the 'short_description', 'verdict_reason', or any layer reasoning. If location metadata is zero/missing, simply focus on visual environment matching.`;

    try {
      const res = await fetch(URL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: imageFile!.type || 'image/jpeg', data: base64 } },
              { text: prompt }
            ]
          }]
        })
      });

      const data = await res.json();
      const text = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      setResult(parsed);
    } catch (err) {
      console.error('Fallback verification failed:', err);
      setResult({
        layer1_authenticity: { is_real: false, confidence: 0, type: "unknown", reason: "Verification failed", signals_detected: [] },
        layer2_relevance: { matches_description: false, confidence: 0, reason: "Error", detected_objects: [] },
        layer3_geo_consistency: { location_plausible: false, confidence: 0, reason: "Error", detected_region_cues: [] },
        overall_trust_score: 0,
        verdict: "REJECTED",
        verdict_reason: "Verification failed. Please try again.",
        tags: [], spoofing_flags: ["error"], authentic: false,
      });
    }
  };

  const tabs = [
    { key: 'verify', label: 'Image Verify', icon: <ShieldCheck size={16} /> },
    { key: 'feed', label: 'Impact Feed', icon: <Sparkles size={16} /> },
    { key: 'health', label: 'NGO Health', icon: <Layers size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a110a] text-white font-jakarta">
      {/* Ambient */}
      <div className="fixed top-0 right-0 w-[50vw] h-[50vh] bg-[#16a34a] opacity-[0.02] rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[40vw] h-[40vh] bg-cyan-500 opacity-[0.01] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 py-12 pt-28 space-y-10">
        {/* Back + Title */}
        <div className="flex items-center gap-4">
          <Link href="/" className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all">
            <ChevronLeft size={20} className="text-gray-400" />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              AI Verification <span className="text-[#16a34a]">Engine</span>
            </h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
              Multi-layer proof analysis powered by Gemini
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === t.key 
                  ? 'bg-[#16a34a] text-black shadow-[0_8px_20px_rgba(22,163,94,0.3)]' 
                  : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ──────────── VERIFY TAB ──────────── */}
          {activeTab === 'verify' && (
            <motion.div key="verify" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left: Upload */}
                <div className="space-y-6">
                  {/* Upload Zone */}
                  <div 
                    onClick={() => fileRef.current?.click()} 
                    className={`relative cursor-pointer rounded-[2.5rem] border-2 border-dashed overflow-hidden transition-all group ${
                      imagePreview ? 'border-[#16a34a]/30 bg-black/40' : 'border-white/10 bg-white/[0.02] hover:border-[#16a34a]/20'
                    }`}
                    style={{ minHeight: '300px' }}
                  >
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="w-full h-80 object-cover rounded-[2.3rem]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-[2.3rem]" />
                        <div className="absolute bottom-6 left-6 right-6">
                          <span className="px-4 py-2 bg-[#16a34a]/20 backdrop-blur-md border border-[#16a34a]/30 rounded-xl text-[10px] font-black text-[#16a34a] uppercase tracking-widest">
                            ✓ Image Selected — Click to change
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 gap-6">
                        <div className="w-20 h-20 bg-[#16a34a]/5 rounded-full flex items-center justify-center border border-[#16a34a]/20 group-hover:scale-110 transition-transform">
                          <Camera size={32} className="text-[#16a34a]" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-lg font-black uppercase tracking-tight">Upload proof image</p>
                          <p className="text-xs text-gray-500 font-bold px-10">
                            Drop an NGO proof photo to run multi-layer AI verification
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description + City */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Activity Description</label>
                      <input 
                        value={description} 
                        onChange={e => setDescription(e.target.value)}
                        placeholder="e.g. Tree planting drive in Adyar, Chennai"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#16a34a] outline-none transition-all placeholder:text-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">NGO City</label>
                      <select 
                        value={ngoCity} onChange={e => setNgoCity(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                      >
                        {['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Thanjavur', 'Tirunelveli', 'Vellore', 'Erode', 'Kanchipuram'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Verify button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleVerify}
                    disabled={!imageFile || verifying}
                    className={`w-full py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all ${
                      imageFile && !verifying
                        ? 'bg-[#16a34a] text-black shadow-[0_10px_30px_rgba(22,163,94,0.3)] hover:shadow-[0_15px_40px_rgba(22,163,94,0.4)]'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ScanLine size={18} />
                    {verifying ? 'Analyzing...' : 'Run 3-Layer Verification'}
                  </motion.button>

                  {/* Feature badges */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Authenticity', desc: 'AI vs Real vs Stock', icon: <Eye size={16} /> },
                      { label: 'Relevance', desc: 'Content matching', icon: <Image size={16} /> },
                      { label: 'Geo Match', desc: 'Location check', icon: <ScanLine size={16} /> },
                    ].map((f, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center space-y-2">
                        <div className="text-[#16a34a] flex justify-center">{f.icon}</div>
                        <p className="text-[10px] font-black text-white uppercase tracking-tight">{f.label}</p>
                        <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Results */}
                <div className="space-y-6">
                  <VerificationResultCard result={result} loading={verifying} />
                  
                  {result && !verifying && (
                    <CrowdVoting 
                      proofId="demo-proof-1"
                      aiScore={result.overall_trust_score}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ──────────── FEED TAB ──────────── */}
          {activeTab === 'feed' && (
            <motion.div key="feed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="max-w-2xl mx-auto">
                <ImpactFeed />
              </div>
            </motion.div>
          )}

          {/* ──────────── HEALTH TAB ──────────── */}
          {activeTab === 'health' && (
            <motion.div key="health" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid md:grid-cols-2 gap-8">
                <NgoHealthDashboard 
                  ngoName="GreenSteps Foundation"
                  data={{
                    proof_upload_rate: 80,
                    milestone_speed: 60,
                    avg_ai_score: 86,
                    verified_proofs: 12,
                    total_proofs: 15,
                    total_donors: 45,
                    total_activities: 8,
                    verified_activities: 5,
                    suspicious_flags: 0,
                    health_status: 'good',
                  }}
                />
                <NgoHealthDashboard 
                  ngoName="Udaan Education Trust"
                  data={{
                    proof_upload_rate: 95,
                    milestone_speed: 85,
                    avg_ai_score: 92,
                    verified_proofs: 28,
                    total_proofs: 30,
                    total_donors: 120,
                    total_activities: 12,
                    verified_activities: 10,
                    suspicious_flags: 0,
                    health_status: 'excellent',
                  }}
                />
                <NgoHealthDashboard 
                  ngoName="Quick Cash NGO"
                  data={{
                    proof_upload_rate: 30,
                    milestone_speed: 20,
                    avg_ai_score: 35,
                    verified_proofs: 3,
                    total_proofs: 10,
                    total_donors: 5,
                    total_activities: 6,
                    verified_activities: 1,
                    suspicious_flags: 3,
                    health_status: 'critical',
                  }}
                />
                <NgoHealthDashboard 
                  ngoName="Namma Medics"
                  data={{
                    proof_upload_rate: 65,
                    milestone_speed: 50,
                    avg_ai_score: 68,
                    verified_proofs: 8,
                    total_proofs: 12,
                    total_donors: 30,
                    total_activities: 5,
                    verified_activities: 3,
                    suspicious_flags: 1,
                    health_status: 'warning',
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
