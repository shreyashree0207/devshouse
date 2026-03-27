"use client"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useState, useEffect } from "react"
import Link from "next/link"

// Leaf Icon for particles
const Particle = ({ color, size, duration, delay, initialX, initialY }) => (
  <motion.div
    initial={{ x: initialX, y: initialY, scale: 0, opacity: 0 }}
    animate={{ 
      y: [initialY, initialY - 400], 
      x: [initialX, initialX + (Math.random() * 100 - 50)],
      scale: [0, 1, 0.5, 0],
      opacity: [0, 0.4, 0.2, 0] 
    }}
    transition={{ 
      duration: duration, 
      repeat: Infinity, 
      delay: delay,
      ease: "linear"
    }}
    style={{ backgroundColor: color }}
    className="absolute w-2 h-2 rounded-full blur-[4px] pointer-events-none"
  />
)

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isFocused, setIsFocused] = useState("")
  const [mounted, setMounted] = useState(false)

  // Tilt Effect State
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = (mouseX / width) - 0.5
    const yPct = (mouseY / height) - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  if (!mounted) return null

  return (
    <main 
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave}
      className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-[#041d15] overflow-hidden"
    >
      
      {/* Immersive Dark-Eco Background */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -top-[10%] -left-[10%] w-[1000px] h-[1000px] bg-emerald-900/40 rounded-full blur-[160px]" 
        />
        <motion.div 
           animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.2, 0.4] }}
           transition={{ duration: 20, repeat: Infinity, delay: 2 }}
           className="absolute -bottom-[20%] -right-[10%] w-[1200px] h-[1200px] bg-green-950/50 rounded-full blur-[180px]" 
        />
        
        {/* Animated Mesh Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Floating Magic Particles */}
      {[...Array(40)].map((_, i) => (
        <Particle 
          key={i} 
          color={['#10b981', '#34d399', '#ccff00'][i % 3]} 
          size={Math.random() * 6 + 2} 
          duration={10 + Math.random() * 15} 
          delay={Math.random() * 10}
          initialX={Math.random() * 100 + "%"}
          initialY={100 + Math.random() * 10 + "%"}
        />
      ))}

      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[500px]"
      >
        {/* The 3D Floating Login Card */}
        <div className="glass border border-white/10 p-12 md:p-16 rounded-[4rem] shadow-[0_64px_128px_-16px_rgba(0,0,0,0.8)] relative group overflow-hidden">
          
          {/* Moving Glow Effect */}
          <motion.div 
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"
          />

          <div className="relative z-10">
            {/* Logo Section */}
            <div className="text-center mb-10">
              <motion.div 
                 whileHover={{ rotate: 15, scale: 1.1 }}
                 className="relative w-20 h-20 mx-auto mb-6 cursor-pointer"
              >
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
                <div className="relative w-full h-full bg-gradient-to-br from-emerald-500 to-green-700 rounded-3xl flex items-center justify-center text-white shadow-2xl border border-white/20">
                  <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 3v18M8 15l4 4 4-4M12 9l-4-4 4-4" />
                    <circle cx="12" cy="12" r="9" opacity="0.4" />
                    <path d="M12 2C6.477 2 2 6.477 2 12C2 17.522 6.477 22 12 22C17.522 22 22 17.522 22 12C22 6.477 17.522 2 12 2Z" strokeOpacity="1" />
                  </svg>
                </div>
              </motion.div>
              <h1 className="text-5xl font-black tracking-tighter text-white mb-2 drop-shadow-sm">Sustainify</h1>
              <p className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.4em] opacity-60">Revolutionary Earth Protocol</p>
            </div>

            <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
              
              {/* Name Field */}
              <motion.div 
                className="relative"
                initial={false}
                animate={isFocused === 'name' ? { scale: 1.02, x: 5 } : { scale: 1, x: 0 }}
              >
                 <motion.label 
                   animate={{ 
                     y: isFocused === 'name' || name ? -32 : 12, 
                     x: isFocused === 'name' || name ? 0 : 20,
                     scale: isFocused === 'name' || name ? 0.8 : 1,
                     color: isFocused === 'name' ? '#10b981' : '#64748b'
                   }}
                   className="absolute pointer-events-none font-bold text-[11px] tracking-[0.2em] uppercase transition-colors"
                 >
                   Full Identity
                 </motion.label>
                 <input 
                   type="text" 
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   onFocus={() => setIsFocused('name')}
                   onBlur={() => setIsFocused('')}
                   className="w-full bg-white/5 border-b-2 border-white/5 px-6 py-4 text-white font-bold focus:outline-none focus:border-emerald-500 transition-all rounded-t-3xl selection:bg-emerald-500/30"
                   placeholder=""
                   required
                 />
              </motion.div>

              {/* Email Field */}
              <motion.div 
                className="relative"
                initial={false}
                animate={isFocused === 'email' ? { scale: 1.02, x: 5 } : { scale: 1, x: 0 }}
              >
                 <motion.label 
                   animate={{ 
                     y: isFocused === 'email' || email ? -32 : 12, 
                     x: isFocused === 'email' || email ? 0 : 20,
                     scale: isFocused === 'email' || email ? 0.8 : 1,
                     color: isFocused === 'email' ? '#10b981' : '#64748b'
                   }}
                   className="absolute pointer-events-none font-bold text-[11px] tracking-[0.2em] uppercase transition-colors"
                 >
                   Nexus Email Address
                 </motion.label>
                 <input 
                   type="email" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   onFocus={() => setIsFocused('email')}
                   onBlur={() => setIsFocused('')}
                   className="w-full bg-white/5 border-b-2 border-white/5 px-6 py-4 text-white font-bold focus:outline-none focus:border-emerald-500 transition-all rounded-t-3xl selection:bg-emerald-500/30"
                   placeholder=""
                   required
                 />
                 {email && !email.includes('@') && (
                   <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-black text-emerald-400 italic uppercase tracking-widest mt-3 ml-2">
                     Waiting for valid uplink...
                   </motion.p>
                 )}
              </motion.div>

              <motion.button
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 0 50px rgba(16,185,129,0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-6 rounded-3xl font-black text-[#041d15] text-xl tracking-tight shadow-2xl transition-all relative overflow-hidden group/btn"
                style={{ background: "linear-gradient(135deg, #10b981 0%, #ccff00 100%)" }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10 uppercase tracking-widest">Join the Movement</span>
              </motion.button>
            </form>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-12 text-center text-[10px] text-emerald-100/30 font-bold uppercase tracking-[0.3em] leading-relaxed max-w-[280px] mx-auto"
            >
              We respect your privacy and use your data responsibly.
            </motion.p>
          </div>
        </div>

        {/* Floating Ring footer */}
        <div className="absolute -z-10 -bottom-10 -right-10 w-40 h-40 border border-white/5 rounded-full animate-ping" />
        
        <p className="mt-14 text-center text-[11px] font-black text-white/20 uppercase tracking-[0.5em]">
          &copy; Sustainify NGO · Earth v.4.2
        </p>
      </motion.div>

    </main>
  )
}
