"use client";

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export default function StatCard({ icon: Icon, value, label, prefix = '', suffix = '', duration = 1500 }: StatCardProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="card p-8 border-[#16a34a]/10 bg-gradient-to-br from-[#161b22] to-black/40 flex flex-col items-center justify-center text-center relative group overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#16a34a] opacity-0 group-hover:opacity-5 transition-opacity duration-500 blur-[50px] translate-x-1/2 translate-y-1/2" />
      <Icon className="text-[#16a34a] mb-4 group-hover:scale-110 transition-transform duration-500" size={32} />
      <h3 className="text-4xl font-extrabold text-white font-jakarta mb-2 tracking-tighter shadow-sm">
        {prefix}{count.toLocaleString()}{suffix}
      </h3>
      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black opacity-80 group-hover:opacity-100 transition-opacity">
        {label}
      </p>
    </motion.div>
  );
}
