"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { signInWithGoogle, supabase } from '../../lib/supabase';

// ═══════════════════════
// PARTICLES BG
// ═══════════════════════
const PARTICLES = [
  { w: 3, h: 3, left: '8%', top: '15%', dy: -280, dx: 30, dur: 7, del: 0 },
  { w: 4, h: 4, left: '22%', top: '45%', dy: -350, dx: -20, dur: 9, del: 1.5 },
  { w: 2, h: 2, left: '35%', top: '70%', dy: -220, dx: 40, dur: 6, del: 3 },
  { w: 5, h: 5, left: '48%', top: '25%', dy: -310, dx: -35, dur: 10, del: 0.5 },
  { w: 3, h: 3, left: '62%', top: '55%', dy: -260, dx: 15, dur: 8, del: 2 },
  { w: 4, h: 4, left: '75%', top: '80%', dy: -340, dx: -45, dur: 7.5, del: 4 },
];

function NeonBg() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#040a04] via-[#0a0f0a] to-[#050d05]" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(0,255,136,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,0.3) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      {[{ s: 400, x: '15%', y: '20%', c: '#00ff88' }, { s: 300, x: '75%', y: '60%', c: '#39ff14' }, { s: 250, x: '50%', y: '80%', c: '#00ff88' }].map((o, i) => (
        <motion.div key={i} className="absolute rounded-full" style={{ width: o.s, height: o.s, left: o.x, top: o.y, background: `radial-gradient(circle,${o.c}18 0%,transparent 70%)`, filter: `blur(${60 + i * 10}px)` }}
          animate={{ x: [0, 40, -30, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }} transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "easeInOut" }} />
      ))}
      {PARTICLES.map((p, i) => (
        <motion.div key={`p-${i}`} className="absolute rounded-full bg-[#00ff88]" style={{ width: p.w, height: p.h, left: p.left, top: p.top }}
          animate={{ y: [0, p.dy], x: [0, p.dx], opacity: [0, 0.6, 0.3, 0], scale: [0, 1, 1.5, 0] }} transition={{ duration: p.dur, repeat: Infinity, delay: p.del, ease: "easeOut" }} />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#040a04_100%)]" />
    </div>
  );
}

// ═══════════════════════
// ANIMATED INPUT
// ═══════════════════════
function AnimInput({ label, type, value, onChange, icon, placeholder }: {
  label: string; type: string; value: string; onChange: (v: string) => void; icon: React.ReactNode; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const isActive = focused || value.length > 0;
  return (
    <div className="relative">
      <motion.div className="absolute left-4 top-1/2 -translate-y-1/2 z-10" animate={{ color: focused ? '#00ff88' : '#4a5568', scale: focused ? 1.1 : 1 }}>{icon}</motion.div>
      <motion.label className="absolute left-12 pointer-events-none font-medium z-10"
        animate={{ top: isActive ? '6px' : '50%', y: isActive ? 0 : '-50%', fontSize: isActive ? '9px' : '13px', color: focused ? '#00ff88' : '#6b7280', letterSpacing: isActive ? '0.15em' : '0.05em' }}
        transition={{ duration: 0.2 }} style={{ textTransform: isActive ? 'uppercase' : 'none' } as any}>{label}</motion.label>
      <input type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="w-full bg-white/[0.03] text-white font-medium pl-12 pr-6 pt-6 pb-3 rounded-2xl border outline-none transition-all duration-200 backdrop-blur-sm placeholder-transparent"
        style={{ boxShadow: focused ? '0 0 0 1px rgba(0,255,136,0.3)' : 'none', borderColor: focused ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.08)' }} />
      <motion.div className="absolute bottom-0 left-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#00ff88] to-transparent rounded-full"
        animate={{ width: focused ? '90%' : '0%', x: '-50%', opacity: focused ? 1 : 0 }} transition={{ duration: 0.3 }} style={{ boxShadow: '0 0 8px rgba(0,255,136,0.5)' }} />
    </div>
  );
}

const UserSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>;
const MailSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const BldSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/></svg>;
const IdSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>;
const GoogleSvg = () => <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>;

// ═══════════════════════
// ROLE SELECTION
// ═══════════════════════
function RoleSelection({ onSelect }: { onSelect: (r: 'donor' | 'ngo') => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -30 }} className="w-full max-w-5xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Left — tagline */}
        <div className="space-y-8 text-center lg:text-left">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-full">
            <span className="text-sm">🌱</span>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00ff88]">Sustainify Tamil Nadu</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-[1.05]">
            <span className="text-white">Every Rupee<br/>Tracked with</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#39ff14]">AI Proof.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-gray-500 max-w-md text-sm leading-relaxed italic">
            &quot;Connecting Tamil Nadu&apos;s most impactful NGOs with donors who demand radical transparency.&quot;
          </motion.p>
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
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, type: "spring" }}
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
                <h3 className="text-xl font-extrabold text-white mb-1">I&apos;m a Donor</h3>
                <p className="text-gray-500 text-xs leading-relaxed">Discover Tamil Nadu NGOs, donate securely, track your impact</p>
              </div>
              <motion.span whileHover={{ x: 4 }} className="text-[#00ff88] text-xl font-bold">→</motion.span>
            </div>
          </motion.div>

          {/* NGO Card */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, type: "spring" }}
            whileHover={{ y: -4, boxShadow: '0 20px 60px -10px rgba(168,85,247,0.15)' }}
            onClick={() => onSelect('ngo')}
            className="cursor-pointer group relative rounded-[1.5rem] p-8 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(40px)', border: '1px solid rgba(168,85,247,0.12)' }}>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-40" />
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.25)] shrink-0">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01"/></svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-extrabold text-white mb-1">I represent an NGO</h3>
                <p className="text-gray-500 text-xs leading-relaxed">Manage milestones, upload verified proof, receive donations</p>
              </div>
              <motion.span whileHover={{ x: 4 }} className="text-purple-400 text-xl font-bold">→</motion.span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════
