"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

export default function AnimatedBackground({ blobs = [] }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const defaultBlobs = [
    { id: 1, size: "w-[500px] h-[500px]", color: "bg-emerald-500/20", top: "-10%", left: "-10%", duration: 30, xDir: [0, 80, -40, 0], yDir: [0, -60, 40, 0] },
    { id: 2, size: "w-[600px] h-[600px]", color: "bg-neon/10", top: "40%", left: "60%", duration: 40, xDir: [0, -100, 60, 0], yDir: [0, 80, -40, 0] },
    { id: 3, size: "w-[400px] h-[400px]", color: "bg-primary/15", top: "70%", left: "-5%", duration: 25, xDir: [0, 40, -80, 0], yDir: [0, -100, 20, 0] },
    { id: 4, size: "w-[300px] h-[300px]", color: "bg-cyan-500/10", top: "10%", left: "50%", duration: 35, xDir: [0, 60, -30, 0], yDir: [0, 40, 90, 0] },
  ]

  const renderBlobs = blobs.length > 0 ? blobs : defaultBlobs

  if (!mounted) return <div className="absolute inset-0 bg-[#020617]" />

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#020617] selection:bg-neon/30">
      <AnimatePresence>
        {renderBlobs.map((blob) => (
          <motion.div
            key={blob.id}
            animate={{
              x: blob.xDir || [0, 50, -30, 0],
              y: blob.yDir || [0, -40, 60, 0],
              scale: [1, 1.1, 0.95, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{
              duration: blob.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`absolute ${blob.size} ${blob.color} rounded-full blur-[120px] ${blob.top} ${blob.left}`}
          />
        ))}
      </AnimatePresence>
      
      {/* Dynamic Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Animated Rings in distance */}
      <div className="absolute right-0 bottom-0 pointer-events-none overflow-hidden h-screen w-full z-0 opacity-40">
         <motion.div 
            animate={{ rotate: 360, scale: [1, 1.05, 1] }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -right-[20%] -bottom-[20%] w-[1000px] h-[1000px] border border-white/[0.03] rounded-full"
         />
         <motion.div 
            animate={{ rotate: -360, scale: [1, 1.1, 1] }}
            transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
            className="absolute -right-[10%] -bottom-[10%] w-[700px] h-[700px] border border-white/[0.05] rounded-full"
         />
         <motion.div 
            animate={{ rotate: 180, scale: [1, 0.9, 1] }}
            transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
            className="absolute -right-[5%] -bottom-[5%] w-[400px] h-[400px] border border-primary/10 rounded-full shadow-[0_0_50px_rgba(16,185,129,0.05)]"
         />
      </div>

      {/* Floating particles background */}
      {[...Array(15)].map((_, i) => (
         <motion.div
           key={i}
           initial={{ 
             opacity: 0, 
             x: Math.random() * 100 + "%", 
             y: Math.random() * 100 + "%" 
           }}
           animate={{ 
             y: ["0%", "-10%", "0%"],
             opacity: [0.05, 0.15, 0.05]
           }}
           transition={{ 
             duration: 10 + Math.random() * 20, 
             repeat: Infinity,
             delay: Math.random() * 10
           }}
           className="absolute w-[2px] h-[2px] bg-white rounded-full blur-[2px]"
         />
      ))}
    </div>
  )
}
