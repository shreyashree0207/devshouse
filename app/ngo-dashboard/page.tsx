"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase, getCurrentUser, signOut } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';
import { BarChart3, Target, Upload, Wallet, Plus, CheckCircle2, Clock, TrendingUp, LogOut, Building2, Shield } from 'lucide-react';
import Link from 'next/link';

export default function NgoDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ngo, setNgo] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [proofs, setProofs] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview' | 'milestones' | 'proof' | 'donations'>('overview');
  const [loading, setLoading] = useState(true);
  const [newMs, setNewMs] = useState({ title: '', description: '', target_date: '', amount_used: '' });

  useEffect(() => {
    const init = async () => {
      const u = await getCurrentUser();
      if (!u || u.user_metadata?.role !== 'ngo') { router.push('/login'); return; }
      setUser(u);
      const ngoId = u.user_metadata?.ngo_id;
      if (!ngoId) { router.push('/ngo-pending'); return; }

      // Check verified status
      const { data: acc } = await supabase.from('ngo_accounts').select('*').eq('user_id', u.id).single();
      if (acc && !acc.verified) { router.push('/ngo-pending'); return; }

      const [nRes, mRes, dRes, pRes] = await Promise.all([
        supabase.from('ngos').select('*').eq('id', ngoId).single(),
        supabase.from('milestones').select('*').eq('ngo_id', ngoId).order('created_at', { ascending: false }),
        supabase.from('donations').select('*').eq('ngo_id', ngoId).order('created_at', { ascending: false }),
        supabase.from('proof_updates').select('*').eq('ngo_id', ngoId).order('created_at', { ascending: false }),
      ]);
      if (nRes.data) setNgo(nRes.data); else { router.push('/ngo-pending'); return; }
      if (mRes.data) setMilestones(mRes.data);
      if (dRes.data) setDonations(dRes.data);
      if (pRes.data) setProofs(pRes.data);
      setLoading(false);
    };
    init();
  }, [router]);

  const addMilestone = async () => {
    if (!newMs.title.trim() || !ngo) return;
    const { data } = await supabase.from('milestones').insert({
      ngo_id: ngo.id, title: newMs.title, description: newMs.description,
      target_date: newMs.target_date || null, amount_used: parseInt(newMs.amount_used) || 0,
    }).select().single();
    if (data) setMilestones(prev => [data, ...prev]);
    setNewMs({ title: '', description: '', target_date: '', amount_used: '' });
  };

  const toggleMilestone = async (id: string, done: boolean) => {
    await supabase.from('milestones').update({ completed: !done }).eq('id', id);
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, completed: !done } : m));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f0a]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full" />
    </div>
  );
  if (!ngo || !user) return null;

  const pct = ngo.goal_amount > 0 ? Math.round((ngo.raised_amount / ngo.goal_amount) * 100) : 0;
  const totalReceived = donations.reduce((s: number, d: any) => s + (d.amount || 0), 0);
  const completedMs = milestones.filter(m => m.completed).length;

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { key: 'milestones', label: 'Milestones', icon: <Target size={16} /> },
    { key: 'proof', label: 'Upload Proof', icon: <Upload size={16} /> },
    { key: 'donations', label: 'Donations', icon: <Wallet size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f0a]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-[260px] h-screen sticky top-0 border-r border-white/[0.06] bg-white/[0.02] pt-24 px-6 pb-6">
          <div className="space-y-4 mb-8">
            <img src={ngo.cover_image || 'https://via.placeholder.com/80'} alt={ngo.name}
              className="w-14 h-14 rounded-2xl object-cover border border-purple-500/30" />
            <div>
              <p className="text-white font-bold text-sm">{ngo.name}</p>
              <p className="text-gray-500 text-xs">{ngo.district}</p>
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-[8px] font-bold text-purple-400 uppercase tracking-widest">
                  {user.user_metadata?.darpan_id}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-full text-[9px] font-bold text-[#00ff88]">
                ✓ Verified NGO
              </span>
            </div>
          </div>
          <nav className="flex-1 space-y-1">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  tab === t.key ? 'bg-purple-500/10 text-purple-400' : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                }`}>{t.icon} {t.label}</button>
            ))}
          </nav>
          <button onClick={() => signOut()} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-500 hover:text-red-400 transition-all mt-4">
            <LogOut size={16} /> Sign Out
          </button>
        </aside>

        {/* Main */}
        <main className="flex-1 pt-24 px-6 lg:px-10 pb-16 min-h-screen">
          {/* Mobile tabs */}
          <div className="lg:hidden flex gap-2 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                  tab === t.key ? 'bg-purple-500 text-white' : 'text-gray-500 bg-white/[0.03] border border-white/[0.06]'
                }`}>{t.icon} {t.label}</button>
            ))}
          </div>

          {tab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { l: 'Total Raised', v: `₹${(ngo.raised_amount || 0).toLocaleString()}`, ic: <TrendingUp size={20} />, c: '#00ff88' },
                  { l: 'Total Donors', v: String(ngo.donor_count || donations.length), ic: <Wallet size={20} />, c: '#3b82f6' },
                  { l: 'Milestones Done', v: `${completedMs}/${milestones.length}`, ic: <Target size={20} />, c: '#a855f7' },
                  { l: 'Proof Updates', v: String(proofs.length), ic: <Shield size={20} />, c: '#eab308' },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl p-5 bg-white/[0.03] border border-white/[0.06] space-y-3">
                    <div style={{ color: s.c }}>{s.ic}</div>
                    <p className="text-xl font-extrabold text-white">{s.v}</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">{s.l}</p>
                  </div>
                ))}
              </div>
              {/* Progress */}
              <div className="rounded-2xl p-6 bg-white/[0.03] border border-white/[0.06]">
                <div className="flex justify-between mb-3">
                  <span className="text-sm font-bold text-white">Funding Progress</span>
                  <span className="text-sm font-bold text-[#00ff88]">{pct}%</span>
                </div>
                <div className="w-full bg-white/[0.05] h-3 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.5 }}
                    className="bg-gradient-to-r from-[#00ff88] to-[#39ff14] h-full rounded-full" />
                </div>
                <p className="text-xs text-gray-500 mt-2">₹{(ngo.raised_amount || 0).toLocaleString()} of ₹{(ngo.goal_amount || 0).toLocaleString()}</p>
              </div>
              <Link href={`/ngos/${ngo.id}`} className="block text-center text-[#00ff88] text-sm font-bold hover:underline">View Public Profile →</Link>
            </motion.div>
          )}

          {tab === 'milestones' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Add form */}
              <div className="rounded-2xl p-6 bg-white/[0.03] border border-white/[0.06] space-y-3">
                <h3 className="text-sm font-bold text-white mb-2">Add New Milestone</h3>
                <input value={newMs.title} onChange={e => setNewMs(p => ({ ...p, title: e.target.value }))} placeholder="Milestone title"
                  className="w-full bg-white/[0.03] text-white px-4 py-3 rounded-xl border border-white/[0.08] outline-none focus:border-purple-500/40 text-sm" />
                <input value={newMs.description} onChange={e => setNewMs(p => ({ ...p, description: e.target.value }))} placeholder="Description"
                  className="w-full bg-white/[0.03] text-white px-4 py-3 rounded-xl border border-white/[0.08] outline-none focus:border-purple-500/40 text-sm" />
                <div className="flex gap-3">
                  <input type="date" value={newMs.target_date} onChange={e => setNewMs(p => ({ ...p, target_date: e.target.value }))}
                    className="flex-1 bg-white/[0.03] text-white px-4 py-3 rounded-xl border border-white/[0.08] outline-none text-sm" />
                  <input value={newMs.amount_used} onChange={e => setNewMs(p => ({ ...p, amount_used: e.target.value }))} placeholder="₹ Amount"
                    className="flex-1 bg-white/[0.03] text-white px-4 py-3 rounded-xl border border-white/[0.08] outline-none text-sm" />
                </div>
                <button onClick={addMilestone} className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold text-sm flex items-center gap-2">
                  <Plus size={16} /> Add Milestone
                </button>
              </div>
              {/* Timeline */}
              {milestones.map(ms => (
                <div key={ms.id} className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <button onClick={() => toggleMilestone(ms.id, ms.completed)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                      ms.completed ? 'bg-[#00ff88] text-[#0a0f0a]' : 'bg-white/[0.05] text-gray-600 hover:bg-white/[0.1]'
                    }`}>
                    {ms.completed ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                  </button>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${ms.completed ? 'text-white line-through' : 'text-white'}`}>{ms.title}</p>
                    {ms.description && <p className="text-xs text-gray-500 mt-1">{ms.description}</p>}
                    <div className="flex gap-4 mt-2 text-[10px] text-gray-600">
                      {ms.target_date && <span>📅 {ms.target_date}</span>}
                      {ms.amount_used > 0 && <span>💰 ₹{ms.amount_used.toLocaleString()}</span>}
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${ms.completed ? 'text-[#00ff88]' : 'text-gray-600'}`}>
                    {ms.completed ? 'Done' : 'Pending'}
                  </span>
                </div>
              ))}
              {milestones.length === 0 && <p className="text-center text-gray-600 py-12">No milestones yet. Add your first above!</p>}
            </motion.div>
          )}

          {tab === 'proof' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="rounded-2xl p-12 bg-white/[0.03] border border-dashed border-white/[0.1] text-center space-y-4">
                <Upload size={48} className="mx-auto text-gray-600" />
                <h3 className="text-xl font-bold text-white">Upload Proof of Impact</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">Upload images as proof. Our AI will verify authenticity and update your transparency score.</p>
                <button className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold text-sm">Upload Files</button>
              </div>
              {proofs.map(p => (
                <div key={p.id} className="flex gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  {p.image_url && <img src={p.image_url} alt="" className="w-20 h-20 rounded-xl object-cover" />}
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{p.description || 'Proof upload'}</p>
                    <p className="text-xs text-gray-500">{p.location} · {new Date(p.created_at).toLocaleDateString()}</p>
                    <div className="flex gap-2 mt-2">
                      {p.authentic !== null && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${p.authentic ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-red-500/10 text-red-400'}`}>
                          {p.authentic ? '✓ Authentic' : '⚠ Flagged'}
                        </span>
                      )}
                      {p.ai_score && <span className="text-[9px] text-gray-500">Score: {p.ai_score}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {tab === 'donations' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="rounded-2xl p-6 bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                <span className="text-gray-400 font-medium">Total Received</span>
                <span className="text-2xl font-extrabold text-[#00ff88]">₹{totalReceived.toLocaleString()}</span>
              </div>
              {donations.map(d => (
                <div key={d.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#00ff88]/10 rounded-full flex items-center justify-center text-[#00ff88] font-bold text-sm">
                      {(d.donor_name || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{d.donor_name || 'Anonymous'}</p>
                      <p className="text-[10px] text-gray-600">{new Date(d.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-lg font-extrabold text-[#00ff88]">₹{(d.amount || 0).toLocaleString()}</span>
                </div>
              ))}
              {donations.length === 0 && <p className="text-center text-gray-600 py-12">No donations received yet.</p>}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
