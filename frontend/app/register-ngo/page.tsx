"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, User, MapPin, Building, Target, FileText, CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function RegisterNGO() {
  const [path, setPath] = useState<'established' | 'new' | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white flex flex-col items-center justify-center p-4 text-center">
         <div className="w-24 h-24 bg-[#16a34a]/10 rounded-full flex items-center justify-center mb-6 border border-[#16a34a]/30 shadow-[0_0_30px_rgba(22,163,94,0.3)]">
            <CheckCircle2 size={48} className="text-[#16a34a]" />
         </div>
         <h1 className="text-4xl font-extrabold font-jakarta mb-4">Registration Successful!</h1>
         {path === 'established' ? (
            <p className="text-gray-400 max-w-md mx-auto leading-relaxed">Your DARPAN ID has been securely linked and your project is now live with a <span className="text-[#16a34a] font-black tracking-widest uppercase">Verified</span> badge.</p>
         ) : (
            <div>
               <p className="text-gray-400 max-w-xl mx-auto leading-relaxed mb-10">Welcome to Sustainify. As a new NGO without a DARPAN ID, you are starting with a base transparency score of 40/100. Follow the roadmap to unlock higher trust tiers.</p>
               
               <div className="text-left bg-[#161b22] border border-gray-800 rounded-[2.5rem] p-10 max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#16a34a]/10 blur-3xl rounded-full" />
                 <h3 className="text-2xl font-black text-white mb-8 border-l-4 border-[#16a34a] pl-4">Trust Building Roadmap</h3>
                 <div className="space-y-6 relative border-l-2 border-gray-800 ml-4 pb-4">
                    <div className="pl-8 relative">
                       <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-gray-500 border-[3px] border-[#161b22]" />
                       <p className="font-bold text-white text-lg">Step 1: Profile Created</p>
                       <span className="inline-block mt-2 px-3 py-1 bg-gray-800 text-gray-300 text-[10px] font-black uppercase tracking-widest rounded">Unverified</span>
                    </div>
                    <div className="pl-8 relative">
                       <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-[#16a34a] border-[3px] border-[#161b22]" />
                       <p className="font-bold text-white text-lg">Step 2: First Verified Proof</p>
                       <span className="inline-block mt-2 px-3 py-1 bg-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-widest rounded border border-yellow-500/30">Building Trust</span>
                       <p className="text-xs text-gray-500 mt-2">Post your first milestone update and get it verified by AI.</p>
                    </div>
                    <div className="pl-8 relative">
                       <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-gray-800 border-[3px] border-[#161b22]" />
                       <p className="font-bold text-gray-400 text-lg">Step 3: 3 Milestones Completed</p>
                       <span className="inline-block mt-2 px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest rounded border border-blue-500/30 opacity-50">Community Trusted</span>
                    </div>
                    <div className="pl-8 relative">
                       <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-gray-800 border-[3px] border-[#161b22]" />
                       <p className="font-bold text-gray-400 text-lg">Step 4: Official DARPAN Verified</p>
                       <span className="inline-block mt-2 px-3 py-1 bg-[#16a34a]/10 text-[#16a34a] text-[10px] font-black uppercase tracking-widest rounded border border-[#16a34a]/30 opacity-50">Government Verified</span>
                    </div>
                 </div>
               </div>
            </div>
         )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <div className="pt-32 pb-20 max-w-4xl mx-auto px-4">
         <h1 className="text-4xl font-extrabold font-jakarta text-center mb-6 tracking-tight">Register Your NGO</h1>
         <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">Sustainify supports both established government-verified NGOs and newly emerging grassroots collectives.</p>
         
         {!path ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <button onClick={() => setPath('established')} className="card p-10 bg-[#161b22] border border-gray-800 rounded-[3rem] hover:border-[#16a34a]/50 group transition-all text-left relative overflow-hidden">
               <div className="w-16 h-16 bg-[#16a34a]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#16a34a]/20 transition-colors">
                 <ShieldCheck className="text-[#16a34a]" size={32} />
               </div>
               <h3 className="text-2xl font-black mb-3">Established NGO</h3>
               <p className="text-gray-400 text-sm leading-relaxed">You already have a government-issued <strong>DARPAN ID</strong> and optionally an <strong>80G Certificate</strong>.</p>
               <div className="mt-8 px-4 py-2 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest w-fit">Fast Track Verification</div>
             </button>
             
             <button onClick={() => setPath('new')} className="card p-10 bg-[#161b22] border border-gray-800 rounded-[3rem] hover:border-[#16a34a]/50 group transition-all text-left relative overflow-hidden">
               <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-yellow-500/20 transition-colors">
                 <Target className="text-yellow-500" size={32} />
               </div>
               <h3 className="text-2xl font-black mb-3">Grassroots / New NGO</h3>
               <p className="text-gray-400 text-sm leading-relaxed">You are a newly formed initiative building your trust score without a DARPAN ID yet.</p>
               <div className="mt-8 px-4 py-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-[10px] font-black uppercase tracking-widest w-fit">Incubator Track</div>
             </button>
           </div>
         ) : (
           <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-[#161b22] border border-gray-800 rounded-[2.5rem] p-10 shadow-2xl">
              <button onClick={() => setPath(null)} className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-8 hover:text-white">← Back</button>
              
              <div className="mb-10 text-center">
                 <span className={`inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border ${path === 'established' ? 'bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                   {path === 'established' ? 'Darpan Verified Track' : 'Grassroots Incubator Track'}
                 </span>
                 <h2 className="text-3xl font-black font-jakarta">Project & Institute Details</h2>
              </div>
              
              <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div><label className="text-xs text-gray-500 font-bold mb-2 block uppercase tracking-widest">NGO Name</label><input type="text" className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-[#16a34a]" placeholder="Green Earth Initiative" /></div>
                   {path === 'established' ? (
                     <div><label className="text-xs text-gray-500 font-bold mb-2 block uppercase tracking-widest">DARPAN ID</label><input type="text" className="w-full bg-black/40 border border-[#16a34a]/40 bg-[#16a34a]/5 rounded-xl p-4 text-white outline-none focus:border-[#16a34a]" placeholder="UP/2021/0123456" /></div>
                   ) : (
                     <div><label className="text-xs text-gray-500 font-bold mb-2 block uppercase tracking-widest">Founder Name</label><input type="text" className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-[#16a34a]" placeholder="Rohan Sharma" /></div>
                   )}
                 </div>

                 {path === 'established' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div><label className="text-xs text-gray-500 font-bold mb-2 block uppercase tracking-widest">80G Registration No. (Optional)</label><input type="text" className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-[#16a34a]" placeholder="DEL-80G-..." /></div>
                      <div><label className="text-xs text-gray-500 font-bold mb-2 block uppercase tracking-widest">Integration Certificate</label><input type="file" className="w-full bg-black/40 border border-gray-800 rounded-xl p-3 text-white outline-none focus:border-[#16a34a] text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#16a34a] file:text-white hover:file:bg-[#15803d]" /></div>
                    </div>
                 )}

                 {path === 'new' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div><label className="text-xs text-gray-500 font-bold mb-2 block uppercase tracking-widest">Founding Date</label><input type="date" className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-[#16a34a] text-gray-400" /></div>
                    </div>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div><label className="text-xs text-gray-500 font-bold mb-2 block uppercase tracking-widest">Contact Email</label><input type="email" className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-[#16a34a]" placeholder="hello@ngo.org" /></div>
                   <div><label className="text-xs text-gray-500 font-bold mb-2 block uppercase tracking-widest">Phone</label><input type="tel" className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-[#16a34a]" placeholder="+91 98765 43210" /></div>
                   <div className="flex gap-4">
                     <div className="w-1/2"><label className="text-xs text-gray-500 font-bold mb-2 block uppercase tracking-widest">City</label><input type="text" className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-[#16a34a]" placeholder="Delhi" /></div>
                     <div className="w-1/2"><label className="text-xs text-gray-500 font-bold mb-2 block uppercase tracking-widest">State</label><input type="text" className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-[#16a34a]" placeholder="Delhi" /></div>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs text-gray-500 font-bold mb-2 block uppercase tracking-widest">Primary Category</label>
                      <select className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-[#16a34a] appearance-none">
                        <option>Education</option><option>Health</option><option>Environment</option><option>Women Empowerment</option><option>Hunger</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-bold mb-2 block uppercase tracking-widest">UN SDG Goals (Multi-select)</label>
                      <input type="text" className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-[#16a34a]" placeholder="E.g., No Poverty, Clean Water" />
                    </div>
                 </div>

                 <div>
                    <label className="text-xs text-gray-500 font-bold mb-2 block uppercase tracking-widest">Initial Project Description</label>
                    <textarea className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-[#16a34a] min-h-[120px] resize-none" placeholder="Describe your mission and the first project you plan to fund..."></textarea>
                 </div>

                 <button onClick={() => setSubmitted(true)} className="w-full py-5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl font-black text-lg transition-colors mt-8">Submit Registration</button>
              </div>
           </motion.div>
         )}
      </div>
    </div>
  );
}