// DONOR FORM
// ═══════════════════════
function DonorForm({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!name.trim()) return;
    setLoading(true);
    localStorage.setItem('sustainify_name', name);
    localStorage.setItem('sustainify_role', 'donor');
    await signInWithGoogle();
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
          <AnimInput label="Full Name" type="text" value={name} onChange={setName} icon={<UserSvg />} />
          <motion.button onClick={handleLogin} disabled={loading || !name.trim()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl font-bold text-base cursor-pointer bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
            {loading ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>🌱</motion.span> : <GoogleSvg />}
            {loading ? 'Connecting...' : 'Continue with Google'}
          </motion.button>
          <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold text-center">🔒 Encrypted · 🛡️ RLS Protected</p>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════
// NGO FORM WITH LIVE DARPAN CHECK
// ═══════════════════════
function NgoForm({ onBack }: { onBack: () => void }) {
  const [ngoName, setNgoName] = useState('');
  const [darpanId, setDarpanId] = useState('');
  const [personName, setPersonName] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifiedNgo, setVerifiedNgo] = useState<{ id: string; name: string; city: string; district: string } | null>(null);
  const [darpanStatus, setDarpanStatus] = useState<'idle' | 'checking' | 'found' | 'notfound'>('idle');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Live Darpan check (debounced 600ms)
  const checkDarpan = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = value.trim().toUpperCase();
    if (trimmed.length < 8) { setDarpanStatus('idle'); setVerifiedNgo(null); return; }

    setDarpanStatus('checking');
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from('ngos')
        .select('id, name, city, district, cover_image')
        .eq('darpan_id', trimmed)
        .single();
      if (data) {
        setVerifiedNgo(data);
        setDarpanStatus('found');
        setNgoName(data.name); // auto-fill
      } else {
        setVerifiedNgo(null);
        setDarpanStatus('notfound');
      }
    }, 600);
  }, []);

  const handleDarpanChange = (v: string) => {
    setDarpanId(v);
    checkDarpan(v);
  };

  const handleLogin = async () => {
    if (!darpanId.trim() || !personName.trim()) return;
    setLoading(true);
    localStorage.setItem('sustainify_role', 'ngo');
    localStorage.setItem('sustainify_darpan', darpanId.trim().toUpperCase());
    localStorage.setItem('sustainify_ngo_id', verifiedNgo?.id || '');
    localStorage.setItem('sustainify_ngo_name', ngoName);
    localStorage.setItem('sustainify_name', personName);
    await signInWithGoogle();
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
            <h2 className="text-2xl font-extrabold text-white">NGO Verification</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Verify via Darpan ID</p>
          </div>

          <div className="space-y-4">
            <AnimInput label="NGO Name" type="text" value={ngoName} onChange={setNgoName} icon={<BldSvg />} />
            
            {/* Darpan ID with live check */}
            <div className="space-y-2">
              <AnimInput label="Darpan Registration ID" type="text" value={darpanId} onChange={handleDarpanChange} icon={<IdSvg />} placeholder="TN/YEAR/XXXXXXX" />
              
              <AnimatePresence mode="wait">
                {darpanStatus === 'checking' && (
                  <motion.div key="checking" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="text-blue-400 text-sm">⏳</motion.span>
                    <span className="text-blue-400 text-xs font-medium">Checking Darpan database...</span>
                  </motion.div>
                )}
                {darpanStatus === 'found' && verifiedNgo && (
                  <motion.div key="found" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="px-4 py-3 bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#00ff88] text-sm">✓</span>
                      <span className="text-[#00ff88] text-xs font-bold">Verified NGO found</span>
                    </div>
                    <p className="text-gray-400 text-xs">{verifiedNgo.name} · {verifiedNgo.district}</p>
                  </motion.div>
                )}
                {darpanStatus === 'notfound' && (
                  <motion.div key="notfound" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="px-4 py-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-yellow-400 text-sm">⚠</span>
                      <span className="text-yellow-400 text-xs font-bold">ID not in our database</span>
                    </div>
                    <p className="text-gray-500 text-[11px]">We&apos;ll submit for manual review. You can still login.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimInput label="Authorized Person Name" type="text" value={personName} onChange={setPersonName} icon={<UserSvg />} />
          </div>

          <motion.button onClick={handleLogin} disabled={loading || !darpanId.trim() || !personName.trim()}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl font-bold text-base cursor-pointer bg-gradient-to-r from-purple-500 to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            style={{ boxShadow: '0 0 30px rgba(168,85,247,0.2)' }}>
            {loading ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>🔍</motion.span> : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
            )}
            {loading ? 'Verifying...' : 'Verify & Continue with Google →'}
          </motion.button>
          <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold text-center">Darpan: ngo.darpan.gov.in</p>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════
// MAIN
// ═══════════════════════
export default function LoginPage() {
  const [step, setStep] = useState<'select' | 'donor' | 'ngo'>('select');
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden pt-24 pb-10 px-4">
      <NeonBg />
      <div className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {step === 'select' && <RoleSelection key="select" onSelect={r => setStep(r)} />}
          {step === 'donor' && <DonorForm key="donor" onBack={() => setStep('select')} />}
          {step === 'ngo' && <NgoForm key="ngo" onBack={() => setStep('select')} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
