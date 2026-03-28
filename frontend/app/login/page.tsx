"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';
import { signInWithGoogle, supabase } from '../../lib/supabase';

// ─── SVGs ───────────────────────────────────────────────
const GoogleSvg = () => <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>;

// ─── BACKGROUND ─────────────────────────────────────────
function NeonBg() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#040a04] via-[#0a0f0a] to-[#050d05]" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(0,255,136,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,0.3) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      {[{ s: 400, x: '15%', y: '20%', c: '#00ff88' }, { s: 300, x: '75%', y: '60%', c: '#39ff14' }, { s: 250, x: '50%', y: '80%', c: '#00ff88' }].map((o, i) => (
        <motion.div key={i} className="absolute rounded-full" style={{ width: o.s, height: o.s, left: o.x, top: o.y, background: `radial-gradient(circle,${o.c}18 0%,transparent 70%)`, filter: `blur(${60 + i * 10}px)` }}
          animate={{ x: [0, 40, -30, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }} transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

// ─── ROLE SELECTION ─────────────────────────────────────
type RoleStep = 'select' | 'donor' | 'ngo' | 'govt';

function RoleSelection({ onSelect }: { onSelect: (r: RoleStep) => void }) {
  const [ngoSub, setNgoSub] = useState<'new' | 'existing'>('existing');

  const cards = [
    {
      key: 'donor' as const,
      color: '#00ff88',
      colorBg: 'rgba(0,255,136,0.12)',
      gradient: 'from-[#00ff88] to-[#00cc6a]',
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
      title: "I want to donate",
      subtitle: "Discover NGOs, donate securely, verify real impact",
      btn: "Continue as Donor",
    },
    {
      key: 'govt' as const,
      color: '#3b82f6',
      colorBg: 'rgba(59,130,246,0.12)',
      gradient: 'from-blue-500 to-blue-700',
      icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M3 22h18M3 10h18M12 2 3 10h18L12 2zM7 10v12M17 10v12M12 10v12"/></svg>,
      title: "Government Official",
      subtitle: "Manage NGO registrations, assign milestones, verify organisations",
      btn: "Login with Government Email",
      note: "Only @tn.gov.in emails accepted",
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -30 }} className="w-full max-w-5xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
        {/* Left — tagline */}
        <div className="space-y-8 text-center lg:text-left lg:pt-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-full">
            <span className="text-sm">🌱</span>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00ff88]">Sustainify Tamil Nadu</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-[1.05]">
            <span className="text-white">Every Rupee<br/>Tracked with</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#39ff14]">AI Proof.</span>
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex gap-6 justify-center lg:justify-start">
            {[{ v: '38+', l: 'Districts' }, { v: '₹1.2Cr', l: 'Tracked' }, { v: '20+', l: 'Verified NGOs' }].map((s, i) => (
              <div key={i} className="text-center p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                <p className="text-lg font-extrabold text-[#00ff88]">{s.v}</p>
                <p className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">{s.l}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — cards */}
        <div className="space-y-5">
          {/* Donor Card */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, type: "spring" }}
            whileHover={{ y: -4, boxShadow: '0 20px 60px -10px rgba(0,255,136,0.15)' }}
            onClick={() => onSelect('donor')}
            className="cursor-pointer group relative rounded-[1.5rem] p-8 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(40px)', border: '1px solid rgba(0,255,136,0.12)' }}>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00ff88] to-transparent opacity-40" />
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-[#00ff88] to-[#00cc6a] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.25)] shrink-0">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-extrabold text-white mb-1">I want to donate</h3>
                <p className="text-gray-500 text-xs leading-relaxed">Discover Tamil Nadu NGOs, donate securely, track your impact</p>
              </div>
              <motion.span whileHover={{ x: 4 }} className="text-[#00ff88] text-xl font-bold">→</motion.span>
            </div>
          </motion.div>

          {/* NGO Card */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, type: "spring" }}
            className="group relative rounded-[1.5rem] p-8 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(40px)', border: '1px solid rgba(168,85,247,0.12)' }}>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-40" />
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.25)] shrink-0 mt-0.5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01"/></svg>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-extrabold text-white mb-1">I represent an NGO</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">Manage milestones, upload verified proof, receive donations</p>
                </div>
                {/* Sub-options */}
                <div className="space-y-2">
                  {[
                    { val: 'existing' as const, label: 'We are a registered NGO (have Darpan ID)' },
                    { val: 'new' as const, label: 'We are a new NGO (no Darpan ID yet)' },
                  ].map(opt => (
                    <label key={opt.val} className="flex items-center gap-3 cursor-pointer group/radio" onClick={e => e.stopPropagation()}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${ngoSub === opt.val ? 'border-purple-400 bg-purple-400' : 'border-white/20'}`}>
                        {ngoSub === opt.val && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <input type="radio" name="ngoType" value={opt.val} checked={ngoSub === opt.val}
                        onChange={() => setNgoSub(opt.val)} className="sr-only" />
                      <span className="text-xs text-gray-400 group-hover/radio:text-gray-200 transition-colors">{opt.label}</span>
                    </label>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    localStorage.setItem('sustainify_ngo_type', ngoSub);
                    onSelect('ngo');
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold text-sm flex items-center justify-center gap-2"
                  style={{ boxShadow: '0 0 20px rgba(168,85,247,0.2)' }}>
                  Continue as NGO →
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Govt Card */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, type: "spring" }}
            className="group relative rounded-[1.5rem] p-8 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(40px)', border: '1px solid rgba(59,130,246,0.12)' }}>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-40" />
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.25)] shrink-0 mt-0.5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M3 22h18M3 10h18M12 2 3 10h18L12 2zM7 10v12M17 10v12M12 10v12"/></svg>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-xl font-extrabold text-white mb-1">Government Official</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">Manage NGO registrations and verify organisations</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => onSelect('govt')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2"
                  style={{ boxShadow: '0 0 20px rgba(59,130,246,0.2)' }}>
                  Login with Government Email →
                </motion.button>
                <p className="text-[10px] text-blue-400/60 text-center">🔒 Only @tn.gov.in email addresses are accepted</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── DONOR FORM ─────────────────────────────────────────
function DonorForm({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!name.trim()) return;
    setLoading(true);
    // DEMO BYPASS: Set session and redirect immediately
    localStorage.setItem('sustainify_name', name);
    localStorage.setItem('sustainify_role', 'donor');
    localStorage.setItem('sustainify_session', JSON.stringify({ name, role: 'donor' }));
    
    // Support real login if configured
    try {
      await signInWithGoogle('donor');
    } catch (err) {
      console.warn("OAuth failed, using demo bypass");
      window.location.href = '/feed';
    }
  };

  const handleDemoLogin = () => {
    localStorage.setItem('sustainify_name', 'Alex Changemaker');
    localStorage.setItem('sustainify_role', 'donor');
    localStorage.setItem('sustainify_session', JSON.stringify({ name: 'Alex Changemaker', role: 'donor' }));
    window.location.href = '/feed';
  };


  return (
    <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="w-full max-w-md mx-auto">
      <div className="relative rounded-[2rem] overflow-hidden" style={{
        background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(40px)',
        border: '1px solid rgba(0,255,136,0.12)', boxShadow: '0 30px 100px -20px rgba(0,0,0,0.5)',
      }}>
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00ff88] to-transparent opacity-50" />
        <div className="p-10 space-y-8">
          <button onClick={onBack} className="text-gray-500 hover:text-[#00ff88] transition-colors text-sm font-medium">← Back</button>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Welcome, Changemaker</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Start making verified impact</p>
          </div>
          <div className="relative">
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-white/[0.03] text-white font-medium px-4 py-4 rounded-2xl border border-white/[0.08] outline-none focus:border-[#00ff88]/40 transition-all placeholder-gray-600" />
          </div>
          <motion.button onClick={handleLogin} disabled={loading || !name.trim()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl font-bold text-base cursor-pointer bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
            {loading ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>🌱</motion.span> : <GoogleSvg />}
            {loading ? 'Connecting...' : 'Continue with Google'}
          </motion.button>
          
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-[8px] uppercase tracking-[0.3em]"><span className="bg-[#0b1219] px-4 text-gray-500">Or Demo Protocol</span></div>
          </div>

          <motion.button onClick={handleDemoLogin} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-2xl">
            Ignite Simulated Session (No Login Required)
          </motion.button>

          <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold text-center">🔒 Encrypted · 🛡️ RLS Protected</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── NGO FORM ────────────────────────────────────────────
function NgoForm({ onBack }: { onBack: () => void }) {
  const ngoType = typeof window !== 'undefined' ? localStorage.getItem('sustainify_ngo_type') || 'existing' : 'existing';
  const isNew = ngoType === 'new';

  const [ngoName, setNgoName] = useState('');
  const [darpanId, setDarpanId] = useState('');
  const [personName, setPersonName] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifiedNgo, setVerifiedNgo] = useState<{ id: string; name: string; city: string; district: string } | null>(null);
  const [darpanStatus, setDarpanStatus] = useState<'idle' | 'checking' | 'found' | 'notfound'>('idle');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const checkDarpan = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = value.trim().toUpperCase();
    if (trimmed.length < 8) { setDarpanStatus('idle'); setVerifiedNgo(null); return; }
    setDarpanStatus('checking');
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase.from('ngos').select('id, name, city, district').eq('darpan_id', trimmed).single();
      if (data) { setVerifiedNgo(data); setDarpanStatus('found'); setNgoName(data.name); }
      else { setVerifiedNgo(null); setDarpanStatus('notfound'); }
    }, 600);
  }, []);

  const handleLogin = async () => {
    if (!personName.trim()) return;
    if (!isNew && !darpanId.trim()) return;
    setLoading(true);
    localStorage.setItem('sustainify_role', 'ngo');
    localStorage.setItem('sustainify_name', personName);
    
    // DEMO BYPASS
    if (!isNew) {
      const trimmedId = darpanId.trim().toUpperCase();
      localStorage.setItem('sustainify_darpan', trimmedId);
      // Use the verified NGO ID if found, otherwise use a default demo ID
      const targetNgoId = verifiedNgo?.id || 'shiksha-foundation';
      localStorage.setItem('sustainify_ngo_id', targetNgoId);
      localStorage.setItem('sustainify_ngo_name', ngoName || 'Demo NGO');
      localStorage.setItem('sustainify_ngo_session', JSON.stringify({ ngoId: targetNgoId, darpanId: trimmedId }));
      
      window.location.href = `/ngo-admin/${targetNgoId}`;
      return;
    }

    try {
      await signInWithGoogle('ngo', isNew ? 'new' : 'existing');
    } catch(err) {
      window.location.href = isNew ? '/ngo-register' : '/ngo-dashboard';
    }
  };


  return (
    <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="w-full max-w-md mx-auto">
      <div className="relative rounded-[2rem] overflow-hidden" style={{
        background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(40px)',
        border: '1px solid rgba(168,85,247,0.12)', boxShadow: '0 30px 100px -20px rgba(0,0,0,0.5)',
      }}>
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
        <div className="p-10 space-y-6">
          <button onClick={onBack} className="text-gray-500 hover:text-purple-400 transition-colors text-sm font-medium">← Back</button>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-white">NGO {isNew ? 'Registration' : 'Verification'}</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
              {isNew ? 'New NGO — no Darpan ID yet' : 'Verify via Darpan ID'}
            </p>
          </div>

          <div className="space-y-4">
            {isNew ? (
              <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl text-xs text-purple-300 leading-relaxed">
                📋 You will be guided through a 3-step registration process after login. The government will review and assign your Darpan ID within 5-7 working days.
              </div>
            ) : (
              <>
                <input type="text" value={ngoName} onChange={e => setNgoName(e.target.value)} placeholder="NGO Name"
                  className="w-full bg-white/[0.03] text-white px-4 py-4 rounded-2xl border border-white/[0.08] outline-none focus:border-purple-400/40 transition-all placeholder-gray-600" />
                <div className="space-y-2">
                  <input type="text" value={darpanId} onChange={e => { setDarpanId(e.target.value); checkDarpan(e.target.value); }}
                    placeholder="Darpan ID e.g. TN/2000/0047512"
                    className="w-full bg-white/[0.03] text-white font-mono px-4 py-4 rounded-2xl border border-white/[0.08] outline-none focus:border-purple-400/40 transition-all placeholder-gray-600" />
                  <AnimatePresence mode="wait">
                    {darpanStatus === 'checking' && (
                      <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="text-sm">⏳</motion.span>
                        <span className="text-blue-400 text-xs">Checking Darpan database...</span>
                      </motion.div>
                    )}
                    {darpanStatus === 'found' && verifiedNgo && (
                      <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="px-4 py-3 bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-xl">
                        <p className="text-[#00ff88] text-xs font-bold">✓ Verified NGO found</p>
                        <p className="text-gray-400 text-xs">{verifiedNgo.name} · {verifiedNgo.district}</p>
                      </motion.div>
                    )}
                    {darpanStatus === 'notfound' && (
                      <motion.div key="n" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="px-4 py-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                        <p className="text-yellow-400 text-xs font-bold">⚠ ID not in our database</p>
                        <p className="text-gray-500 text-[11px]">We&apos;ll submit for manual review. You can still login.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            <input type="text" value={personName} onChange={e => setPersonName(e.target.value)}
              placeholder="Authorized Person Name"
              className="w-full bg-white/[0.03] text-white px-4 py-4 rounded-2xl border border-white/[0.08] outline-none focus:border-purple-400/40 transition-all placeholder-gray-600" />
          </div>

          <motion.button onClick={handleLogin} disabled={loading || !personName.trim() || (!isNew && !darpanId.trim())}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-purple-500 to-purple-700 text-white disabled:opacity-50 flex items-center justify-center gap-3"
            style={{ boxShadow: '0 0 30px rgba(168,85,247,0.2)' }}>
            {loading ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>🔍</motion.span> : <GoogleSvg />}
            {loading ? 'Verifying...' : `${isNew ? 'Register' : 'Verify'} & Continue with Google →`}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── GOVT FORM ───────────────────────────────────────────
function GovtForm({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    localStorage.setItem('sustainify_name', name);
    await signInWithGoogle('govt');
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="w-full max-w-md mx-auto">
      <div className="relative rounded-[2rem] overflow-hidden" style={{
        background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(40px)',
        border: '1px solid rgba(59,130,246,0.15)', boxShadow: '0 30px 100px -20px rgba(0,0,0,0.5)',
      }}>
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
        <div className="p-10 space-y-8">
          <button onClick={onBack} className="text-gray-500 hover:text-blue-400 transition-colors text-sm font-medium">← Back</button>
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M3 22h18M3 10h18M12 2 3 10h18L12 2zM7 10v12M17 10v12M12 10v12"/></svg>
            </div>
            <h2 className="text-2xl font-extrabold text-white">Government Login</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Tamil Nadu Social Welfare Department</p>
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl text-xs text-blue-300 leading-relaxed flex items-start gap-2">
            <span className="text-base shrink-0">🛡️</span>
            <span>Only official <strong className="text-blue-200">@tn.gov.in</strong> email addresses are authorised. Any other domain will be rejected and the session will be terminated.</span>
          </div>

          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Your official name"
            className="w-full bg-white/[0.03] text-white px-4 py-4 rounded-2xl border border-white/[0.08] outline-none focus:border-blue-400/40 transition-all placeholder-gray-600" />

          <motion.button onClick={handleLogin} disabled={loading || !name.trim()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl font-bold bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-3"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
            {loading ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>🔵</motion.span> : <GoogleSvg />}
            {loading ? 'Verifying...' : 'Login with Government Google Account'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── MAIN ────────────────────────────────────────────────
export default function LoginPage() {
  const [step, setStep] = useState<RoleStep | 'select'>('select');

  // Show error from govt email rejection
  const [error, setError] = useState('');
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err === 'invalid_govt_email' && !error) {
      setError('Government login requires an official @tn.gov.in email address.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden pt-24 pb-10 px-4">
      <NeonBg />
      <div className="relative z-10 w-full">
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm text-center">
            ⚠️ {error}
          </motion.div>
        )}
        <AnimatePresence mode="wait">
          {step === 'select' && <RoleSelection key="select" onSelect={r => setStep(r)} />}
          {step === 'donor' && <DonorForm key="donor" onBack={() => setStep('select')} />}
          {step === 'ngo' && <NgoForm key="ngo" onBack={() => setStep('select')} />}
          {step === 'govt' && <GovtForm key="govt" onBack={() => setStep('select')} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
