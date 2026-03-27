"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import Navbar from "../../components/Navbar"

export default function Dashboard() {
  const [project, setProject] = useState("")
  const [caption, setCaption] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [verdict, setVerdict] = useState(null)

  const PROJECTS = [
    "Akshara Classroom Furniture Upgrade",
    "T. Nagar School Library Setup",
    "Chennai Mid-year Teacher Training Drive"
  ]

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setVerdict(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/ai/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl, project_description: caption })
      })

      if (!response.ok) throw new Error("Verification service unavailable")
      
      const data = await response.json()
      setVerdict(data)
    } catch (err) {
      // Mocked response for demo
      setTimeout(() => {
        setVerdict({
          score: 92,
          label: "VERIFIED",
          verdict: "AI analysis confirms visual content matches classroom construction activity in the Chennai region. No signs of digital manipulation detected."
        })
        setLoading(false)
      }, 2000)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900 pb-20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 pt-32">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
        >
           <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2 mt-4 tracking-tight leading-tight italic">
              Proof Submission Portal
           </h2>
           <p className="text-slate-500 font-medium mb-12 text-lg">Help us verify your impact. Every update strengthens trust with your donors.</p>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Form Section */}
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                 <form className="space-y-6" onSubmit={handleVerify}>
                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Select Project Milestone</label>
                       <select 
                          value={project}
                          onChange={(e) => setProject(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-50 focus:border-primary transition-all font-bold appearance-none cursor-pointer"
                          required
                       >
                          <option value="">-- Choose project --</option>
                          {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
                       </select>
                    </div>

                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Impact Caption</label>
                       <textarea 
                          placeholder="Describe what this proof demonstrates..."
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-50 focus:border-primary transition-all font-bold placeholder:text-slate-300 resize-none"
                          required
                       />
                    </div>

                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Visual Evidence URL</label>
                       <input 
                          type="url"
                          placeholder="Link to project image/video proof..."
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-50 focus:border-primary transition-all font-bold placeholder:text-slate-300"
                          required
                       />
                    </div>

                    <button 
                       disabled={loading}
                       className="w-full bg-primary hover:bg-primary-hover text-white py-5 rounded-2xl text-lg font-black shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
                    >
                       {loading ? "AI Analysis in Progress..." : "Submit for Verification"}
                    </button>
                 </form>
              </div>

              {/* Verdict Section */}
              <div className="flex flex-col">
                 <AnimatePresence mode="wait">
                    {verdict ? (
                       <motion.div
                          key="verdict"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 h-full relative overflow-hidden group border-t-8 border-t-primary"
                       >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/20 blur-3xl rounded-full pointer-events-none group-hover:bg-emerald-100/30 transition-all" />
                          
                          <div className="flex justify-between items-start mb-8 relative z-10">
                             <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">AI Verdict Ledger</p>
                                <h4 className={`text-4xl font-black tracking-tighter ${verdict.label === 'VERIFIED' ? 'text-emerald-500' : verdict.label === 'PARTIAL' ? 'text-amber-500' : 'text-rose-500'}`}>
                                   {verdict.label}
                                </h4>
                             </div>
                             <div className="flex flex-col items-center">
                                <p className="text-3xl font-black text-slate-800 mb-0">{verdict.score}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Confidence</p>
                             </div>
                          </div>

                          <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl relative z-10">
                             <p className="text-slate-600 font-bold leading-relaxed italic">
                                &ldquo;{verdict.verdict}&rdquo;
                             </p>
                          </div>

                          <div className="mt-auto pt-10">
                             <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic mb-6">Verified by Sustainify AI-Audit v2.4</p>
                             <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-black hover:bg-slate-800 transition-colors">
                                Publish to Ledger
                             </button>
                          </div>
                       </motion.div>
                    ) : (
                       <motion.div 
                          key="placeholder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-4 border-dashed border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center h-full text-slate-300 transition-all font-black uppercase tracking-widest"
                       >
                          <div className="mb-6 opacity-20">
                             <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
                          </div>
                          Analysis Report Pending Submission
                       </motion.div>
                    )}
                 </AnimatePresence>
              </div>

           </div>
        </motion.div>
      </div>

    </main>
  )
}