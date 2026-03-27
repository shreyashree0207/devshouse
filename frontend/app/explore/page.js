"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Navbar from "../../components/Navbar"
import AnimatedBackground from "../../components/AnimatedBackground"

export default function Explore() {
  const [ngos, setNgos] = useState([])

  useEffect(() => {
    const fakeData = [
      { id: 1, name: "Akshara Foundation", city: "Chennai", category: "Education",
        goal: 100000, raised: 67000, transparency_score: 87 },
      { id: 2, name: "Goonj", city: "Delhi", category: "Relief",
        goal: 50000, raised: 42000, transparency_score: 91 },
      { id: 3, name: "Pratham", city: "Mumbai", category: "Education",
        goal: 200000, raised: 130000, transparency_score: 78 },
      { id: 4, name: "CRY India", city: "Bangalore", category: "Child Rights",
        goal: 75000, raised: 61000, transparency_score: 94 },
      { id: 5, name: "Smile Foundation", city: "Hyderabad", category: "Health",
        goal: 120000, raised: 89000, transparency_score: 82 },
      { id: 6, name: "HelpAge India", city: "Chennai", category: "Elderly Care",
        goal: 90000, raised: 45000, transparency_score: 88 },
    ]
    setNgos(fakeData)
  }, [])

  return (
    <main className="relative min-h-screen overflow-hidden selection:bg-neon/30">
      
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 p-8 max-w-7xl mx-auto pt-32">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">Explore NGOs</h1>
          <p className="text-gray-400 mb-10 text-lg">All verified. All transparent. Choose your impact.</p>
        </motion.div>

        {/* Search/Filter Bar */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.1 }}
           className="glass p-4 rounded-2xl mb-10 flex flex-col md:flex-row gap-4"
        >
           <input 
              type="text" 
              placeholder="Search NGOs by name, city, or cause..." 
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all placeholder:text-gray-500"
           />
           <button className="bg-primary hover:bg-primary/90 text-slate-900 px-8 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
             Search
           </button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {ngos.map((ngo, idx) => (
            <motion.div
              key={ngo.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Link href={`/ngo/${ngo.id}`}>
                <div className="glass-card rounded-3xl p-8 cursor-pointer h-full flex flex-col">
                  
                  <div className="flex justify-between items-start mb-4">
                     <span className="text-xs font-bold bg-primary/20 text-emerald-400 border border-primary/30 px-3 py-1.5 rounded-full tracking-wider uppercase">
                       {ngo.category}
                     </span>
                     <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                       <span className="text-sm font-bold gradient-text">{ngo.transparency_score}</span>
                       <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">Score</span>
                     </div>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-2">{ngo.name}</h2>
                  <p className="text-gray-400 text-sm mb-6 flex-1 text-emerald-200/50">📍 {ngo.city}</p>

                  <div className="mt-auto">
                     {/* Progress bar */}
                     <div className="flex justify-between text-xs font-medium text-gray-400 mb-2">
                        <span>₹{ngo.raised.toLocaleString()} raised</span>
                        <span>₹{ngo.goal.toLocaleString()} goal</span>
                     </div>
                     <div className="w-full bg-white/5 border border-white/5 rounded-full h-2">
                     <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(ngo.raised / ngo.goal) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                        className="bg-gradient-to-r from-primary to-neon h-2 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                     />
                     </div>
                  </div>

                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}