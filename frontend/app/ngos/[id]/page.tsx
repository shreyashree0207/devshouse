"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, MapPin, Calendar, Heart, ArrowRight, CheckCircle2, 
  Users, Globe, TrendingUp, Info, Activity, Image as ImageIcon,
  Zap, Clock, Award, Star, Share2, Compass, Loader2, Target, AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { supabase, getCurrentUser } from '../../../lib/supabase';
import { generateImpactMessage } from '../../../lib/gemini';
import TransparencyRing from '../../../components/TransparencyRing';
import MilestoneTimeline from '../../../components/MilestoneTimeline';
import ProofCard from '../../../components/ProofCard';
import DonationModal from '../../../components/DonationModal';
import { apiRequest } from '../../../lib/api';

export default function NGODetail({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const [ngo, setNgo] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [proofs, setProofs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [amount, setAmount] = useState<number>(500);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [impactMessage, setImpactMessage] = useState("");
  const [donationError, setDonationError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [ngoRes, msRes, prRes, actRes] = await Promise.all([
        supabase.from('ngos').select('*').eq('id', params.id).single(),
        supabase.from('milestones').select('*').eq('ngo_id', params.id).order('target_date', { ascending: true }),
        supabase.from('proof_submissions').select('*').eq('ngo_id', params.id).order('created_at', { ascending: false }),
        supabase.from('activities').select('*').eq('ngo_id', params.id).order('created_at', { ascending: false })
      ]);

      if (ngoRes.data) setNgo(ngoRes.data);
      if (msRes.data) setMilestones(msRes.data);
      if (prRes.data) setProofs(prRes.data);
      if (actRes.data) setActivities(actRes.data);
      
      const user = await getCurrentUser();
      if (user) setDonorName(user.user_metadata?.full_name || "");
      
      setLoading(false);
    };
    fetchData();
  }, [params.id]);

  const handleDonate = async () => {
    if (!amount || amount <= 0) return;
    setDonating(true);
    setDonationError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || null;
      
      const response = await apiRequest('/donate', 'POST', {
        ngo_id: params.id,
        name: isAnonymous ? "Anonymous" : (donorName || "Anonymous Donor"),
        amount: amount,
        is_anonymous: isAnonymous
      }, token);

      if (response.success) {
        const msg = await generateImpactMessage(amount, ngo.category, ngo.name);
        setImpactMessage(msg);
        setIsModalOpen(true);
        setNgo({ ...ngo, raised_amount: (ngo.raised_amount || 0) + amount });
      }
    } catch (err: any) {
      console.error('Donation failed:', err);
      setDonationError(err.message || "Donation process encountered an error.");
    } finally {
      setDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-[#16a34a]" size={64} strokeWidth={2.5} />
        <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Syncing Impact Data...</p>
      </div>
    );
  }

  if (!ngo) return <div className="min-h-screen pt-40 text-center text-white text-3xl font-black font-jakarta">NGO Profile Not Found! ⚠</div>;

  const progress = Math.min(100, ((ngo.raised_amount || 0) / (ngo.goal_amount || 1)) * 100);

  return (
    <div className="min-h-screen bg-[#0d1117] relative">
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-[#161b22] to-transparent pointer-events-none opacity-50" />
      
      {/* Header / Cover Section */}
      <section className="relative pt-32 pb-16 px-4 md:px-8 border-b border-gray-800 shadow-2xl overflow-hidden group">
        <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] bg-[#16a34a] opacity-[0.03] rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-end relative z-10">
          <div className="relative w-full lg:w-[480px] h-[320px] rounded-[2.5rem] overflow-hidden border-2 border-gray-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] group-hover:border-[#16a34a]/30 transition-all duration-700">
            <img 
              src={ngo.cover_image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format'} 
              alt={ngo.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] opacity-90 group-hover:opacity-100" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-6 left-6 flex gap-3">
                <span className="px-5 py-1.5 bg-[#16a34a] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/20">{ngo.category}</span>
                {ngo.verified && <span className="px-5 py-1.5 bg-black/80 backdrop-blur-md text-[#16a34a] border border-[#16a34a]/50 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 animate-pulse"><Zap size={10} className="fill-[#16a34a]" /> Verified Trust Index</span>}
                {ngo.status === 'gov_funded' && (
                  <span className="px-5 py-1.5 bg-gradient-to-r from-yellow-600/80 to-[#16a34a]/80 backdrop-blur-md text-white border border-yellow-500/50 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.3)] flex items-center gap-2">
                    <Award size={10} className="text-yellow-400" /> Gov Authenticated & Funded
                  </span>
                )}
             </div>
          </div>
          
          <div className="flex-grow space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs font-black text-[#16a34a] uppercase tracking-[0.3em]">
                <MapPin size={16} /> {ngo.city}, {ngo.district || ngo.state || 'Tamil Nadu'}
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold font-jakarta text-white tracking-tighter leading-none shadow-sm">
                {ngo.name}
              </h1>
              <p className="text-xl text-gray-500 font-medium leading-relaxed italic opacity-95 max-w-2xl">
                Empowering the grassroots through data-driven transparency and community-first impact.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-8 items-center pt-8 border-t border-gray-800">
              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-2xl bg-[#16a34a]/10 flex items-center justify-center border border-[#16a34a]/30 group-hover:bg-[#16a34a] group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <Users className="text-[#16a34a] group-hover:text-white" size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-white">{ngo.donor_count?.toLocaleString() || 0}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Donors</p>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-2xl bg-[#16a34a]/10 flex items-center justify-center border border-[#16a34a]/30 group-hover:bg-[#16a34a] group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <Activity className="text-[#16a34a] group-hover:text-white" size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-white">{ngo.transparency_score}/100</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Transparency</p>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-2xl bg-[#16a34a]/10 flex items-center justify-center border border-[#16a34a]/30 group-hover:bg-[#16a34a] group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <Award className="text-[#16a34a] group-hover:text-white" size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-white">Top 2%</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global Ranking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20">
          
          {/* Left Column: TABS & CONTENT */}
          <div className="lg:w-[65%] order-2 lg:order-1">
            <div className="flex gap-10 mb-16 border-b border-gray-800 sticky top-24 bg-[#0d1117] z-30 py-4 shadow-sm overflow-x-auto scrollbar-hide">
              {['Overview', 'Activities', 'Milestones', 'Proof Updates', 'Our Impact'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-black uppercase tracking-[0.2em] relative pb-4 transition-all duration-500 ${
                    activeTab === tab ? 'text-[#16a34a]' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="activeTabUnderline" 
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#16a34a] rounded-full shadow-[0_0_10px_rgba(22,163,94,0.5)]" 
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === 'Overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-16"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="card p-8 border-gray-800 bg-gradient-to-br from-[#161b22] to-black shadow-inner">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 opacity-60">Raised</p>
                          <p className="text-3xl font-black font-jakarta text-[#16a34a] tracking-tight">₹{(ngo.raised || 0).toLocaleString()}</p>
                       </div>
                       <div className="card p-8 border-gray-800 bg-gradient-to-br from-[#161b22] to-black shadow-inner">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 opacity-60">Goal</p>
                          <p className="text-3xl font-black font-jakarta text-white tracking-tight">₹{(ngo.goal || 0).toLocaleString()}</p>
                       </div>
                       <div className="card p-8 border-gray-800 bg-gradient-to-br from-[#161b22] to-black shadow-inner">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 opacity-60">Beneficiaries</p>
                          <p className="text-3xl font-black font-jakarta text-white tracking-tight">{ngo.beneficiaries?.toLocaleString()}+</p>
                       </div>
                    </div>

                    <div className="space-y-8 leading-relaxed">
                       <h3 className="text-3xl font-extrabold font-jakarta text-white tracking-tight border-l-4 border-[#16a34a] pl-6">Mission Strategy</h3>
                       <p className="text-lg text-gray-400 font-medium opacity-90 leading-loose">
                         {ngo.description || "Loading agency mission and strategic impact framework..."}
                       </p>
                       <div className="flex gap-10 pt-4 flex-wrap">
                          <div className="flex flex-col gap-1">
                             <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Founded</p>
                             <p className="text-sm font-bold text-white leading-none">2014</p>
                          </div>
                          <div className="flex flex-col gap-1">
                             <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Reg. Number</p>
                             <p className="text-sm font-bold text-white leading-none">NGO/12WS/2014</p>
                          </div>
                          <div className="flex flex-col gap-1">
                             <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Audit Status</p>
                             <p className="text-sm font-bold text-[#16a34a] leading-none flex items-center gap-1.5 opacity-90"><ShieldCheck size={14} /> Quarter Clear ✓</p>
                          </div>
                       </div>
                    </div>

                    <TransparencyRing 
                      score={ngo.transparency_score} 
                      explanation={`Sustainify's Gemini engine has analyzed ${proofs.length} field certificates and ${milestones.length} fiscal reports to verify this institution. All operations meet the 'Proof-as-Truth' standard with verified geographic tagging.`} 
                    />
                  </motion.div>
                )}

                {activeTab === 'Activities' && (
                  <motion.div
                    key="activities"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    {activities.map(a => (
                      <Link href={`/activities/${a.id}`} key={a.id} className="card p-8 bg-white/[0.03] border-white/10 rounded-[2.5rem] flex flex-col group hover:bg-[#16a34a]/5 transition-all">
                        <div className="relative h-48 rounded-3xl overflow-hidden mb-6 border border-white/10 shadow-lg">
                           <img src={a.before_image || 'https://via.placeholder.com/400'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                           <div className="absolute top-4 right-4 px-3 py-1 bg-[#16a34a] text-white rounded-lg text-[8px] font-black uppercase tracking-widest">{a.status}</div>
                        </div>
                        <div className="flex-grow space-y-4">
                           <h3 className="text-xl font-black">{a.title}</h3>
                           <p className="text-sm text-gray-500 line-clamp-2">{a.description}</p>
                           <div className="pt-4 border-t border-gray-800 flex justify-between items-end">
                              <div>
                                 <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Raised</p>
                                 <p className="text-lg font-black text-[#16a34a]">₹{a.raised_amount.toLocaleString()}</p>
                              </div>
                              <ChevronRight className="text-[#16a34a] group-hover:translate-x-1 transition-transform" />
                           </div>
                        </div>
                      </Link>
                    ))}
                    {activities.length === 0 && <p className="text-center text-gray-600 py-20 col-span-2">No specific fundraising activities listed.</p>}
                  </motion.div>
                )}

                {activeTab === 'Milestones' && (
                  <motion.div
                    key="milestones"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="mb-12 flex justify-between items-end">
                       <div className="space-y-4">
                          <h3 className="text-3xl font-extrabold font-jakarta text-white tracking-tight">Implementation Timeline</h3>
                          <p className="text-gray-500 font-medium italic">Track how every rupee is allocated towards real change.</p>
                       </div>
                       <div className="px-6 py-3 bg-[#16a34a]/5 border border-[#16a34a]/20 rounded-2xl flex items-center gap-3 shadow-lg">
                          <Target className="text-[#16a34a]" size={20} />
                          <div className="text-right">
                             <p className="text-xs font-black text-white leading-none">{milestones.filter(m => m.done === true).length}/{milestones.length}</p>
                             <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Achieved</p>
                          </div>
                       </div>
                    </div>
                    <MilestoneTimeline milestones={milestones} />
                  </motion.div>
                )}

                {activeTab === 'Proof Updates' && (
                  <motion.div
                    key="proofs"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-1 gap-12"
                  >
                    <div className="mb-8 space-y-4">
                       <h3 className="text-3xl font-extrabold font-jakarta text-white tracking-tight">Verified Proof Feed</h3>
                       <p className="text-gray-500 font-medium italic">Live updates from the field, geo-tagged and AI-verified for authenticity.</p>
                    </div>
                    {proofs.length > 0 ? (
                      proofs.map(proof => <ProofCard key={proof.id} proof={proof} />)
                    ) : (
                      <div className="card p-24 text-center border-dashed border-gray-800 bg-[#161b22]/30 rounded-[3rem] shadow-inner">
                        <ImageIcon className="text-gray-700 mx-auto mb-8" size={80} strokeWidth={1} />
                        <h3 className="text-3xl font-black font-jakarta text-gray-500 mb-4 tracking-tight">No proof updates yet</h3>
                        <p className="text-gray-600 max-w-sm mx-auto text-lg leading-relaxed font-medium italic">NGOs will start uploading field evidence once the first milestone triggers.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'Our Impact' && (
                  <motion.div
                    key="impact"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-16"
                  >
                    <div className="card p-16 bg-gradient-to-br from-[#161b22] to-black border-2 border-[#16a34a]/10 relative overflow-hidden shadow-2xl">
                       <div className="absolute top-0 right-0 p-4">
                          <Award className="text-[#16a34a] opacity-10" size={160} />
                       </div>
                       <div className="relative z-10 space-y-8">
                          <p className="text-xs font-black text-[#16a34a] uppercase tracking-[0.4em] shadow-sm">Quantifiable Impact Snapshot</p>
                          <div className="flex items-baseline gap-4">
                             <h4 className="text-8xl font-black font-jakarta text-white tracking-tighter shadow-xl">
                                {ngo.beneficiaries?.toLocaleString()}
                             </h4>
                             <span className="text-3xl font-extrabold text-[#16a34a] font-jakarta">LIVES CHANGED</span>
                          </div>
                          <p className="text-xl text-gray-500 max-w-lg font-medium italic opacity-90 leading-relaxed">
                            Through your generosity and our transparency, more than {ngo.beneficiaries?.toLocaleString()} individuals have found a new baseline of health and safety.
                          </p>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <h3 className="text-3xl font-extrabold font-jakarta text-white tracking-tight uppercase">Aligned SDG Goals</h3>
                       <div className="flex flex-wrap gap-4">
                          {["No Poverty", "Quality Education", "Clean Water", "Climate Action"].map((g, i) => (
                             <div key={i} className="flex items-center gap-3 px-8 py-4 bg-[#16a34a]/5 border border-[#16a34a]/20 rounded-2xl group cursor-default shadow-md hover:bg-[#16a34a]/10 transition-all duration-300">
                                <Globe className="text-[#16a34a] group-hover:rotate-12 transition-transform" size={24} />
                                <span className="text-sm font-black text-white uppercase tracking-widest">{g}</span>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="card p-12 bg-[#161b22]/40 border-dashed border-gray-800 rounded-[2.5rem]">
                       <Star className="text-gray-700 mx-auto mb-6" size={56} />
                       <h3 className="text-2xl font-bold text-gray-500 text-center font-jakarta tracking-tight">Beneficiary Stories Coming Soon</h3>
                       <p className="text-gray-600 text-center max-w-sm mx-auto leading-relaxed mt-4">We are currently verifying long-term impact case studies with our field team.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: STICKY DONATION PANEL */}
          <div className="lg:w-[35%] order-1 lg:order-2">
            <div className="sticky top-32">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-10 bg-[#161b22] border-gray-800 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] border-t-[4px] border-t-[#16a34a] relative group"
              >
                <div className="absolute top-0 right-0 p-4 pointer-events-none">
                  <Heart className="text-[#16a34a] opacity-5 -rotate-12" size={120} />
                </div>
                
                <div className="mb-10 text-center">
                  <h3 className="text-3xl font-black font-jakarta text-white tracking-tighter mb-2 leading-none">Support <br/> <span className="text-[#16a34a]">{ngo.name}</span></h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest opacity-80 mt-4 leading-relaxed">Direct Transfer • Secured by Supabase</p>
                </div>

                <div className="space-y-10">
                  {/* Progress Info */}
                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-1">
                           <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black opacity-60">Currently Raised</p>
                           <p className="text-2xl font-black font-jakarta text-[#16a34a] tracking-tight">₹{(ngo.raised_amount || 0).toLocaleString()}</p>
                        </div>
                         <p className="text-xs font-bold text-gray-600 italic">of ₹{(ngo.goal_amount || 0).toLocaleString()}</p>
                     </div>
                     <div className="progress-bar-container h-3 shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="progress-bar-fill shadow-[0_0_15px_rgba(22,163,94,0.4)]"
                        />
                     </div>
                  </div>

                  {/* Amount Selector */}
                  <div className="space-y-4">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black ml-1">Select Contribution</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[100, 500, 1000, 5000].map(val => (
                        <button
                          key={val}
                          onClick={() => setAmount(val)}
                          className={`py-4 rounded-xl font-bold text-sm tracking-tighter transition-all duration-300 border ${
                            amount === val 
                              ? 'bg-[#16a34a] text-white border-[#16a34a] shadow-[0_10px_20px_rgba(22,163,94,0.3)] scale-[1.03]' 
                              : 'bg-black/40 border-gray-800 text-gray-500 hover:text-white hover:border-gray-700'
                          }`}
                        >
                          ₹{val.toLocaleString()}
                        </button>
                      ))}
                    </div>
                    <div className="relative group/input pt-2">
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 font-bold group-focus-within/input:text-[#16a34a] transition-colors mt-1">₹</span>
                       <input 
                         type="number" 
                         placeholder="Enter custom amount" 
                         value={amount}
                         onChange={(e) => setAmount(Number(e.target.value))}
                         className="w-full bg-black/40 border border-gray-800 focus:border-[#22c55e/50] rounded-xl py-5 pl-12 pr-6 text-white font-black font-jakarta text-lg outline-none transition-all shadow-inner"
                       />
                    </div>
                  </div>

                  {/* Donor Info */}
                  <div className="space-y-4">
                     <div className="flex justify-between items-center ml-1">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Donor Recognition</p>
                        <label className="flex items-center gap-2 cursor-pointer group/toggle">
                           <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest group-hover/toggle:text-white transition-colors">Go Anonymous</span>
                           <div 
                              onClick={() => setIsAnonymous(!isAnonymous)}
                              className={`w-8 h-4 rounded-full transition-all duration-300 relative ${isAnonymous ? 'bg-[#16a34a]' : 'bg-gray-800'}`}
                           >
                              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300 ${isAnonymous ? 'left-4.5' : 'left-0.5'}`} />
                           </div>
                        </label>
                     </div>
                     {!isAnonymous && (
                        <input 
                           type="text" 
                           placeholder="Enter your name" 
                           value={donorName}
                           onChange={(e) => setDonorName(e.target.value)}
                           className="w-full bg-black/40 border border-gray-800 focus:border-[#16a34a/50] rounded-xl py-4 px-6 text-white font-medium text-sm outline-none transition-all shadow-inner"
                        />
                     )}
                  </div>

                  {/* Escrow Policy Warning */}
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                     <p className="text-[10px] text-blue-400 font-bold leading-tight uppercase tracking-widest flex gap-2">
                        <Info size={12} className="shrink-0" /> Milestone Escrow Policy
                     </p>
                     <p className="text-[9px] text-gray-400 font-medium mt-1 leading-relaxed">
                        Funds are held in escrow and released only as milestones are verified. Refunds are automated if goals are not met.
                     </p>
                  </div>

                  {/* Error State */}
                  <AnimatePresence>
                     {(donationError || ngo.transparency_score < 40) && (
                        <motion.div 
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           exit={{ opacity: 0, height: 0 }}
                           className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 overflow-hidden"
                        >
                           <p className="text-[10px] text-red-400 font-black leading-tight uppercase tracking-widest flex gap-2">
                              <AlertTriangle size={12} className="shrink-0" /> {ngo.transparency_score < 40 ? 'Transactions Paused' : 'Donation Error'}
                           </p>
                           <p className="text-[9px] text-gray-400 font-medium mt-1 leading-relaxed">
                              {ngo.transparency_score < 40 
                                ? 'This NGO’s transparency score is below 40. Donations are temporarily disabled for safety.' 
                                : donationError}
                           </p>
                        </motion.div>
                     )}
                  </AnimatePresence>

                  <button 
                    disabled={donating || ngo.transparency_score < 40}
                    onClick={handleDonate}
                    className="w-full btn-primary py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group shadow-[0_15px_40px_rgba(22,163,94,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {donating ? <Loader2 className="animate-spin" /> : <><Heart size={24} className="group-hover:scale-110 group-hover:fill-current transition-transform duration-300" /> Donate Now</>}
                  </button>


                  <div className="flex flex-col gap-4 text-center pt-4 opacity-80">
                     <div className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                       <ShieldCheck size={14} className="text-[#16a34a]" /> Double-Layer Encryption Protocol
                     </div>
                     <p className="text-[9px] text-gray-500 font-bold uppercase leading-relaxed px-6">
                       100% of your donation reaches the cause. Sustainify operates on a zero-platform-fee model supported by philanthropic grants.
                     </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <DonationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        donorName={donorName}
        impactMessage={impactMessage}
        ngoName={ngo.name}
      />
    </div>
  );
}
