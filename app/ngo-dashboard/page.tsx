"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, getCurrentUser, signOut } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';
import { 
  BarChart3, Target, Upload, Wallet, Plus, CheckCircle2, Clock, 
  TrendingUp, LogOut, Building2, Shield, Camera, MapPin, 
  AlertTriangle, Loader2, Info, ChevronRight, Activity as ActivityIcon,
  ShieldCheck, Calendar
} from 'lucide-react';
import Link from 'next/link';
import { extractImageMetadata } from '../../lib/exif';
import { verifyProofSubmission } from '../../lib/gemini';
import VerificationProgress from '../../components/VerificationProgress';

export default function NgoDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ngo, setNgo] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview' | 'activities' | 'proof' | 'donations'>('overview');
  const [loading, setLoading] = useState(true);

  // Activity Form
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({ 
    title: '', description: '', category: 'Education', target_amount: '', deadline: '', location_name: '' 
  });

  // Upload Flow State
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [uploadStep, setUploadStep] = useState(0); // 0: list, 1: before, 2: after/exif, 3: verify
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageMetadata, setImageMetadata] = useState<any>(null);
  const [verificationScores, setVerificationScores] = useState<any>({
    reverse: null, geotag: null, content: null, beforeAfter: null, overall: null
  });
  const [verifying, setVerifying] = useState(false);
  const [verifResult, setVerifResult] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const u = await getCurrentUser();
      if (!u || u.user_metadata?.role !== 'ngo') { router.push('/login'); return; }
      setUser(u);
      let ngoId = u.user_metadata?.ngo_id;
      
      // DEVELOPMENT FALLBACK: If metadata is missing, check localStorage
      if (!ngoId) {
        ngoId = localStorage.getItem('sustainify_ngo_id');
      }

      if (!ngoId) { router.push('/ngo-pending'); return; }

      const [nRes, aRes, dRes] = await Promise.all([
        supabase.from('ngos').select('*').eq('id', ngoId).single(),
        supabase.from('activities').select('*').eq('ngo_id', ngoId).order('created_at', { ascending: false }),
        supabase.from('donations').select('*').eq('ngo_id', ngoId).order('created_at', { ascending: false }),
      ]);
      
      if (nRes.data) setNgo(nRes.data);
      if (aRes.data) setActivities(aRes.data);
      if (dRes.data) setDonations(dRes.data);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleAddActivity = async () => {
    if (!newActivity.title || !ngo) return;
    const { data } = await supabase.from('activities').insert({
      ngo_id: ngo.id,
      ...newActivity,
      target_amount: parseInt(newActivity.target_amount) || 0,
      status: 'fundraising'
    }).select().single();
    
    if (data) setActivities(prev => [data, ...prev]);
    setShowAddActivity(false);
    setNewActivity({ title: '', description: '', category: 'Education', target_amount: '', deadline: '', location_name: ngo.district });
  };

  const processProof = async () => {
    if (!imageFile || !selectedActivity) return;
    setVerifying(true);
    setUploadStep(3);

    try {
      // 1. Upload After Image
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${selectedActivity.id}-after-${Date.now()}.${fileExt}`;
      const { data: uploadData } = await supabase.storage.from('proofs').upload(fileName, imageFile);
      const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(fileName);

      // 2. Prep for AI
      const reader = new FileReader();
      const afterBase64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(imageFile);
      });
      const afterBase64 = await afterBase64Promise;

      let beforeBase64 = undefined;
      if (selectedActivity.before_image) {
         // In real scenario, we'd fetch and convert to base64
      }

      // 3. AI Verification
      const result = await verifyProofSubmission({
        afterImageBase64: afterBase64,
        beforeImageBase64: beforeBase64,
        activityDescription: selectedActivity.description,
        ngoDistrict: ngo.district,
        submittedLat: imageMetadata?.latitude || 0,
        submittedLng: imageMetadata?.longitude || 0,
        ngoLat: ngo.latitude || 0,
        ngoLng: ngo.longitude || 0
      });

      setVerificationScores({
        reverse: result.reverse_image_score,
        geotag: result.geotag_match_score,
        content: result.content_match_score,
        beforeAfter: result.before_after_score,
        overall: result.overall_trust_score
      });
      setVerifResult(result);

      // 4. Save Submission
      const { data: sub } = await supabase.from('proof_submissions').insert({
        activity_id: selectedActivity.id,
        ngo_id: ngo.id,
        after_image_url: publicUrl,
        description: "Activity proof submission",
        latitude: imageMetadata?.latitude || 0,
        longitude: imageMetadata?.longitude || 0,
        location_name: imageMetadata?.hasGps ? "Verified GPS Location" : "Manual/No GPS",
        reverse_image_score: result.reverse_image_score,
        geotag_match_score: result.geotag_match_score,
        content_match_score: result.content_match_score,
        before_after_score: result.before_after_score,
        overall_trust_score: result.overall_trust_score,
        ai_verdict: result.verdict,
        ai_tags: result.tags,
        spoofing_flags: result.spoofing_flags,
        status: result.authentic ? 'verified' : 'pending'
      }).select().single();

      // 5. Update Activity Status
      const newStatus = result.authentic ? 'verified' : result.overall_trust_score < 40 ? 'flagged' : 'proof_submitted';
      await supabase.from('activities').update({ status: newStatus }).eq('id', selectedActivity.id);
      
      setActivities(prev => prev.map(a => a.id === selectedActivity.id ? { ...a, status: newStatus } : a));

      // 6. If verified, release funds & notify (Simulated)
      if (result.authentic) {
         await supabase.from('donations').update({ released: true }).eq('activity_id', selectedActivity.id);
         // Transparency Score Update
         const newAvg = Math.round((ngo.transparency_score + result.overall_trust_score) / 2);
         await supabase.from('ngos').update({ transparency_score: newAvg }).eq('id', ngo.id);
         setNgo({ ...ngo, transparency_score: newAvg });
      }

    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  const handleFileChange = async (e: any) => {
     const file = e.target.files[0];
     if (!file) return;
     setImageFile(file);
     const meta = await extractImageMetadata(file);
     setImageMetadata(meta);
     setUploadStep(2);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a110a]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-[#16a34a]/20 border-t-[#16a34a] rounded-full" />
    </div>
  );
  if (!ngo || !user) return null;

  const tabs = [
    { key: 'overview', label: 'Dashboard', icon: <BarChart3 size={16} /> },
    { key: 'activities', label: 'Activities', icon: <ActivityIcon size={16} /> },
    { key: 'proof', label: 'Submit Proof', icon: <Upload size={16} /> },
    { key: 'donations', label: 'Finance', icon: <Wallet size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a110a] text-white font-jakarta">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-[280px] h-screen sticky top-0 border-r border-white/[0.06] bg-black/40 pt-24 px-6 pb-6">
          <div className="space-y-6 mb-10">
            <div className="relative w-20 h-20 mx-auto">
               <img src={ngo.cover_image || 'https://via.placeholder.com/150'} alt={ngo.name}
                 className="w-full h-full rounded-3xl object-cover border-2 border-[#16a34a]/30 shadow-2xl" />
               <div className="absolute -bottom-2 -right-2 bg-[#16a34a] p-1.5 rounded-xl border-2 border-[#0a110a]">
                  <Shield size={12} className="text-black" />
               </div>
            </div>
            <div className="text-center">
              <p className="text-white font-black text-sm uppercase tracking-tight">{ngo.name}</p>
              <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">{ngo.district}</p>
              <div className="mt-4 flex flex-col gap-2">
                 <span className="px-3 py-1 bg-[#16a34a]/10 border border-[#16a34a]/20 rounded-xl text-[9px] font-black text-[#16a34a] uppercase tracking-widest">
                    Darpan: {user.user_metadata?.darpan_id}
                 </span>
                 <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-white uppercase tracking-widest">
                    <ShieldCheck size={10} className="text-[#16a34a]" /> Trust: {ngo.transparency_score}
                 </div>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 space-y-2">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  tab === t.key 
                    ? 'bg-[#16a34a] text-black shadow-[0_10px_20px_rgba(22,163,94,0.3)]' 
                    : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                }`}>{t.icon} {t.label}</button>
            ))}
          </nav>

          <button onClick={() => signOut()} className="flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-red-400 transition-all mt-6">
            <LogOut size={16} /> Sign Out
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 pt-32 px-6 lg:px-12 pb-20 min-h-screen">
          
          {tab === 'overview' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                 {/* Score Banner */}
                 {ngo.transparency_score < 60 && (
                    <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/20 flex gap-8 items-center relative overflow-hidden group">
                       <div className="absolute top-[-20%] left-[-10%] w-32 h-32 bg-amber-500 opacity-[0.03] rounded-full blur-[40px] pointer-events-none" />
                       <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                          <AlertTriangle size={36} className="text-amber-500" />
                       </div>
                       <div className="flex-grow space-y-2">
                          <h3 className="text-xs font-black text-white uppercase tracking-widest">Trust Optimization Required</h3>
                          <p className="text-[11px] text-gray-500 leading-relaxed font-bold italic">
                             &quot;Your transparency score of {ngo.transparency_score} is below the Tamil Nadu standard. Upload high-res impact proof with EXIF GPS data to restore full funding priority.&quot;
                          </p>
                       </div>
                       <button className="px-6 py-3 rounded-2xl bg-amber-600 text-black font-black text-[9px] uppercase tracking-widest shrink-0 hover:scale-105 transition-transform shadow-xl">
                          Fix Now
                       </button>
                    </div>
                 )}

                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { l: 'Total Treasury', v: `₹${(ngo.raised_amount || 0).toLocaleString()}`, ic: <TrendingUp size={24} />, c: '#16a34a' },
                      { l: 'Total Guardians', v: String(ngo.donor_count || donations.length), ic: <Wallet size={24} />, c: '#3b82f6' },
                      { l: 'Active Goals', v: String(activities.length), ic: <Target size={24} />, c: '#a855f7' },
                      { l: 'Certified Impact', v: String(activities.filter(a => a.status === 'verified').length), ic: <Shield size={24} />, c: '#eab308' },
                    ].map((s, i) => (
                      <div key={i} className="card p-8 bg-white/[0.03] border-white/10 rounded-[2.5rem] space-y-4 hover:border-[#16a34a]/30 transition-colors group">
                        <div style={{ color: s.c }} className="group-hover:scale-110 transition-transform">{s.ic}</div>
                        <div>
                           <p className="text-2xl font-black text-white">{s.v}</p>
                           <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-black mt-1">{s.l}</p>
                        </div>
                      </div>
                    ))}
                 </div>

                 {/* Recent Activities Section */}
                 <div className="space-y-6">
                    <div className="flex justify-between items-end">
                       <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Live Activities</h2>
                       <button onClick={() => setTab('activities')} className="text-[10px] font-black text-[#16a34a] uppercase tracking-widest hover:underline">Manage All →</button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                       {activities.slice(0, 2).map(a => (
                          <Link href={`/activities/${a.id}`} key={a.id} className="card p-8 bg-white/[0.03] border-white/10 rounded-[2.5rem] flex items-center gap-6 group hover:bg-[#16a34a]/5 transition-all">
                             <div className="w-20 h-20 rounded-3xl overflow-hidden shrink-0 border border-white/10">
                                <img src={a.before_image || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                             </div>
                             <div className="flex-grow">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border mb-2 inline-block ${
                                   a.status === 'verified' ? 'text-[#16a34a] border-[#16a34a]/30 bg-[#16a34a]/10' : 'text-amber-400 border-amber-400/30 bg-amber-400/10'
                                }`}>{a.status}</span>
                                <h3 className="text-sm font-black text-white">{a.title}</h3>
                                <p className="text-[10px] text-gray-500 font-bold mt-1">₹{a.raised_amount.toLocaleString()} raised</p>
                             </div>
                             <ChevronRight size={20} className="text-gray-700 group-hover:text-white transition-colors" />
                          </Link>
                       ))}
                    </div>
                 </div>
             </motion.div>
          )}

          {tab === 'activities' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-black tracking-tight">Mission Control</h2>
                   <button 
                     onClick={() => setShowAddActivity(!showAddActivity)}
                     className="px-6 py-3 rounded-2xl bg-[#16a34a] text-black font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all"
                   >
                      <Plus size={16} /> New Activity
                   </button>
                </div>

                <AnimatePresence>
                   {showAddActivity && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                         <div className="card p-10 bg-white/[0.03] border-[#16a34a]/20 rounded-[2.5rem] space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Activity Title</label>
                                  <input 
                                    value={newActivity.title}
                                    onChange={e => setNewActivity({...newActivity, title: e.target.value})}
                                    placeholder="e.g. Distribute 50 Medical Kits in Salem"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#16a34a] outline-none transition-all"
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Funding Goal (₹)</label>
                                  <input 
                                    type="number"
                                    value={newActivity.target_amount}
                                    onChange={e => setNewActivity({...newActivity, target_amount: e.target.value})}
                                    placeholder="50000"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#16a34a] outline-none transition-all"
                                  />
                               </div>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Description</label>
                               <textarea 
                                 value={newActivity.description}
                                 onChange={e => setNewActivity({...newActivity, description: e.target.value})}
                                 placeholder="Detailed mission objective..."
                                 rows={3}
                                 className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#16a34a] outline-none transition-all resize-none"
                               />
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Deadline</label>
                                  <input 
                                    type="date"
                                    value={newActivity.deadline}
                                    onChange={e => setNewActivity({...newActivity, deadline: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#16a34a] outline-none"
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Category</label>
                                  <select 
                                    value={newActivity.category}
                                    onChange={e => setNewActivity({...newActivity, category: e.target.value})}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                                  >
                                     <option value="Education">Education</option>
                                     <option value="Health">Health</option>
                                     <option value="Environment">Environment</option>
                                     <option value="Community">Community</option>
                                  </select>
                               </div>
                               <div className="space-y-2 flex items-end">
                                  <button onClick={handleAddActivity} className="w-full py-4 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-[#16a34a] hover:text-black transition-all">Launch Activity</button>
                               </div>
                            </div>
                         </div>
                      </motion.div>
                   )}
                </AnimatePresence>

                <div className="space-y-4">
                   {activities.map(a => (
                      <div key={a.id} className="card p-8 bg-white/[0.03] border-white/10 rounded-[2.5rem] flex items-center justify-between group hover:border-white/20 transition-all">
                         <div className="flex items-center gap-8">
                            <div className="w-16 h-16 rounded-3xl bg-black/60 flex items-center justify-center border border-white/5 font-black text-gray-700">
                               {a.title[0].toUpperCase()}
                            </div>
                            <div className="space-y-1">
                               <h3 className="text-lg font-black">{a.title}</h3>
                               <div className="flex items-center gap-4 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                  <span className="flex items-center gap-1"><Target size={10} /> ₹{a.target_amount.toLocaleString()} goal</span>
                                  <span className="flex items-center gap-1"><Calendar size={10} /> Due {new Date(a.deadline).toLocaleDateString()}</span>
                                  <span className={`px-2 py-0.5 rounded border ${
                                     a.status === 'verified' ? 'text-[#16a34a] border-[#16a34a]/30 bg-[#16a34a]/10' : 'text-amber-400 border-amber-400/30'
                                  }`}>{a.status}</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <Link href={`/activities/${a.id}`} className="p-4 rounded-2xl bg-black/40 border border-white/5 text-gray-500 hover:text-white hover:border-white/20 transition-all">
                               <ChevronRight size={18} />
                            </Link>
                         </div>
                      </div>
                   ))}
                </div>
             </motion.div>
          )}

          {tab === 'proof' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                {uploadStep === 0 && (
                   <div className="space-y-8">
                      <div className="space-y-2">
                         <h2 className="text-2xl font-black">Submit Implementation Proof</h2>
                         <p className="text-sm text-gray-500 font-bold">Select an active fundraising mission to upload your impact documentation.</p>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {activities.filter(a => a.status !== 'verified').map(a => (
                            <button 
                              key={a.id} 
                              onClick={() => { setSelectedActivity(a); setUploadStep(1); }}
                              className="card p-8 bg-white/[0.03] border-white/10 rounded-[2.5rem] text-left hover:border-[#16a34a]/30 transition-all group"
                            >
                               <div className="w-12 h-12 bg-[#16a34a]/10 border border-[#16a34a]/20 rounded-2xl flex items-center justify-center text-[#16a34a] mb-6 group-hover:scale-110 transition-transform">
                                  <Camera size={24} />
                               </div>
                               <h3 className="text-sm font-black mb-2">{a.title}</h3>
                               <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                  <span>{a.donor_count} Donors Waiting</span>
                               </div>
                            </button>
                         ))}
                      </div>
                   </div>
                )}

                {uploadStep === 1 && (
                   <div className="max-w-2xl mx-auto space-y-10">
                      <div className="flex items-center gap-4">
                         <button onClick={() => setUploadStep(0)} className="p-4 rounded-2xl bg-white/5 text-gray-400 hover:text-white">Back</button>
                         <h2 className="text-2xl font-black">Upload Impact Photo</h2>
                      </div>
                      
                      <div className="card p-12 bg-white/[0.03] border-dashed border-[#16a34a]/30 rounded-[3rem] text-center space-y-8 border-2">
                         <div className="w-24 h-24 bg-[#16a34a]/5 rounded-full flex items-center justify-center mx-auto border border-[#16a34a]/20">
                            <Upload size={32} className="text-[#16a34a]" />
                         </div>
                         <div className="space-y-2">
                            <p className="text-lg font-black uppercase tracking-tight">Drop your AFTER photo here</p>
                            <p className="text-xs text-gray-500 font-bold leading-relaxed px-10">
                               Crucial: Photo must be geo-tagged (GPS enabled) and taken at the actual implementation site.
                            </p>
                         </div>
                         <label className="block">
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            <span className="cursor-pointer inline-block px-10 py-5 bg-[#16a34a] text-black font-black text-[11px] uppercase tracking-widest rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all">Select Image</span>
                         </label>
                      </div>

                      <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/20 space-y-4">
                         <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <ShieldCheck size={14} /> NGO GUIDELINES
                         </h4>
                         <ul className="space-y-3">
                            <li className="flex gap-4 text-[11px] font-bold text-gray-500"><div className="w-1 h-1 rounded-full bg-amber-500 mt-2 shrink-0" /> No Stock Photos: AI will auto-blacklist NGOs using downloaded images.</li>
                            <li className="flex gap-4 text-[11px] font-bold text-gray-500"><div className="w-1 h-1 rounded-full bg-amber-500 mt-2 shrink-0" /> Location Lock: Photo GPS much match the NGO's registered district.</li>
                            <li className="flex gap-4 text-[11px] font-bold text-gray-500"><div className="w-1 h-1 rounded-full bg-amber-500 mt-2 shrink-0" /> Context: People or infrastructure from the activity MUST be visible.</li>
                         </ul>
                      </div>
                   </div>
                )}

                {uploadStep === 2 && (
                   <div className="max-w-xl mx-auto space-y-10">
                      <h2 className="text-2xl font-black text-center">Final Metadata Audit</h2>
                      
                      <div className="card p-10 bg-white/[0.03] border-white/10 rounded-[3rem] space-y-8">
                         <div className="h-64 rounded-[2rem] overflow-hidden border border-white/10">
                            {imageFile && <img src={URL.createObjectURL(imageFile)} alt="" className="w-full h-full object-cover" />}
                         </div>
                         
                         <div className="space-y-4">
                            {[
                               { l: 'GPS Data', v: imageMetadata?.hasGps ? 'Embedded ✓' : 'Missing ⚠', ic: <MapPin size={16} className={imageMetadata?.hasGps ? 'text-[#16a34a]' : 'text-red-500'}/> },
                               { l: 'Capture Time', v: imageMetadata?.timestamp || 'Unknown', ic: <Clock size={16} className="text-blue-400"/> },
                               { l: 'Device Model', v: imageMetadata?.device || 'Unknown', ic: <Shield size={16} className="text-purple-400"/> },
                            ].map((m, i) => (
                               <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5">
                                  <div className="flex items-center gap-3">
                                     {m.ic}
                                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{m.l}</span>
                                  </div>
                                  <span className="text-xs font-black">{m.v}</span>
                               </div>
                            ))}
                         </div>

                         {!imageMetadata?.hasGps && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold text-center">
                               WARNING: No GPS data detected. This submission may trigger a manual audit or risk flagging.
                            </div>
                         )}

                         <button 
                           onClick={processProof}
                           disabled={verifying}
                           className="w-full py-6 rounded-3xl bg-[#16a34a] text-black font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                         >
                            {verifying ? <Loader2 className="animate-spin" /> : <ShieldCheck size={18} />} Verify & Establish Proof
                         </button>
                      </div>
                   </div>
                )}

                {uploadStep === 3 && (
                   <div className="max-w-2xl mx-auto space-y-8">
                      <VerificationProgress 
                        currentStep={verifying ? (verificationScores.overall ? 4 : 2) : 5} 
                        scores={verificationScores} 
                      />
                      
                      {!verifying && verifResult && (
                         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-10 bg-black/60 border-2 border-[#16a34a]/30 rounded-[3rem] text-center space-y-8 shadow-3xl">
                            {verifResult.authentic ? (
                               <>
                                  <div className="w-24 h-24 bg-[#16a34a] rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(22,163,94,0.4)]">
                                     <CheckCircle2 size={48} className="text-black" />
                                  </div>
                                  <div className="space-y-3">
                                     <h3 className="text-4xl font-black tracking-tighter">IMPACT VERIFIED</h3>
                                     <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Trust score achieved: <span className="text-[#16a34a]">{verifResult.overall_trust_score}/100</span></p>
                                  </div>
                                  <div className="p-6 bg-[#16a34a]/10 border border-[#16a34a]/20 rounded-3xl text-sm font-medium italic text-gray-300">
                                     &quot;{verifResult.verdict}&quot;
                                  </div>
                                  <div className="flex gap-4 pt-4">
                                     <button onClick={() => setUploadStep(0)} className="flex-1 py-5 rounded-3xl bg-white text-black font-black text-[10px] uppercase tracking-[0.3em]">Done</button>
                                     <Link href={`/activities/${selectedActivity.id}`} className="flex-1 py-5 rounded-3xl bg-gray-800 text-white font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2">View Profile <ChevronRight size={14} /></Link>
                                  </div>
                               </>
                            ) : (
                               <>
                                  <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(220,38,38,0.4)]">
                                     <AlertTriangle size={48} className="text-white" />
                                  </div>
                                  <div className="space-y-3">
                                     <h3 className="text-4xl font-black tracking-tighter">FLAGGED FOR REVIEW</h3>
                                     <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Trust score: <span className="text-red-500">{verifResult.overall_trust_score}/100</span></p>
                                  </div>
                                  <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl space-y-4">
                                     <p className="text-sm font-medium italic text-gray-300">&quot;{verifResult.verdict}&quot;</p>
                                     <div className="flex flex-wrap gap-2 justify-center">
                                        {verifResult.spoofing_flags.map((f: string, i: number) => (
                                           <span key={i} className="px-3 py-1 bg-red-500/20 text-red-500 text-[8px] font-black uppercase rounded-lg border border-red-500/30">FLAG: {f}</span>
                                        ))}
                                     </div>
                                  </div>
                                  <button onClick={() => setUploadStep(0)} className="w-full py-5 rounded-3xl bg-gray-800 text-white font-black text-[10px] uppercase tracking-[0.3em]">Back to Activities</button>
                               </>
                            )}
                         </motion.div>
                      )}
                   </div>
                )}
             </motion.div>
          )}

          {tab === 'donations' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="card p-12 bg-white/[0.03] border-white/10 rounded-[3rem] flex justify-between items-end relative overflow-hidden">
                   <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-[#16a34a] opacity-[0.03] rounded-full blur-[60px] pointer-events-none" />
                   <div className="space-y-2 relative z-10">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Total Net Treasury</p>
                      <p className="text-6xl font-black tracking-tighter text-[#16a34a]">₹{(donations.reduce((s,d) => s + d.amount, 0)).toLocaleString()}</p>
                   </div>
                   <div className="text-right space-y-4 relative z-10">
                      <div className="px-5 py-2.5 rounded-2xl bg-[#16a34a]/10 border border-[#16a34a]/20 text-[#16a34a] text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2">
                         <ShieldCheck size={14} /> Audit passed
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">Last sync: Real-time</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest ml-4">Transactional History</h3>
                   {donations.map(d => (
                      <div key={d.id} className="card p-6 bg-white/[0.03] border-white/10 rounded-[2rem] flex items-center justify-between group hover:bg-white/[0.05] transition-all">
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-center font-black text-[#16a34a] text-sm">₹</div>
                            <div>
                               <p className="text-sm font-black">{d.donor_name || 'Anonymous Guardian'}</p>
                               <div className="flex items-center gap-3 text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                                  <span>{new Date(d.created_at).toLocaleDateString()}</span>
                                  <span className={`px-2 py-0.5 rounded border ${d.released ? 'text-[#16a34a] border-[#16a34a]/30' : 'text-amber-400 border-amber-400/30'}`}>
                                     {d.released ? 'COMPLETED' : 'ESCROW HOLD'}
                                  </span>
                               </div>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-lg font-black text-white">₹{d.amount.toLocaleString()}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </motion.div>
          )}

        </main>
      </div>
      
      {/* Background Decor */}
      <div className="fixed bottom-0 right-0 w-[50vw] h-[50vw] bg-[#16a34a] opacity-[0.02] rounded-full blur-[150px] pointer-events-none" />
    </div>
  );
}
