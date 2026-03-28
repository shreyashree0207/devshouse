"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase, getCurrentUser, signOut } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';
import { BarChart3, Heart, MapPin, Compass, LogOut, TrendingUp, Users, Shield, Sparkles } from 'lucide-react';
import NGOCard from '../../components/NGOCard';
import Link from 'next/link';

export default function DonorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [ngos, setNgos] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview' | 'donations' | 'explore' | 'map'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const u = await getCurrentUser();
      if (!u || u.user_metadata?.role === 'ngo') { router.push('/login'); return; }
      setUser(u);

      const [dRes, nRes] = await Promise.all([
        supabase.from('donations')
          .select('*, ngos(name, category, cover_image, city, transparency_score), activities(id, title, status)')
          .eq('user_id', u.id)
          .order('created_at', { ascending: false }),
        supabase.from('ngos').select('*').eq('verified', true).order('created_at', { ascending: false }),
      ]);
      if (dRes.data) setDonations(dRes.data);
      if (nRes.data) setNgos(nRes.data);
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f0a]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-[#00ff88]/20 border-t-[#00ff88] rounded-full" />
    </div>
  );

  if (!user) return null;

  const totalDonated = donations.reduce((s, d) => s + (d.amount || 0), 0);
  const uniqueNgos = new Set(donations.map(d => d.ngo_id)).size;
  const avgScore = donations.length > 0 ? Math.round(donations.reduce((s, d) => s + (d.ngos?.transparency_score || 0), 0) / donations.length) : 0;
  const impactScore = Math.round(totalDonated / 1000);
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Changemaker';

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { key: 'donations', label: 'My Donations', icon: <Heart size={16} /> },
    { key: 'explore', label: 'Explore NGOs', icon: <Compass size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f0a]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-[260px] h-screen sticky top-0 border-r border-white/[0.06] bg-white/[0.02] pt-24 px-6 pb-6">
          <div className="space-y-4 mb-8">
            <img src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00ff88&color=0a0f0a&bold=true`}
              alt="avatar" className="w-14 h-14 rounded-2xl border border-white/10" />
            <div>
              <p className="text-white font-bold text-sm">{name}</p>
              <p className="text-gray-500 text-xs truncate">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-full text-[9px] font-bold text-[#00ff88] uppercase tracking-widest">
                💚 Donor
              </span>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  tab === t.key ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
            <Link href="/map" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-white/[0.04]">
              <MapPin size={16} /> Map View
            </Link>
          </nav>

          <button onClick={() => signOut()} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-500 hover:text-red-400 transition-all mt-4">
            <LogOut size={16} /> Sign Out
          </button>
        </aside>

        {/* Main */}
        <main className="flex-1 pt-24 px-6 lg:px-10 pb-16 min-h-screen">
          {/* Mobile tab bar */}
          <div className="lg:hidden flex gap-2 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                  tab === t.key ? 'bg-[#00ff88] text-[#0a0f0a]' : 'text-gray-500 bg-white/[0.03] border border-white/[0.06]'
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="rounded-2xl p-8 bg-gradient-to-br from-[#00ff88]/5 to-transparent border border-[#00ff88]/10">
                <h1 className="text-2xl font-extrabold text-white mb-1">Welcome back, {name} 👋</h1>
                <p className="text-gray-500 text-sm">Your donations are creating real, AI-verified impact across Tamil Nadu.</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { l: 'Total Donated', v: `₹${totalDonated.toLocaleString()}`, ic: <TrendingUp size={20} />, c: '#00ff88' },
                  { l: 'NGOs Supported', v: String(uniqueNgos), ic: <Users size={20} />, c: '#3b82f6' },
                  { l: 'Avg Transparency', v: `${avgScore}/100`, ic: <Shield size={20} />, c: '#eab308' },
                  { l: 'Impact Score', v: String(impactScore), ic: <Sparkles size={20} />, c: '#a855f7' },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="rounded-2xl p-5 bg-white/[0.03] border border-white/[0.06] space-y-3">
                    <div style={{ color: s.c }}>{s.ic}</div>
                    <p className="text-xl font-extrabold text-white">{s.v}</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">{s.l}</p>
                  </motion.div>
                ))}
              </div>

              {/* Recent activity */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                {donations.length > 0 ? donations.slice(0, 5).map((d, i) => (
                  <div key={d.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#00ff88]/10 rounded-full flex items-center justify-center">
                        <Heart size={16} className="text-[#00ff88]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{d.ngos?.name || 'Unknown NGO'}</p>
                        <p className="text-[10px] text-gray-500">{new Date(d.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="text-lg font-extrabold text-[#00ff88]">₹{(d.amount || 0).toLocaleString()}</span>
                  </div>
                )) : (
                  <div className="text-center py-12 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                    <Heart size={40} className="mx-auto mb-3 text-gray-700" />
                    <p className="font-bold text-white mb-1">You haven&apos;t donated yet</p>
                    <Link href="/ngos" className="text-[#00ff88] text-sm font-bold hover:underline">Find an NGO to support →</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {tab === 'donations' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h2 className="text-xl font-extrabold text-white">My Donations</h2>
              {donations.length > 0 ? donations.map(d => (
                <div key={d.id} className="flex gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <img src={d.ngos?.cover_image || 'https://via.placeholder.com/80'} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white">{d.ngos?.name || 'NGO'}</h4>
                      <span className="text-lg font-extrabold text-[#00ff88]">₹{(d.amount || 0).toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d.activities?.title || 'General Fund'}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          d.released ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                       }`}>
                          {d.released ? '✓ Funds Released' : '🔒 Held in Escrow'}
                       </span>
                       {d.released && d.activities?.id && (
                          <Link href={`/activities/${d.activities.id}`} className="text-[8px] font-black text-blue-400 uppercase tracking-widest hover:underline">
                             View Verified Proof →
                          </Link>
                       )}
                    </div>
                    <p className="text-xs text-gray-500">{d.ngos?.city} · {d.ngos?.category}</p>
                    <p className="text-xs text-gray-600">{new Date(d.created_at).toLocaleDateString()}</p>
                    {d.impact_msg && <p className="text-xs text-gray-500 italic">&quot;{d.impact_msg}&quot;</p>}
                    <Link href={`/ngos/${d.ngo_id}`} className="text-[10px] text-[#00ff88] font-bold hover:underline">View NGO →</Link>
                  </div>
                </div>
              )) : (
                <div className="text-center py-16 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                  <svg className="mx-auto mb-4 text-gray-700" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                  <p className="font-bold text-white mb-1">No donations yet</p>
                  <Link href="/ngos" className="inline-block mt-3 px-6 py-3 bg-[#00ff88] text-[#0a0f0a] rounded-xl font-bold text-sm">Find an NGO to support →</Link>
                </div>
              )}
            </motion.div>
          )}

          {tab === 'explore' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-xl font-extrabold text-white">Explore Tamil Nadu NGOs</h2>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {ngos.map((ngo, i) => <NGOCard key={ngo.id} ngo={ngo} index={i} />)}
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
