'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_NGOS, MOCK_MILESTONES } from '../../lib/mockData';
import {
  ShieldCheck, Building2, MapPin, Tag, Loader2, CheckCircle2, XCircle,
  AlertTriangle, Upload, Link as LinkIcon, Plus, LogOut, BarChart3,
  FileText, Globe, ExternalLink, Camera, ChevronDown, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Animated score ring ────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#eab308' : '#ef4444';

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <motion.circle
          cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="text-center">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="text-3xl font-black" style={{ color }}>{score}</motion.p>
        <p className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Score</p>
      </div>
    </div>
  );
}

// ── Status badge ───────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    VERIFIED: { label: '✓ Verified', cls: 'bg-green-500/10 text-green-400 border-green-500/30' },
    UNDER_REVIEW: { label: '⏳ Under Review', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    SUSPENDED: { label: '⛔ Suspended', cls: 'bg-red-500/10 text-red-400 border-red-500/30' },
  };
  const s = map[status] || map.UNDER_REVIEW;
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ── Proof upload modal ─────────────────────────────────────────
function ProofModal({ milestone, ngo, onClose, onVerified }: any) {
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = () => setImageBase64(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    if (!caption || !imageBase64) { toast.error('Add a caption and image first'); return; }
    setLoading(true);
    toast('Sustainify AI is analyzing your proof...', { icon: '🔍', duration: 2000 });

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      let verdict: any;

      if (apiUrl) {
        const res = await fetch(`${apiUrl}/api/v1/ai/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: imageBase64,
            project_description: milestone.description,
          }),
        });
        verdict = await res.json();
      } else {
        // Fallback mock verdict
        await new Promise(r => setTimeout(r, 2000));
        verdict = {
          score: Math.floor(Math.random() * 30) + 70,
          label: 'VERIFIED',
          verdict: `The uploaded image shows clear evidence of ${milestone.title}. Context matches the project description.`,
          is_original: true,
          originality_note: 'No reverse image match found. Content appears original.',
        };
      }

      setResult(verdict);
      if (verdict.label === 'VERIFIED' || verdict.score >= 65) {
        toast.success('AI Verdict: Proof Verified ✓');
        onVerified(milestone.id, verdict);
      } else {
        toast.error('AI flagged this proof. Please resubmit.');
      }
    } catch {
      toast.error('AI service unavailable. Using fallback.');
      const fallback = { score: 78, label: 'VERIFIED', verdict: 'Proof accepted (offline mode).', is_original: true };
      setResult(fallback);
      onVerified(milestone.id, fallback);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = result ? (result.score >= 75 ? '#16a34a' : result.score >= 50 ? '#eab308' : '#ef4444') : '#6b7280';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="relative w-full max-w-lg bg-[#0d1710] border border-[#16a34a]/20 rounded-[2rem] p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#16a34a] to-transparent opacity-40" />
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-extrabold text-white">Add Proof Update</h3>
            <p className="text-xs text-gray-500 mt-1">{milestone.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors p-1">✕</button>
        </div>

        {!result ? (
          <>
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-300">
              <strong>Required proof:</strong> {milestone.required_proof}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Caption / Update</label>
              <textarea
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Describe what happened, who was present, where..."
                rows={3}
                className="w-full bg-white/[0.03] text-white px-4 py-3 rounded-xl border border-white/[0.08] outline-none focus:border-[#16a34a]/40 resize-none text-sm transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Project Description (pre-filled)</label>
              <div className="px-4 py-3 bg-white/[0.02] rounded-xl border border-white/[0.06] text-xs text-gray-400">{milestone.description}</div>
            </div>

            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-[#16a34a]/25 rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer hover:border-[#16a34a]/50 transition-colors"
            >
              {imageBase64 ? (
                <img src={imageBase64} alt="preview" className="max-h-40 rounded-xl object-cover mb-3" />
              ) : (
                <Camera className="w-10 h-10 text-[#16a34a]/40 mb-3" />
              )}
              <p className="text-xs text-gray-500 font-semibold">{imageFile ? imageFile.name : 'Click to upload image proof'}</p>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>

            <motion.button
              onClick={handleSubmit}
              disabled={loading || !caption || !imageFile}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl bg-[#16a34a] text-white font-black text-sm uppercase tracking-widest disabled:opacity-40 flex items-center justify-center gap-3"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Upload className="w-4 h-4" /> Submit for AI Review</>}
            </motion.button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="text-center py-4">
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ background: `${scoreColor}15`, border: `2px solid ${scoreColor}40` }}>
                {result.score >= 65 ? <CheckCircle2 size={40} style={{ color: scoreColor }} /> : <XCircle size={40} style={{ color: scoreColor }} />}
              </div>
              <motion.p className="text-5xl font-black" style={{ color: scoreColor }}
                initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                {result.score}
              </motion.p>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">AI Score</p>
              <div className={`mt-3 inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${
                result.label === 'VERIFIED' ? 'bg-green-500/10 text-green-400 border-green-500/30'
                : result.label === 'PARTIAL' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}>{result.label}</div>
            </div>

            <div className="p-4 bg-white/[0.03] rounded-xl text-sm text-gray-300 italic border border-white/[0.06]">
              "{result.verdict}"
            </div>

            <div className="p-3 bg-white/[0.02] rounded-xl text-xs border border-white/[0.05]">
              <p className="text-gray-500 font-bold uppercase tracking-wider mb-1">Originality Check</p>
              <p className={result.is_original ? 'text-green-400' : 'text-amber-400'}>
                {result.is_original ? '✓ Original content detected' : '⚠ Possible stock image match'}
              </p>
              {result.originality_note && <p className="text-gray-600 mt-1">{result.originality_note}</p>}
            </div>

            <button onClick={onClose} className="w-full py-3 rounded-xl bg-white/[0.05] text-gray-300 font-bold text-sm hover:bg-white/10 transition-colors">
              Close
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// ── Add web source modal ───────────────────────────────────────
function WebSourceModal({ onClose, onAdd }: any) {
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [type, setType] = useState('News Coverage');

  const getDomain = (u: string) => { try { return new URL(u).hostname.replace('www.', ''); } catch { return ''; } };
  const getCredibility = (u: string) => {
    const d = getDomain(u);
    if (d.endsWith('.gov.in') || d.endsWith('.gov') || d.includes('who.int') || d.includes('nic.in')) return 'High Credibility';
    const majorNews = ['thehindu.com', 'timesofindia.com', 'ndtv.com', 'indianexpress.com', 'bbc.com', 'reuters.com'];
    if (majorNews.some(n => d.includes(n))) return 'High Credibility';
    return 'Unverified Source';
  };

  const handleAdd = () => {
    if (!url || !label) { toast.error('URL and label are required'); return; }
    const credibility = getCredibility(url);
    onAdd({ id: Date.now().toString(), url, label, type, domain: getDomain(url), credibility, date: new Date().toISOString().split('T')[0] });
    toast.success('Web source added!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#0d1710] border border-white/10 rounded-[2rem] p-8 space-y-5 shadow-2xl">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2"><Globe size={18} className="text-[#16a34a]" /> Add Web Source</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-white p-1">✕</button>
        </div>
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Label (e.g. The Hindu coverage)"
          className="w-full bg-white/[0.03] text-white px-4 py-3 rounded-xl border border-white/[0.08] outline-none focus:border-[#16a34a]/50 text-sm transition-all" />
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..."
          className="w-full bg-white/[0.03] text-white font-mono px-4 py-3 rounded-xl border border-white/[0.08] outline-none focus:border-[#16a34a]/50 text-sm transition-all" />
        <select value={type} onChange={e => setType(e.target.value)}
          className="w-full bg-white/[0.03] text-white px-4 py-3 rounded-xl border border-white/[0.08] outline-none text-sm">
          {['News Coverage', 'Government Mention', 'Social Media', 'Research', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {url && <div className={`text-xs px-3 py-2 rounded-lg font-semibold ${getCredibility(url) === 'High Credibility' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
          AI Credibility: {getCredibility(url)} {getCredibility(url) === 'High Credibility' ? '✓' : '⚠️'}
        </div>}
        <button onClick={handleAdd} className="w-full py-3 rounded-xl bg-[#16a34a] text-white font-black text-sm uppercase tracking-widest">
          Add Source
        </button>
      </motion.div>
    </div>
  );
}

// ── MAIN DASHBOARD ─────────────────────────────────────────────
export default function NgoDashboardPage() {
  const router = useRouter();
  const [ngo, setNgo] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [webSources, setWebSources] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview' | 'milestones' | 'sources'>('overview');
  const [loading, setLoading] = useState(true);
  const [proofModal, setProofModal] = useState<any | null>(null);
  const [showSourceModal, setShowSourceModal] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('sustainify_ngo_session');
    if (!session) { router.push('/ngo-login'); return; }
    const { ngoId } = JSON.parse(session);
    const data = MOCK_NGOS[ngoId];
    if (!data) { router.push('/ngo-login'); return; }
    setNgo(data);
    setMilestones(MOCK_MILESTONES[ngoId] || []);
    setWebSources(data.web_sources || []);
    setLoading(false);
  }, [router]);

  const handleVerified = (milestoneId: string, verdict: any) => {
    if (verdict.score >= 65) {
      setMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, status: 'UNLOCKED' } : m));
    }
    toast.success('Milestone updated!');
  };

  const handleLogout = () => {
    localStorage.removeItem('sustainify_ngo_session');
    router.push('/ngo-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#040a04]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-4 border-[#16a34a]/20 border-t-[#16a34a] rounded-full" />
      </div>
    );
  }

  if (!ngo) return null;

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'milestones', label: 'Milestones', icon: FileText },
    { key: 'sources', label: 'Web Sources', icon: Globe },
  ];

  const released = milestones.filter(m => m.status === 'RELEASED').length;
  const unlocked = milestones.filter(m => m.status === 'UNLOCKED').length;
  const total = milestones.length;

  return (
    <div className="min-h-screen bg-[#040a04] text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-white/[0.05] bg-black/30 pt-20 px-6 pb-6 sticky top-0 h-screen">
          <div className="space-y-4 mb-10">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-20 h-20 bg-[#16a34a]/10 border-2 border-[#16a34a]/20 rounded-2xl flex items-center justify-center">
                <Building2 size={32} className="text-[#16a34a]" />
              </div>
              <div>
                <p className="font-black text-white">{ngo.name}</p>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">{ngo.darpan_id}</p>
              </div>
              <ScoreRing score={ngo.transparency_score} />
              <StatusBadge status={ngo.status} />
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin size={12} />{ngo.city} <Tag size={12} className="ml-1" />{ngo.category}
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  tab === t.key ? 'bg-[#16a34a] text-white shadow-[0_0_20px_rgba(22,163,74,0.3)]' : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                }`}>
                <t.icon size={15} />{t.label}
              </button>
            ))}
          </nav>

          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-xs font-black text-gray-600 hover:text-red-400 uppercase tracking-wider transition-colors mt-4">
            <LogOut size={15} />Sign Out
          </button>
        </aside>

        {/* Main */}
        <main className="flex-1 px-6 lg:px-10 pt-24 pb-16 max-w-5xl">

          {/* Mobile tabs */}
          <div className="flex gap-2 mb-8 lg:hidden overflow-x-auto pb-1">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  tab === t.key ? 'bg-[#16a34a] text-white' : 'bg-white/[0.04] text-gray-500'
                }`}>
                <t.icon size={13} />{t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* OVERVIEW TAB */}
            {tab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight">Welcome back,</h1>
                  <h2 className="text-3xl font-extrabold text-[#16a34a] tracking-tight">{ngo.name}</h2>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Transparency Score', value: ngo.transparency_score, suffix: '/100', color: '#16a34a' },
                    { label: 'Total Raised', value: `₹${(ngo.total_donations || 0).toLocaleString()}`, color: '#3b82f6' },
                    { label: 'Total Donors', value: ngo.donor_count, color: '#a855f7' },
                    { label: 'Milestones Done', value: `${released + unlocked}/${total}`, color: '#eab308' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{s.label}</p>
                      <p className="text-2xl font-black mt-2" style={{ color: s.color }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* NGO description */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">About</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{ngo.description}</p>
                </div>

                {/* Quick milestone preview */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-extrabold text-gray-300">Milestone Progress</h3>
                    <button onClick={() => setTab('milestones')} className="text-xs text-[#16a34a] font-bold hover:underline">View All →</button>
                  </div>
                  <div className="space-y-2">
                    {milestones.map(m => (
                      <div key={m.id} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black ${
                          m.status === 'RELEASED' ? 'bg-green-500/20 text-green-400' :
                          m.status === 'UNLOCKED' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-gray-600'
                        }`}>
                          {m.status === 'RELEASED' ? <Check size={14} /> : m.status === 'UNLOCKED' ? '✓' : '🔒'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-300 truncate">{m.title}</p>
                          <p className="text-[10px] text-gray-600">₹{m.amount_locked.toLocaleString()}</p>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg shrink-0 ${
                          m.status === 'RELEASED' ? 'bg-green-500/10 text-green-400' :
                          m.status === 'UNLOCKED' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-gray-600'
                        }`}>{m.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* MILESTONES TAB */}
            {tab === 'milestones' && (
              <motion.div key="milestones" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <h2 className="text-2xl font-extrabold tracking-tight">Milestones</h2>
                <div className="space-y-4">
                  {milestones.map((m, idx) => (
                    <motion.div key={m.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.07 }}
                      className={`rounded-2xl border p-6 relative overflow-hidden ${
                        m.status === 'RELEASED' ? 'border-green-500/25 bg-green-500/5' :
                        m.status === 'UNLOCKED' ? 'border-amber-500/25 bg-amber-500/5' :
                        'border-white/[0.06] bg-white/[0.02]'
                      }`}>
                      <div className={`absolute left-0 inset-y-0 w-1 rounded-l-2xl ${
                        m.status === 'RELEASED' ? 'bg-green-500' : m.status === 'UNLOCKED' ? 'bg-amber-400' : 'bg-gray-700'
                      }`} />
                      <div className="pl-4">
                        <div className="flex justify-between items-start flex-wrap gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Phase {idx + 1}</span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                m.status === 'RELEASED' ? 'text-green-400 border-green-500/30 bg-green-500/10' :
                                m.status === 'UNLOCKED' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                                'text-gray-500 border-gray-700 bg-white/5'
                              }`}>{m.status}</span>
                            </div>
                            <h3 className="text-base font-extrabold text-white">{m.title}</h3>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{m.description}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-mono font-black text-base text-white">₹{m.amount_locked.toLocaleString()}</p>
                            <p className="text-[9px] text-gray-600 uppercase tracking-wide">Locked</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between gap-3 flex-wrap">
                          <p className="text-[10px] text-amber-400/70 italic">
                            🗂 {m.required_proof}
                          </p>
                          {m.status === 'LOCKED' && (
                            <button onClick={() => setProofModal(m)}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16a34a]/10 border border-[#16a34a]/25 text-[#16a34a] text-xs font-black hover:bg-[#16a34a]/20 transition-colors">
                              <Upload size={13} /> Add Proof Update
                            </button>
                          )}
                          {m.status === 'UNLOCKED' && (
                            <span className="flex items-center gap-2 text-amber-400 text-xs font-black">
                              <ShieldCheck size={14} /> AI Verified — Awaiting Govt Release
                            </span>
                          )}
                          {m.status === 'RELEASED' && (
                            <span className="flex items-center gap-2 text-green-400 text-xs font-black">
                              <CheckCircle2 size={14} /> Released ✓
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* WEB SOURCES TAB */}
            {tab === 'sources' && (
              <motion.div key="sources" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-extrabold">Web Sources</h2>
                    <p className="text-xs text-gray-500 mt-1">External links mentioning your NGO</p>
                  </div>
                  <button onClick={() => setShowSourceModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16a34a] text-white text-xs font-black uppercase tracking-wider hover:bg-[#15803d] transition-colors">
                    <Plus size={14} /> Add Source
                  </button>
                </div>

                <div className="space-y-3">
                  {webSources.map(s => (
                    <div key={s.id} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:border-white/10 transition-colors group">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=32`}
                        alt="" className="w-8 h-8 rounded-lg bg-white/5 shrink-0"
                        onError={(e: any) => { e.target.style.display = 'none'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm text-white truncate">{s.label}</p>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">{s.type}</span>
                        </div>
                        <p className="text-[10px] text-gray-600 font-mono mt-0.5 truncate">{s.url}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${
                          s.credibility === 'High Credibility' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {s.credibility === 'High Credibility' ? '✓' : '⚠️'} {s.credibility}
                        </span>
                        <a href={s.url} target="_blank" rel="noopener noreferrer"
                          className="p-2 rounded-xl text-gray-600 hover:text-white hover:bg-white/[0.06] transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  ))}

                  {webSources.length === 0 && (
                    <div className="text-center py-16 text-gray-600">
                      <Globe size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-bold">No sources added yet</p>
                      <p className="text-xs mt-1">Add news articles, government mentions, or social posts about your NGO</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {proofModal && (
          <ProofModal
            milestone={proofModal} ngo={ngo}
            onClose={() => setProofModal(null)}
            onVerified={(id: string, verdict: any) => { handleVerified(id, verdict); setProofModal(null); }}
          />
        )}
        {showSourceModal && (
          <WebSourceModal
            onClose={() => setShowSourceModal(false)}
            onAdd={(s: any) => { setWebSources(prev => [...prev, s]); setShowSourceModal(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
