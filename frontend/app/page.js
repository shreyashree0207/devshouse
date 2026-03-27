"use client"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import Link from "next/link"
import Navbar from "../components/Navbar"

const SEED_NGOS = [
  { 
    id: 1, 
    name: "Akshara Foundation", 
    city: "Chennai", 
    category: "Education",
    description: "Empowering children in government schools with quality resources.",
    raised: 245000, 
    goal: 500000, 
    score: 87 
  },
  { 
    id: 2, 
    name: "Goonj", 
    city: "Delhi", 
    category: "Disaster Relief",
    description: "Using urban discard to fuel rural development and disaster relief.",
    raised: 890000, 
    goal: 1000000, 
    score: 94 
  },
  { 
    id: 3, 
    name: "Pratham Mumbai", 
    city: "Mumbai", 
    category: "Literacy",
    description: "Proven interventions for literacy among underprivileged urban youth.",
    raised: 120000, 
    goal: 300000, 
    score: 62 
  },
  { 
    id: 4, 
    name: "HelpAge India", 
    city: "Delhi", 
    category: "Elderly Care",
    description: "Protecting the rights and dignity of disadvantaged elderly citizens.",
    raised: 45000, 
    goal: 200000, 
    score: 48 
  }
]

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("")
  const [tickerValue, setTickerValue] = useState(234567)

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerValue(prev => prev + Math.floor(Math.random() * 25))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const filteredNgos = SEED_NGOS.filter(ngo => 
    ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    ngo.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ngo.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1, 
        delayChildren: 0.3 
      } 
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  }

  return (
    <main className="min-h-screen bg-white selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Live Impact Ticker */}
      <motion.div 
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="bg-emerald-900 text-white py-2.5 px-4 text-center text-[10px] font-black tracking-[0.3em] uppercase z-[60] relative"
      >
        ₹{tickerValue.toLocaleString()} raised today across 47 missions
      </motion.div>

      <Navbar />

      {/* Hero Section */}
      <section className="pt-48 pb-24 px-6 max-w-7xl mx-auto text-center relative overflow-hidden">
        
        {/* Background Decorative Shape */}
        <motion.div 
           animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
           transition={{ duration: 15, repeat: Infinity }}
           className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-50 rounded-full blur-[140px] -z-10 opacity-60" 
        />

        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.95] inline-block">
            Donate with <span className="text-emerald-500 italic">Proof.</span><br /> 
            Give with <span className="text-amber-500 italic">Purpose.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
             Sustainify empowers you to track every rupee against real-world milestones verified by AI. Radical transparency for radical impact.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.6, delay: 0.4 }}
           className="max-w-2xl mx-auto relative group"
        >
          <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search for missions, causes, or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-[2.5rem] py-6 pl-20 pr-8 text-slate-900 shadow-[0_32px_64px_-16px_rgba(22,163,74,0.1)] focus:outline-none focus:border-primary focus:ring-8 focus:ring-emerald-50 transition-all font-bold text-xl placeholder:text-slate-300"
          />
        </motion.div>
      </section>

      {/* NGO Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <motion.div 
           variants={containerVariants}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {filteredNgos.map((ngo) => (
            <motion.div key={ngo.id} variants={itemVariants}>
              <Link href={`/ngo/${ngo.id}`}>
                <div className="group card-hover bg-white rounded-[3rem] p-10 border border-slate-50 h-full flex flex-col cursor-pointer transition-shadow">
                  
                  {/* Category & Score */}
                  <div className="flex justify-between items-start mb-8">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                      {ngo.category}
                    </span>
                    
                    <div className="relative w-16 h-16 flex items-center justify-center">
                       <svg className="w-full h-full -rotate-90">
                          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4.5" fill="transparent" className="text-slate-50" />
                          <circle 
                             cx="32" cy="32" r="28" 
                             stroke="currentColor" 
                             strokeWidth="4.5" 
                             fill="transparent" 
                             strokeDasharray="176" 
                             strokeDashoffset={176 - (176 * ngo.score / 100)} 
                             className={`animate-circle ${ngo.score >= 75 ? 'text-emerald-500' : ngo.score >= 50 ? 'text-amber-500' : 'text-rose-500'}`} 
                          />
                       </svg>
                       <span className={`absolute text-sm font-black ${ngo.score >= 75 ? 'text-emerald-600' : ngo.score >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {ngo.score}
                       </span>
                    </div>
                  </div>

                  <h3 className="text-3xl font-extrabold text-slate-900 mb-3 group-hover:text-primary transition-colors tracking-tight leading-tight">{ngo.name}</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8">📍 {ngo.city}</p>
                  
                  <p className="text-slate-500 text-sm leading-relaxed mb-10 flex-1">{ngo.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mt-auto">
                    <div className="flex justify-between text-[11px] font-black text-slate-400 mb-4 uppercase tracking-widest">
                      <span>₹{ngo.raised.toLocaleString()} <span className="opacity-50 font-medium lowercase italic">raised</span></span>
                      <span>₹{ngo.goal.toLocaleString()} <span className="opacity-50 font-medium lowercase italic">goal</span></span>
                    </div>
                    <div className="w-full bg-slate-50 rounded-full h-3.5 overflow-hidden border border-slate-50">
                      <motion.div 
                         initial={{ width: 0 }}
                         whileInView={{ width: `${(ngo.raised / ngo.goal) * 100}%` }}
                         transition={{ duration: 1.2, ease: "easeOut" }}
                         className={`h-full rounded-full ${ngo.score >= 75 ? 'bg-primary' : 'bg-amber-400'}`}
                      />
                    </div>
                  </div>

                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

    </main>
  )
}