import sys
try:
    with open('frontend/app/ngos/[id]/page.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Import ProofUploader
    import_str = "import ProofUploader from '../../../components/ProofUploader';\n"
    if "ProofUploader" not in content:
        content = content.replace("import { apiRequest } from '../../../lib/api';", "import { apiRequest } from '../../../lib/api';\nimport ProofUploader from '../../../components/ProofUploader';")

    # 2. Add Blacklist Banner constants
    if "const isSuspended =" not in content:
        content = content.replace("const progress = Math.min(100, ((ngo.raised_amount || 0) / (ngo.goal_amount || 1)) * 100);", "const progress = Math.min(100, ((ngo.raised_amount || 0) / (ngo.goal_amount || 1)) * 100);\n  const isSuspended = ngo.transparency_score < 40;\n  const isUnderReview = ngo.transparency_score < 40 || ngo.flagged_count >= 5;")

    # 3. Add Top Banners
    banner_ui = """
      {isSuspended && (
        <div className="w-full bg-red-600 text-white text-center py-3 font-black uppercase tracking-widest text-xs z-50 relative sticky top-0 shadow-2xl">
          SUSPENDED: This NGO has been suspended. Your unspent funds have been returned to your wallet.
        </div>
      )}
      {!isSuspended && isUnderReview && (
        <div className="w-full bg-orange-500 text-white text-center py-3 font-black uppercase tracking-widest text-xs z-50 relative sticky top-0 shadow-lg">
          UNDER REVIEW: Transparency score below 40 or multiple flags detected.
        </div>
      )}
"""
    if "UNDER REVIEW" not in content:
        content = content.replace('<div className="absolute top-0 left-0 w-full h-[60vh]', banner_ui + '      <div className="absolute top-0 left-0 w-full h-[60vh]')

    # 4. Govt Badges
    badges = """<span className="px-5 py-1.5 bg-gradient-to-r from-blue-600/80 to-[#16a34a]/80 backdrop-blur-md text-white border border-blue-500/50 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">DARPAN Verified ✓</span>
                <span className="px-5 py-1.5 bg-gradient-to-r from-purple-600/80 to-[#16a34a]/80 backdrop-blur-md text-white border border-purple-500/50 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">80G Eligible ✓</span>"""
    if "DARPAN Verified" not in content:
        content = content.replace("{ngo.status === 'gov_funded' && (", badges + "\n                {ngo.status === 'gov_funded' && (")

    # 5. Add QA tab
    content = content.replace("'Overview', 'Activities', 'Milestones', 'Proof Updates', 'Our Impact'", "'Overview', 'Activities', 'Milestones', 'Proof Updates', 'Ask the NGO', 'Our Impact'")

    qa_ui = """
                {activeTab === 'Ask the NGO' && (
                  <motion.div key="qa" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                     <div className="mb-8 border-l-4 border-[#16a34a] pl-4">
                        <h3 className="text-3xl font-extrabold font-jakarta tracking-tight">Ask the NGO</h3>
                        <p className="text-gray-500 font-medium italic">Responds to 94% of questions within 24 hours.</p>
                     </div>
                     <div className="relative mb-12">
                       <textarea className="w-full bg-[#161b22] border border-gray-800 rounded-2xl p-6 text-white text-sm focus:border-[#16a34a] outline-none shadow-inner resize-none min-h-[120px]" placeholder="Ask a question publicly about this project..." />
                       <button className="absolute bottom-4 right-4 bg-white text-black px-6 py-2 rounded-xl font-black text-xs hover:bg-gray-200 transition-colors uppercase tracking-widest">Post Question</button>
                     </div>
                     <div className="space-y-6">
                       <div className="card p-8 bg-[#161b22]/50 border border-gray-800 rounded-3xl">
                          <div className="flex justify-between items-start mb-4">
                             <div className="flex items-center gap-3"><div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"><User size={16}/></div><p className="font-bold">Rahul Verma</p></div>
                             <span className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full font-black uppercase tracking-widest">Awaiting Response</span>
                          </div>
                          <p className="text-gray-300 text-sm pl-13">When will the next batch of laptops be distributed?</p>
                       </div>
                       <div className="card p-8 bg-[#161b22]/50 border border-gray-800 rounded-3xl">
                          <div className="flex justify-between items-start mb-4">
                             <div className="flex items-center gap-3"><div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"><User size={16}/></div><p className="font-bold cursor-help border-b border-dashed border-gray-500" title="Identity protected. Only Sustainify knows the donor's identity.">Anonymous Donor</p></div>
                             <span className="text-xs text-gray-500 font-bold">2 days ago</span>
                          </div>
                          <p className="text-gray-300 text-sm pl-13 mb-6">Are these laptops brand new or refurbished?</p>
                          <div className="ml-13 pl-6 border-l-2 border-[#16a34a] space-y-3">
                             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#16a34a] tracking-widest bg-[#16a34a]/10 px-3 py-1 rounded-full w-fit"><ShieldCheck size={12}/> NGO Response</div>
                             <p className="text-white text-sm">They are manufacturer-refurbished Grade-A units with a 1-year warranty to maximize our budget impact.</p>
                          </div>
                       </div>
                     </div>
                  </motion.div>
                )}
"""
    if "Ask the NGO" not in content:
        content = content.replace("{activeTab === 'Overview' && (", qa_ui + "\n                {activeTab === 'Overview' && (")

    # 6. Escrow replaces MilestoneTimeline
    escrow_ui = """
                    <div className="mb-12 border-l-4 border-[#16a34a] pl-4">
                        <h3 className="text-3xl font-extrabold font-jakarta tracking-tight">Fund Release Timeline (Escrow)</h3>
                        <p className="text-gray-500 font-medium italic">Track how every rupee is allocated remotely safely.</p>
                    </div>
                    <div className="space-y-4">
                      {[1, 2, 3].map((m, i) => (
                        <div key={i} className="flex flex-col md:flex-row items-center justify-between p-6 bg-[#161b22] border border-gray-800 rounded-2xl group hover:border-gray-700 transition-colors">
                           <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
                              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center font-black text-gray-500">{i+1}</div>
                              <div>
                                 <p className="font-bold text-lg">Milestone {i+1}</p>
                                 {i === 0 ? <p className="text-xs font-bold uppercase tracking-widest mt-1 w-fit bg-[#16a34a]/10 text-[#16a34a] px-2 py-0.5 rounded-full border border-[#16a34a]/20 flex items-center gap-1">RELEASED ✓</p> : <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 w-fit bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 flex items-center gap-1">LOCKED <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"/></p>}
                              </div>
                           </div>
                           <div className="flex items-center justify-between w-full md:w-auto md:gap-10">
                              <div className="text-right">
                                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Held in Escrow</p>
                                 <p className="text-xl font-black text-white">₹25,000</p>
                              </div>
                              <button className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all">Submit Proof</button>
                           </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 font-bold text-center mt-6">Funds are held securely until each milestone is verified by Sustainify AI.</p>
"""
    if "Fund Release Timeline" not in content:
        content = content.replace("<MilestoneTimeline milestones={milestones} />", escrow_ui)

    # 7. Proof Uploader injected
    if "ProofUploader ngoId" not in content:
        content = content.replace('<h3 className="text-3xl font-extrabold font-jakarta text-white tracking-tight">Verified Proof Feed</h3>', '<h3 className="text-3xl font-extrabold font-jakarta text-white tracking-tight">Verified Proof Feed</h3>\n                    </div>\n                    <ProofUploader ngoId={ngo.id} projectId={ngo.id} />\n                    <div className="mb-8">')

    # 8. Anonymous Tooltip
    content = content.replace('<span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest group-hover/toggle:text-white transition-colors">Go Anonymous</span>', '<span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest group-hover/toggle:text-white transition-colors cursor-help" title="Your identity is protected. Only Sustainify\'s secure system knows your identity for receipt generation.">Go Anonymous</span>')

    with open('frontend/app/ngos/[id]/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Modifications successful.")
except Exception as e:
    print("Error:", str(e))
