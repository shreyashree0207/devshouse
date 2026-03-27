"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Navbar from "../../../components/Navbar"

export default function NGODetail({ params }) {
  const [ngo, setNgo] = useState(null)
  const [showDonateModal, setShowDonateModal] = useState(false)
  const [donateAmount, setDonateAmount] = useState("")
  const [impactMessage, setImpactMessage] = useState("")
  const [isLoadingImpact, setIsLoadingImpact] = useState(false)
  const [donated, setDonated] = useState(false)

  const SEED_NGOS = [
    { 
      id: 1, 
      name: "Akshara Foundation", 
      city: "Chennai", 
      category: "Education",
      description: "Working to ensure every child gets access to quality schooling in Chennai. Our mission focus includes teacher training, library resource setup, and scholarship for underprivileged children.",
      goal: 500000, raised: 245000, score: 87,
      milestones: [
        { id: 1, title: "Classroom furniture upgrade", status: "completed", date: "Jan 12, 2025" },
        { id: 2, title: "New library setup in T. Nagar School", status: "completed", date: "Feb 22, 2025" },
        { id: 3, title: "Mid-year teacher training drive", status: "pending", date: "May 15, 2025" },
        { id: 4, title: "Annual student scholarship", status: "pending", date: "Dec 10, 2025" }
      ],
      proof_updates: [
        { 
          id: 1, 
          image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600",
          caption: "Teacher training session in session at regional center.",
          date: "Mar 10, 2025",
          verdict: "VERIFIED"
        },
        { 
          id: 2, 
          image: "https://images.unsplash.com/photo-1524380365538-4b4193ef1633?w=600",
          caption: "Delivery of new science kits for grade 8 students.",
          date: "Feb 15, 2025",
          verdict: "VERIFIED"
        }
      ]
    }
  ]

  useEffect(() => {
    // Simulate fetching based on ID
    const found = SEED_NGOS.find(n => n.id.toString() === params.id) || SEED_NGOS[0]
    setNgo(found)
  }, [params.id])

  const handleImpactCheck = async (amount) => {
    setDonateAmount(amount)
    setIsLoadingImpact(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/ai/impact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, category: ngo.category })
      })
      if (!response.ok) throw new Error("API not ready")
      const data = await response.json()
      setImpactMessage(data.message)
    } catch (err) {
      // Fallback for demo
      const fallbacks = {
        100: "Your ₹100 covers mid-day snacks for a student for 2 days.",
        500: "Your ₹500 will provide textbooks for 3 children for a whole year.",
        1000: "Your ₹1,000 will fund a primary teacher for a full week.",
        custom: `Your donation directly empowers children's futures at ${ngo.name}.`
      }
      setImpactMessage(fallbacks[amount] || fallbacks.custom)
    } finally {
      setIsLoadingImpact(false)
    }
  }

  const handleDonate = () => {
    setDonated(true)
  }

  if (!ngo) return <div className="p-20 text-center font-bold text-slate-400">Loading mission data...</div>

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           className="grid grid-cols-1 lg:grid-cols-3 gap-12"
        >
          {/* Main Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 text-primary text-sm font-bold mb-6 hover:translate-x-[-4px] transition-transform">
               <span>← Browse all missions</span>
            </Link>
            
            <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-6 border border-emerald-100">
               {ngo.category}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">{ngo.name}</h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10 max-w-2xl">{ngo.description}</p>

            {/* Milestones */}
            <div className="mb-12">
               <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                  Milestone Timeline
               </h3>
               <div className="space-y-6 relative ml-4 pl-8 border-l-2 border-slate-100">
                  {ngo.milestones.map((m, i) => (
                    <motion.div
                       key={m.id}
                       initial={{ opacity: 0, x: -20 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       transition={{ duration: 0.4, delay: i * 0.1 }}
                       className="relative"
                    >
                       <div className={`absolute -left-[41px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm transition-colors ${m.status === 'completed' ? 'bg-primary' : 'bg-slate-200'}`} />
                       <p className={`text-lg font-bold mb-0.5 ${m.status === 'completed' ? 'text-slate-800' : 'text-slate-400'}`}>{m.title}</p>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{m.date} · {m.status}</p>
                    </motion.div>
                  ))}
               </div>
            </div>

            {/* Proof Feed */}
            <div>
               <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/>
                  </svg>
                  Impact Proof Feed
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {ngo.proof_updates.map((p) => (
                    <div key={p.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden card-hover shadow-sm group">
                       <div className="relative h-48">
                         <img src={p.image} alt="Proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                         <span className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg">
                           {p.verdict}
                         </span>
                       </div>
                       <div className="p-6">
                         <p className="text-sm font-bold text-slate-800 mb-2 leading-snug">{p.caption}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.date}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
             <div className="sticky top-32 glass p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col items-center">
                
                {/* BIG Circular score */}
                <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
                   <svg className="w-full h-full -rotate-90">
                      <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                      <circle 
                         cx="96" cy="96" r="88" 
                         stroke="currentColor" 
                         strokeWidth="12" 
                         fill="transparent" 
                         strokeDasharray="553" 
                         strokeDashoffset={553 - (553 * ngo.score / 100)} 
                         className={`animate-circle ${ngo.score >= 75 ? 'text-emerald-500' : 'text-amber-500'}`} 
                      />
                   </svg>
                   <div className="absolute flex flex-col items-center text-center">
                      <p className={`text-5xl font-black ${ngo.score >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>{ngo.score}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Transparency</p>
                   </div>
                </div>

                <div className="w-full text-center mb-10">
                   <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                      <span>Fundraising Goal</span>
                      <span>{Math.round((ngo.raised / ngo.goal) * 100)}%</span>
                   </div>
                   <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-50 mb-4">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(ngo.raised / ngo.goal) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-primary"
                      />
                   </div>
                   <p className="text-3xl font-black text-slate-800 tracking-tight">₹{ngo.raised.toLocaleString()}</p>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">raised of ₹{ngo.goal.toLocaleString()}</p>
                </div>

                <button 
                   onClick={() => setShowDonateModal(true)}
                   className="w-full bg-primary hover:bg-primary-hover text-white py-5 rounded-2xl text-lg font-black shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-95"
                >
                   Donate Now
                </button>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Donate Modal */}
      <AnimatePresence>
        {showDonateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white max-w-md w-full rounded-[3rem] p-10 md:p-12 shadow-2xl relative overflow-hidden"
            >
              {!donated ? (
                <>
                  <button onClick={() => setShowDonateModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                  <h4 className="text-3xl font-black text-slate-900 mb-2 mt-2 leading-tight">Empower Change</h4>
                  <p className="text-slate-500 font-medium mb-8">Select an amount to see its real-world impact instantly.</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[100, 500, 1000].map(amt => (
                      <button 
                         key={amt}
                         onClick={() => handleImpactCheck(amt)}
                         className={`py-4 rounded-2xl border-2 font-black transition-all ${donateAmount === amt ? 'border-primary bg-emerald-50 text-primary shadow-sm' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                         ₹{amt.toLocaleString()}
                      </button>
                    ))}
                    <button className="py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-black hover:border-slate-200">Custom</button>
                  </div>

                  <AnimatePresence mode="wait">
                    {donateAmount && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-amber-50 border border-amber-100 p-6 rounded-2xl mb-8 relative overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/20 blur-2xl rounded-full pointer-events-none" />
                        <p className="text-amber-800 font-bold text-lg italic relative z-10 leading-snug">
                          {isLoadingImpact ? "Calculating impact..." : impactMessage}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                     disabled={!donateAmount}
                     onClick={handleDonate}
                     className="w-full bg-primary disabled:bg-slate-100 disabled:text-slate-300 hover:bg-primary-hover text-white py-5 rounded-2xl font-black transition-all shadow-lg shadow-emerald-200"
                  >
                     Confirm Donation
                  </button>
                </>
              ) : (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                     <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h4 className="text-3xl font-black text-slate-900 mb-2">Thank You!</h4>
                  <p className="text-slate-500 font-medium mb-10">Your contribution milestone has been recorded on the transparency ledger.</p>
                  <button onClick={() => {setShowDonateModal(false); setDonated(false); setDonateAmount("")}} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black transition-all">Close</button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  )
}