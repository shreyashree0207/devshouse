"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, getCurrentUser, signOut } from '../../lib/supabase';
import {
  ClipboardList, Building2, Milestone, AlertOctagon,
  BarChart2, LogOut, CheckCircle2, XCircle, Clock,
  ChevronDown, Shield, Loader2, Users, TrendingUp, Search,
  Plus, X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SECTORS = ['Education', 'Healthcare', 'Environment', 'Women', 'Food', 'Child Welfare'];
const SECTOR_COLORS: Record<string, string> = {
  Education: '#3b82f6', Healthcare: '#ef4444', Environment: '#22c55e',
  Women: '#a855f7', Food: '#f59e0b', 'Child Welfare': '#ec4899'
};

const TN_DISTRICTS = [
  'Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tirunelveli','Tiruppur',
  'Erode','Vellore','Thoothukudi','Thanjavur','Dindigul','Cuddalore','Kancheepuram',
  'Namakkal','Virudhunagar','Nagapattinam','Ramanathapuram','Dharmapuri','Krishnagiri',
  'Perambalur','Ariyalur','Pudukkottai','Sivaganga','Theni','Nilgiris','Tiruvannamalai',
  'Villupuram','Kallakurichi','Ranipet','Tirupattur','Chengalpattu','Tenkasi','Mayiladuthurai'
];

// ── Sidebar ─────────────────────────────────────────────
const TABS = [
  { key: 'pending', label: 'Pending Applications', icon: <ClipboardList size={16}/> },
  { key: 'active', label: 'Active NGOs', icon: <Building2 size={16}/> },
  { key: 'milestones', label: 'Assign Milestones', icon: <Milestone size={16}/> },
  { key: 'blacklisted', label: 'Blacklisted NGOs', icon: <AlertOctagon size={16}/> },
  { key: 'reports', label: 'Reports', icon: <BarChart2 size={16}/> },
];

// ── Toast ────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: 'success'|'error'; onClose: ()=>void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
        type === 'success' ? 'bg-[#0a110a] border-[#16a34a]/40 text-[#16a34a]' : 'bg-[#0a110a] border-red-500/40 text-red-400'
      }`}>
      {type === 'success' ? <CheckCircle2 size={18}/> : <XCircle size={18}/>}
      <span className="text-sm font-bold">{msg}</span>
      <button onClick={onClose}><X size={14}/></button>
    </motion.div>
  );
}

// ── Slide-over Panel ─────────────────────────────────────
function ReviewPanel({ ngo, officialId, onClose, onAction }: {
  ngo: any; officialId: string;
  onClose: ()=>void; onAction: (type:'approve'|'reject', ngo: any, reason?: string)=>void
}) {
  const [rejReason, setRejReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-0 top-0 h-full w-full max-w-xl bg-[#0d160d] border-l border-white/10 z-40 overflow-y-auto shadow-2xl">
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-white">Review Application</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white"><X size={20}/></button>
        </div>

        <div className="space-y-4">
          {[
            ['NGO Name', ngo.name], ['Sector', ngo.sector || ngo.category],
            ['City', ngo.city], ['District', ngo.district],
            ['Contact Email', ngo.contact_email || '—'],
            ['Submitted', new Date(ngo.created_at).toLocaleDateString()],
            ['Description', ngo.description],
          ].map(([k, v]) => (
            <div key={k as string} className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.06]">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">{k as string}</p>
              <p className="text-sm text-white font-medium leading-relaxed">{v as string}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3 pt-4">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => onAction('approve', ngo)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg">
            <CheckCircle2 size={18}/> Approve & Assign Darpan ID
          </motion.button>

          {!showReject ? (
            <button onClick={() => setShowReject(true)} className="w-full py-4 rounded-2xl border border-red-500/30 text-red-400 font-bold text-sm hover:bg-red-500/5 transition-all">
              Reject Application
            </button>
          ) : (
            <div className="space-y-3 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
              <textarea value={rejReason} onChange={e => setRejReason(e.target.value)}
                placeholder="Reason for rejection..."
                rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-red-400/40 resize-none" />
              <div className="flex gap-2">
                <button onClick={() => { if(rejReason.trim()) onAction('reject', ngo, rejReason); }}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-xs">Confirm Rejection</button>
                <button onClick={() => setShowReject(false)} className="px-4 py-3 rounded-xl bg-white/5 text-gray-400 text-xs">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Add Milestone Form ───────────────────────────────────
function AddMilestoneForm({ ngoId, onAdded }: { ngoId: string; onAdded: ()=>void }) {
  const [form, setForm] = useState({ title: '', description: '', amount_locked: '', required_proof: '', target_date: '' });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.title || !form.required_proof) return;
    setLoading(true);
    await supabase.from('milestones').insert({
      ngo_id: ngoId, title: form.title, description: form.description,
      amount_locked: parseInt(form.amount_locked) || 0,
      required_proof: form.required_proof,
      target_date: form.target_date || null,
      status: 'LOCKED',
    });
    setLoading(false);
    setForm({ title: '', description: '', amount_locked: '', required_proof: '', target_date: '' });
    onAdded();
  };

  const fields: Array<{ label: string; key: keyof typeof form; type?: string; placeholder?: string }> = [
    { label: 'Title', key: 'title', placeholder: 'e.g. Distribute 200 textbooks' },
    { label: 'Description', key: 'description', placeholder: 'Detailed milestone description' },
    { label: 'Amount Locked (₹)', key: 'amount_locked', type: 'number', placeholder: '25000' },
    { label: 'Required Proof', key: 'required_proof', placeholder: 'e.g. Photo with students holding books in classroom' },
    { label: 'Target Date', key: 'target_date', type: 'date' },
  ];

  return (
    <div className="p-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl space-y-4">
      <h4 className="text-xs font-black text-white uppercase tracking-widest">Add Custom Milestone</h4>
      <div className="grid md:grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key} className={f.key === 'description' || f.key === 'required_proof' ? 'md:col-span-2' : ''}>
            <label className="text-[9px] text-gray-500 uppercase tracking-widest font-bold block mb-1">{f.label}</label>
            <input type={f.type || 'text'} value={form[f.key]} placeholder={f.placeholder}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#16a34a]/40 transition-all" />
          </div>
        ))}
      </div>
      <motion.button onClick={submit} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        className="w-full py-3 rounded-xl bg-[#16a34a] text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
        {loading ? <Loader2 size={14} className="animate-spin"/> : <Plus size={14}/>} Add Milestone
      </motion.button>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────
export default function GovtDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [official, setOfficial] = useState<any>(null);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);

  const [pendingNgos, setPendingNgos] = useState<any[]>([]);
  const [activeNgos, setActiveNgos] = useState<any[]>([]);
  const [blacklisted, setBlacklisted] = useState<any[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: 'success'|'error' } | null>(null);
  const [reviewNgo, setReviewNgo] = useState<any>(null);

  // Reports
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, donations: 0 });
  const [sectorData, setSectorData] = useState<any[]>([]);

  // Milestones
  const [milestoneSearch, setMilestoneSearch] = useState('');
  const [milestoneNgo, setMilestoneNgo] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);

  // Active NGO sector filter
  const [sectorFilter, setSectorFilter] = useState('all');

  useEffect(() => {
    const init = async () => {
      const u = await getCurrentUser();
      if (!u) { router.push('/login'); return; }
      if (u.user_metadata?.role !== 'govt') { router.push('/'); return; }
      if (!u.email?.endsWith('@tn.gov.in')) { router.push('/login?error=invalid_govt_email'); return; }
      setUser(u);

      // Fetch official record
      const { data: off } = await supabase.from('govt_officials').select('*').eq('email', u.email).single();
      setOfficial(off);

      await fetchAll();
      setLoading(false);
    };
    init();
  }, [router]);

  const fetchAll = async () => {
    const [pRes, aRes, bRes, statsRes] = await Promise.all([
      supabase.from('ngos').select('*').eq('status', 'pending').order('created_at', { ascending: true }),
      supabase.from('ngos').select('*, milestones(id, status)').in('status', ['approved', 'darpan_assigned']),
      supabase.from('ngos').select('id, name, city, district, category, status, transparency_score, complaint_count, darpan_id').in('status', ['suspended', 'under_review']),
      supabase.from('ngos').select('id, status, is_govt_verified, category'),
    ]);

    if (pRes.data) setPendingNgos(pRes.data);
    if (aRes.data) setActiveNgos(aRes.data);
    if (bRes.data) setBlacklisted(bRes.data);

    if (statsRes.data) {
      const allNgos = statsRes.data;
      setStats({
        total: allNgos.length,
        pending: allNgos.filter((n: any) => n.status === 'pending').length,
        verified: allNgos.filter((n: any) => n.is_govt_verified).length,
        donations: 0,
      });
      // Sector breakdown
      const byS: Record<string, number> = {};
      allNgos.forEach((n: any) => {
        const s = n.category || 'Other';
        byS[s] = (byS[s] || 0) + 1;
      });
      setSectorData(Object.entries(byS).map(([name, count]) => ({ name, count })));
    }
  };

  const genDarpanId = () => {
    const year = new Date().getFullYear();
    const seq = String(Math.floor(Math.random() * 9000000 + 1000000));
    return `TN/${year}/${seq}`;
  };

  const handleApprove = async (ngo: any) => {
    const darpanId = ngo.darpan_id || genDarpanId();

    // Fetch sector milestone templates
    const sector = ngo.sector || ngo.category || 'Education';
    const { data: templates } = await supabase.from('sector_milestone_templates').select('*').eq('sector', sector).order('phase');

    // Update NGO
    await supabase.from('ngos').update({
      darpan_id: darpanId, status: 'approved', verified: false, is_govt_verified: false,
    }).eq('id', ngo.id);

    // Insert darpan_assignments
    await supabase.from('darpan_assignments').insert({
      ngo_id: ngo.id, darpan_id: darpanId,
      assigned_by: official?.id, sector,
    }).then(() => {}); // non-fatal

    // Update ngo_accounts
    await supabase.from('ngo_accounts').update({
      status: 'darpan_assigned', darpan_id: darpanId,
    }).eq('ngo_id', ngo.id);

    // Log audit
    await supabase.from('status_audit_log').insert({
      ngo_id: ngo.id, old_status: 'pending', new_status: 'approved',
      reason: 'Approved by government official', changed_at: new Date().toISOString(),
    });

    // Auto-create milestones from templates
    if (templates && templates.length > 0) {
      const mStones = templates.map((t: any) => ({
        ngo_id: ngo.id, title: t.title, description: t.description,
        amount_locked: t.amount_suggested || 0, status: 'LOCKED',
        required_proof: t.required_proof || 'Photo evidence of activity',
        target_date: new Date(Date.now() + (t.phase || 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
      }));
      await supabase.from('milestones').insert(mStones);
      setToast({ msg: `Darpan ID ${darpanId} assigned. ${mStones.length} milestones created for ${sector}.`, type: 'success' });
    } else {
      setToast({ msg: `Darpan ID ${darpanId} assigned to ${ngo.name}.`, type: 'success' });
    }

    setReviewNgo(null);
    await fetchAll();
  };

  const handleReject = async (ngo: any, reason: string) => {
    await supabase.from('ngos').update({ status: 'rejected' }).eq('id', ngo.id);
    await supabase.from('ngo_accounts').update({ status: 'rejected' }).eq('ngo_id', ngo.id);
    await supabase.from('status_audit_log').insert({
      ngo_id: ngo.id, old_status: 'pending', new_status: 'rejected',
      reason, changed_at: new Date().toISOString(),
    });
    setToast({ msg: `${ngo.name} application rejected.`, type: 'error' });
    setReviewNgo(null);
    await fetchAll();
  };

  const handleReinstate = async (ngo: any) => {
    await supabase.from('ngos').update({ status: 'approved', verified: true }).eq('id', ngo.id);
    setToast({ msg: `${ngo.name} reinstated.`, type: 'success' });
    await fetchAll();
  };

  const handleMarkVerified = async (ngo: any) => {
    await supabase.from('ngos').update({ is_govt_verified: true, verified: true }).eq('id', ngo.id);
    setToast({ msg: `${ngo.name} marked as Government Verified ✓`, type: 'success' });
    await fetchAll();
  };

  const searchMilestoneNgo = async () => {
    const { data } = await supabase.from('ngos').select('id, name, darpan_id, category')
      .or(`name.ilike.%${milestoneSearch}%,darpan_id.ilike.%${milestoneSearch}%`).limit(5);
    if (data && data[0]) {
      setMilestoneNgo(data[0]);
      const { data: ms } = await supabase.from('milestones').select('*').eq('ngo_id', data[0].id).order('created_at');
      setMilestones(ms || []);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a110a]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full" />
    </div>
  );

  const filteredActive = sectorFilter === 'all' ? activeNgos : activeNgos.filter((n: any) => (n.category || n.sector) === sectorFilter);

  return (
    <div className="min-h-screen bg-[#0a110a] text-white font-jakarta flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-[280px] h-screen sticky top-0 border-r border-white/[0.06] bg-black/40 pt-24 px-6 pb-6">
        <div className="space-y-2 mb-10">
          <div className="flex items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shrink-0">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-black text-xs uppercase tracking-tight">{official?.name || user?.user_metadata?.full_name || 'Official'}</p>
              <p className="text-blue-400 text-[9px] uppercase tracking-widest font-bold">Govt Official</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                tab === t.key ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(59,130,246,0.3)]' : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
              }`}>{t.icon} {t.label}</button>
          ))}
        </nav>

        <button onClick={() => signOut()} className="flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-red-400 transition-all mt-6">
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 pt-24 px-6 lg:px-10 pb-20 min-h-screen">

        {/* ── TAB: PENDING ──────────────────────────── */}
        {tab === 'pending' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Pending Applications</h1>
              <p className="text-gray-500 text-sm mt-1">{pendingNgos.length} application{pendingNgos.length !== 1 ? 's' : ''} awaiting review</p>
            </div>

            {pendingNgos.length === 0 ? (
              <div className="p-16 text-center text-gray-600 border border-dashed border-white/10 rounded-3xl">
                <CheckCircle2 size={40} className="mx-auto mb-4 opacity-30" />
                <p className="font-bold">All clear — no pending applications</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-[9px] text-gray-500 uppercase tracking-widest font-black">
                      {['NGO Name', 'Sector', 'City', 'Submitted', 'Action'].map(h => (
                        <th key={h} className="text-left pb-4 pr-6">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {pendingNgos.map(ngo => (
                      <tr key={ngo.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-all">
                        <td className="py-5 pr-6 font-black text-white">{ngo.name}</td>
                        <td className="py-5 pr-6">
                          <span className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest"
                            style={{ background: `${SECTOR_COLORS[ngo.sector || ngo.category] || '#666'}20`, color: SECTOR_COLORS[ngo.sector || ngo.category] || '#aaa' }}>
                            {ngo.sector || ngo.category || '—'}
                          </span>
                        </td>
                        <td className="py-5 pr-6 text-gray-400">{ngo.city}</td>
                        <td className="py-5 pr-6 text-gray-500 text-xs">{new Date(ngo.created_at).toLocaleDateString()}</td>
                        <td className="py-5">
                          <button onClick={() => setReviewNgo(ngo)}
                            className="px-5 py-2.5 rounded-xl bg-blue-600/10 border border-blue-600/30 text-blue-400 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600/20 transition-all">
                            Review →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* ── TAB: ACTIVE NGOs ──────────────────────── */}
        {tab === 'active' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight">Active NGOs</h1>
                <p className="text-gray-500 text-sm mt-1">{activeNgos.length} approved NGOs</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['all', ...SECTORS].map(s => (
                  <button key={s} onClick={() => setSectorFilter(s)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sectorFilter === s ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredActive.map((ngo: any) => {
                const ms = ngo.milestones || [];
                const done = ms.filter((m: any) => m.status === 'RELEASED').length;
                const total = ms.length;
                const allDone = total > 0 && done === total;
                return (
                  <div key={ngo.id} className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-3xl flex items-center justify-between gap-6 hover:border-white/[0.12] transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-black text-white truncate">{ngo.name}</h3>
                        {ngo.is_govt_verified && <span className="px-2 py-0.5 bg-[#16a34a]/20 border border-[#16a34a]/30 text-[#16a34a] text-[8px] font-black rounded-lg uppercase tracking-widest">Govt Verified ✓</span>}
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold">
                        <span>{ngo.darpan_id || '—'}</span>
                        <span>{ngo.category || ngo.sector}</span>
                        <span>Milestones: {done}/{total}</span>
                        <span>Score: {ngo.transparency_score || 0}</span>
                      </div>
                    </div>
                    {allDone && !ngo.is_govt_verified && (
                      <motion.button onClick={() => handleMarkVerified(ngo)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                        className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white font-black text-[10px] uppercase tracking-widest whitespace-nowrap shadow-lg">
                        Mark Verified ✓
                      </motion.button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── TAB: ASSIGN MILESTONES ─────────────────── */}
        {tab === 'milestones' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Assign Milestones</h1>
              <p className="text-gray-500 text-sm mt-1">Search an NGO and manage their milestones</p>
            </div>

            <div className="flex gap-3">
              <input type="text" value={milestoneSearch} onChange={e => setMilestoneSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchMilestoneNgo()}
                placeholder="Search by NGO name or Darpan ID..."
                className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-blue-400/40 transition-all" />
              <button onClick={searchMilestoneNgo} className="px-6 py-4 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center gap-2">
                <Search size={16}/> Search
              </button>
            </div>

            {milestoneNgo && (
              <div className="space-y-6">
                <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                  <p className="font-black text-white">{milestoneNgo.name}</p>
                  <p className="text-blue-400 text-xs">{milestoneNgo.darpan_id} · {milestoneNgo.category}</p>
                </div>

                <AddMilestoneForm ngoId={milestoneNgo.id} onAdded={async () => {
                  const { data } = await supabase.from('milestones').select('*').eq('ngo_id', milestoneNgo.id).order('created_at');
                  setMilestones(data || []);
                }} />

                <div className="space-y-3">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Existing Milestones ({milestones.length})</h3>
                  {milestones.map((m: any) => (
                    <div key={m.id} className="p-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <p className="font-black text-sm text-white">{m.title}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{m.required_proof}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                        m.status === 'RELEASED' ? 'text-[#16a34a] border-[#16a34a]/30 bg-[#16a34a]/10' :
                        m.status === 'UNLOCKED' ? 'text-amber-400 border-amber-400/30 bg-amber-400/10' :
                        'text-gray-500 border-gray-500/30'
                      }`}>{m.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── TAB: BLACKLISTED ──────────────────────── */}
        {tab === 'blacklisted' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Blacklisted NGOs</h1>
              <p className="text-gray-500 text-sm mt-1">{blacklisted.length} NGOs under review or suspended</p>
            </div>

            {blacklisted.length === 0 ? (
              <div className="p-16 text-center text-gray-600 border border-dashed border-white/10 rounded-3xl">
                <Shield size={40} className="mx-auto mb-4 opacity-30" />
                <p className="font-bold">No flagged NGOs</p>
              </div>
            ) : (
              <div className="space-y-4">
                {blacklisted.map(ngo => (
                  <div key={ngo.id} className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl flex items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-black text-white">{ngo.name}</h3>
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          ngo.status === 'suspended' ? 'text-red-400 border-red-400/30 bg-red-400/10' : 'text-amber-400 border-amber-400/30 bg-amber-400/10'
                        }`}>{ngo.status}</span>
                      </div>
                      <div className="flex gap-4 text-[10px] text-gray-500 font-bold">
                        <span>{ngo.darpan_id || '—'}</span>
                        <span>{ngo.city}</span>
                        <span>{ngo.complaint_count || 0} complaints</span>
                        <span>Score: {ngo.transparency_score || 0}</span>
                      </div>
                    </div>
                    <button onClick={() => handleReinstate(ngo)}
                      className="px-5 py-3 rounded-2xl bg-[#16a34a]/10 border border-[#16a34a]/30 text-[#16a34a] font-black text-[10px] uppercase tracking-widest hover:bg-[#16a34a]/20 transition-all whitespace-nowrap">
                      Reinstate
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── TAB: REPORTS ──────────────────────────── */}
        {tab === 'reports' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            <h1 className="text-3xl font-black tracking-tight">Reports & Analytics</h1>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total NGOs', value: stats.total, icon: <Building2 size={24}/>, color: '#3b82f6' },
                { label: 'Pending Review', value: stats.pending, icon: <Clock size={24}/>, color: '#f59e0b' },
                { label: 'Govt Verified', value: stats.verified, icon: <Shield size={24}/>, color: '#16a34a' },
                { label: 'Active Users', value: '—', icon: <Users size={24}/>, color: '#a855f7' },
              ].map((s, i) => (
                <div key={i} className="p-8 bg-white/[0.03] border border-white/[0.06] rounded-[2rem] space-y-4">
                  <div style={{ color: s.color }}>{s.icon}</div>
                  <div>
                    <p className="text-2xl font-black text-white">{s.value}</p>
                    <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-black mt-1">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-white/[0.03] border border-white/[0.06] rounded-[2rem] space-y-6">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">NGOs by Sector</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sectorData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0d160d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {sectorData.map((entry, index) => (
                      <Cell key={index} fill={SECTOR_COLORS[entry.name] || '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </main>

      {/* Review Slide-over */}
      <AnimatePresence>
        {reviewNgo && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-30" onClick={() => setReviewNgo(null)} />
            <ReviewPanel ngo={reviewNgo} officialId={official?.id}
              onClose={() => setReviewNgo(null)}
              onAction={(type, ngo, reason) => type === 'approve' ? handleApprove(ngo) : handleReject(ngo, reason!)} />
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
