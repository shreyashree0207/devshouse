"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, getCurrentUser } from '../../../lib/supabase';
import Navbar from '../../../components/Navbar';
import TrustScoreBreakdown from '../../../components/TrustScoreBreakdown';
import BeforeAfterComparison from '../../../components/BeforeAfterComparison';
import ImpactCertificate from '../../../components/ImpactCertificate';
import AuditControl from '../../../components/AuditControl';
import { 
  History, Clock, Target, Wallet, Calendar, MapPin, 
  ArrowRight, ShieldCheck, Info, ChevronRight, Activity as ActivityIcon,
  Download, Share2
} from 'lucide-react';
import { generateImpactMessage } from '../../../lib/gemini';
import html2canvas from 'html2canvas';

export default function ActivityDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<any>(null);
  const [proof, setProof] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [donating, setDonating] = useState(false);
  const [donationAmount, setDonationAmount] = useState(500);

  useEffect(() => {
    const init = async () => {
      setUser(await getCurrentUser());
      
      const { data: act } = await supabase.from('activities').select('*, ngos(*)').eq('id', id).single();
      if (!act) { router.push('/ngos'); return; }
      setActivity(act);

      const { data: prf } = await supabase.from('proof_submissions')
        .select('*').eq('activity_id', id).eq('status', 'verified').single();
      setProof(prf);
      
      setLoading(false);
    };
    init();
  }, [id, router]);

  const handleDonate = async () => {
    if (!user) { router.push('/login'); return; }
    setDonating(true);
    
    try {
      // 1. Insert donation
      const { data: donation } = await supabase.from('donations').insert({
        activity_id: activity.id,
        ngo_id: activity.ngo_id,
        user_id: user.id,
        amount: donationAmount,
        released: false,
        donor_name: user.user_metadata?.full_name || 'Anonymous'
      }).select().single();

      // 2. Update activity totals
      await supabase.from('activities').update({
        raised_amount: activity.raised_amount + donationAmount,
        donor_count: activity.donor_count + 1
      }).eq('id', activity.id);

      // 3. Refresh activity data
      setActivity((prev: any) => ({
        ...prev,
        raised_amount: prev.raised_amount + donationAmount,
        donor_count: prev.donor_count + 1
      }));

      // 4. Success state (in-page)
      alert("Donation successful! Your contribution is held in escrow until verification proof is uploaded.");
    } catch (err) {
      console.error(err);
    } finally {
      setDonating(false);
    }
  };

  const downloadCertificate = async () => {
    const el = document.getElementById('impact-certificate');
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#0d1117' });
    const link = document.createElement('a');
    link.download = `sustainify-impact-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (loading) return (
     <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
        <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="w-16 h-16 border-4 border-[#16a34a]/30 border-t-[#16a34a] rounded-full" />
     </div>
  );

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-jakarta">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-20">
         <div className="flex flex-col lg:flex-row gap-12">
            
            {/* LEFT — Activity detail: 60% */}
            <div className="flex-grow lg:w-[60%] space-y-10">
               {/* Cover/Before Photo */}
               <div className="relative h-[450px] rounded-[3rem] overflow-hidden border-2 border-gray-800 shadow-2xl group">
                  <img 
                    src={activity.before_image || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200'} 
                    alt="Activity" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  
                  <div className="absolute top-10 left-10 z-10 flex flex-wrap gap-3">
                     <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-2xl ${
                        activity.status === 'fundraising' ? 'bg-blue-600 border-blue-400/50' :
                        activity.status === 'in_progress' ? 'bg-amber-600 border-amber-400/50' :
                        activity.status === 'proof_submitted' ? 'bg-purple-600 border-purple-400/50' :
                        activity.status === 'verified' ? 'bg-[#16a34a] border-white/30' : 'bg-red-600 border-red-400/50'
                     }`}>
                        {activity.status.replace('_', ' ')} Impact
                     </span>
                     <span className="px-5 py-2.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest">
                        {activity.category}
                     </span>
                  </div>
               </div>

               {/* Title & Stats */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3 text-xs font-black text-gray-500 uppercase tracking-[0.4em]">
                     <MapPin size={16} className="text-[#16a34a]" /> {activity.location_name} • NGO {activity.ngos.name}
                  </div>
                  <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] text-white">{activity.title}</h1>
                  <p className="text-xl text-gray-400 leading-relaxed font-medium">
                     {activity.description}
                  </p>
               </div>

               {/* Timelines/Deadlines */}
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="card p-6 bg-white/5 border-white/10 border-dashed rounded-3xl">
                     <Calendar className="text-[#16a34a] mb-3" size={24} />
                     <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none mb-2">Final Deadline</p>
                     <p className="text-lg font-black">{new Date(activity.deadline).toLocaleDateString()}</p>
                  </div>
                  <div className="card p-6 bg-white/5 border-white/10 border-dashed rounded-3xl">
                     <Target className="text-blue-400 mb-3" size={24} />
                     <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none mb-2">Target Goal</p>
                     <p className="text-lg font-black">₹{activity.target_amount.toLocaleString()}</p>
                  </div>
                  <div className="card p-6 bg-white/5 border-white/10 border-dashed rounded-3xl">
                     <Wallet className="text-purple-400 mb-3" size={24} />
                     <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none mb-2">Funds Raised</p>
                     <p className="text-lg font-black text-[#16a34a]">₹{activity.raised_amount.toLocaleString()}</p>
                  </div>
               </div>

               {/* IF VERIFIED — PROOF SECTION */}
               {activity.status === 'verified' && proof ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pt-10 border-t border-gray-800">
                     <div>
                        <h2 className="text-sm font-black text-[#16a34a] uppercase tracking-[0.4em] mb-8">VERIFIED PROOF OF IMPACT</h2>
                        <BeforeAfterComparison 
                           beforeUrl={activity.before_image || ''} 
                           afterUrl={proof.after_image_url} 
                        />
                     </div>

                     <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                           <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                              <ShieldCheck size={16} className="text-[#16a34a]" /> Analysis Breakdown
                           </h3>
                           <TrustScoreBreakdown 
                              reverse={proof.reverse_image_score}
                              geotag={proof.geotag_match_score}
                              content={proof.content_match_score}
                              beforeAfter={proof.before_after_score}
                              overall={proof.overall_trust_score}
                              flags={proof.spoofing_flags || []}
                           />
                           <div className="p-6 bg-[#16a34a]/5 border border-[#16a34a]/20 rounded-3xl">
                              <h4 className="text-[10px] font-black text-[#16a34a] uppercase tracking-widest mb-2">AI VERDICT</h4>
                              <p className="text-sm font-medium italic text-gray-300">&quot;{proof.ai_verdict}&quot;</p>
                              <div className="flex flex-wrap gap-2 mt-4">
                                 {proof.ai_tags?.map((tag: string, i: number) => (
                                    <span key={i} className="text-[10px] font-bold px-2 py-1 bg-black/40 text-gray-400 rounded-lg">#{tag}</span>
                                 ))}
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                 <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <MapPin size={16} className="text-[#16a34a]" /> Geospatial Audit
                                 </h3>
                                 <AuditControl imageUrl={proof.after_image_url} />
                              </div>
                              <div className="card p-8 bg-[#161b22] border-gray-800 rounded-3xl space-y-6 overflow-hidden relative">
                              <div className="space-y-4 relative z-10">
                                 {[
                                    { l: 'Location Verified', v: proof.location_name, ic: <MapPin size={14} className="text-[#16a34a]"/> },
                                    { l: 'Capture Device', v: proof.device_timestamp ? 'EXIF Encrypted' : 'Device: Unknown', ic: <ShieldCheck size={14} className="text-blue-400"/> },
                                    { l: 'Verification Time', v: new Date(proof.created_at).toLocaleString(), ic: <Clock size={14} className="text-amber-400"/> },
                                 ].map((d, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                       <div className="mt-1">{d.ic}</div>
                                       <div>
                                          <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{d.l}</p>
                                          <p className="text-[11px] font-bold text-gray-200">{d.v}</p>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                              <div className="pt-6">
                                 <button 
                                    onClick={() => alert("Opening Map Preview...")}
                                    className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-gray-800/40 border border-gray-700 hover:bg-gray-800 transition-colors"
                                 >
                                    <span className="text-[10px] font-black uppercase tracking-widest">Small Map Snippet Placeholder</span>
                                    <ChevronRight size={14} />
                                 </button>
                              </div>
                              </div>
                           </div>

                           <div className="space-y-4">
                              <button 
                                onClick={handleDonate} 
                                className="w-full px-8 py-5 rounded-[2rem] bg-[#16a34a] text-black font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(22,163,94,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                              >
                                 <Share2 size={16} /> Share Your Impact
                              </button>
                              <button 
                                onClick={downloadCertificate}
                                className="w-full px-8 py-5 rounded-[2rem] bg-gray-800 text-white font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 border border-gray-700 hover:bg-gray-700 transition-all"
                              >
                                 <Download size={16} /> Download Impact Certificate
                              </button>
                           </div>
                        </div>
                     </div>
                     
                     {/* Hidden Certificate for Canvas Capture */}
                     <div className="fixed left-[-2000px] top-0 pointer-events-none">
                        <ImpactCertificate 
                           donorName={user?.user_metadata?.full_name || 'Guardian'}
                           amount={donationAmount}
                           activityTitle={activity.title}
                           district={activity.ngos.district}
                           ngoName={activity.ngos.name}
                           proofImageUrl={proof.after_image_url}
                           trustScore={proof.overall_trust_score}
                           darpanId={activity.ngos.darpan_id || 'NOT FOUND'}
                        />
                     </div>
                  </motion.div>
               ) : (
                  <div className="card p-12 bg-white/[0.02] border-dashed border-gray-800 rounded-[3rem] text-center space-y-4">
                     <History size={48} className="mx-auto text-gray-800" />
                     <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                        Proof verification data will appear here once the NGO uploads their impact documentation.
                     </p>
                  </div>
               )}
            </div>

            {/* RIGHT PANEL — Donation Sticky: 40% */}
            <div className="lg:w-[40%]">
               <div className="sticky top-32 space-y-6">
                  <div className="card p-8 bg-[#161b22] border-gray-800 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-[#16a34a] opacity-[0.03] rounded-full blur-[40px] pointer-events-none" />
                     
                     <h3 className="text-xs font-black text-[#16a34a] uppercase tracking-[0.3em] mb-8">FUND THIS ACTIVITY</h3>
                     
                     {/* Dynamic Progress */}
                     <div className="space-y-4 mb-10">
                        <div className="flex justify-between items-end">
                           <p className="text-3xl font-black tracking-tighter">₹{activity.raised_amount.toLocaleString()}</p>
                           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Target: ₹{activity.target_amount.toLocaleString()}</p>
                        </div>
                        <div className="h-4 w-full bg-gray-800 rounded-full overflow-hidden p-1">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(activity.raised_amount / activity.target_amount) * 100}%` }}
                              className="h-full bg-[#16a34a] rounded-full shadow-[0_0_15px_rgba(22,163,94,0.5)]"
                           />
                        </div>
                        <div className="flex items-center gap-2">
                           <ActivityIcon size={12} className="text-[#16a34a]" />
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{activity.donor_count} Guardians are already backing this</p>
                        </div>
                     </div>

                     {/* Amount Chips */}
                     <div className="grid grid-cols-3 gap-3 mb-10">
                        {[100, 500, 1000].map((amt) => (
                           <button
                             key={amt}
                             onClick={() => setDonationAmount(amt)}
                             className={`py-6 rounded-3xl text-sm font-black transition-all border ${
                                donationAmount === amt 
                                  ? 'bg-[#16a34a] text-black border-[#16a34a] shadow-xl scale-105' 
                                  : 'bg-black/40 text-gray-400 border-gray-800 hover:text-white hover:border-gray-600'
                             }`}
                           >
                              ₹{amt}
                           </button>
                        ))}
                     </div>

                     <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 mb-8 space-y-3">
                        <div className="flex items-center gap-2 text-amber-400 font-black text-[10px] uppercase tracking-widest">
                           <ShieldCheck size={14} /> SECURITY PROTOCOL
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                           Your donation is held securely in escrow until this NGO uploads verified photo proof.
                           If proof isn't submitted by <span className="text-white font-bold">{new Date(activity.deadline).toLocaleDateString()}</span>, 
                           your donation is automatically refunded.
                        </p>
                     </div>

                     <button 
                        disabled={donating || activity.status === 'verified'}
                        onClick={handleDonate}
                        className="w-full py-6 rounded-3xl bg-[#16a34a] text-black font-black text-xs uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(22,163,94,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                     >
                        {donating ? 'ESTABLISHING ESCROW...' : activity.status === 'verified' ? 'FUNDING COMPLETE ✓' : 'BACK THIS ACTIVITY'}
                     </button>
                  </div>
               </div>
            </div>

         </div>
      </main>
    </div>
  );
}
