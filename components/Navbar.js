"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()

  const navLinks = [
    { name: "Explore Missions", path: "/" },
    { name: "Our Impact", path: "/dashboard" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
      <motion.div 
         initial={{ y: -100, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
         className="max-w-7xl mx-auto glass rounded-[2rem] px-8 py-3.5 flex justify-between items-center border border-white/40 shadow-xl shadow-slate-200/20"
      >
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 group-hover:rotate-12 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-800">Sustainify</h1>
          </div>
        </Link>
        
        <div className="flex items-center gap-10">
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                 key={link.path} 
                 href={link.path} 
                 className={`text-sm font-black uppercase tracking-widest transition-all hover:text-primary ${
                   pathname === link.path ? "text-primary px-4 py-2 bg-emerald-50 rounded-xl" : "text-slate-500"
                 }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/login">
               <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm font-black uppercase tracking-widest text-slate-800 hover:text-primary transition-colors px-4"
               >
                  Log In
               </motion.button>
            </Link>
            <Link href="/dashboard">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(22,163,74,0.15)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-white px-7 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-100"
              >
                Register NGO
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </nav>
  )
}
