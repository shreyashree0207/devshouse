"use client";

import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Check, Calendar, TrendingUp } from 'lucide-react';

interface MilestoneProps {
  milestones: {
    id: number;
    title: string;
    description?: string;
    target_date?: string;
    date?: string;
    amount?: number;
    status?: 'done' | 'pending';
    done?: boolean;
  }[];
}

export default function MilestoneTimeline({ milestones }: MilestoneProps) {
  if (milestones.length === 0) {
    return (
      <div className="card p-12 text-center border-dashed border-gray-800 bg-[#161b22]/40 rounded-[2rem]">
        <Clock className="text-gray-700 mx-auto mb-6" size={56} />
        <h3 className="text-2xl font-bold text-gray-500 mb-2 font-jakarta">This NGO hasn&apos;t added milestones yet</h3>
        <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">Milestones help donors track exactly where every rupee is being allocated in real-time.</p>
      </div>
    );
  }

  return (
    <div className="relative py-12 px-8 ml-4 border-l-2 border-[#16a34a]/10 space-y-16">
      <div className="absolute top-0 -left-1 w-2 h-2 rounded-full bg-[#16a34a]/20 shadow-lg" />
      <div className="absolute bottom-0 -left-1 w-2 h-2 rounded-full bg-[#16a34a]/20 shadow-lg" />
      
      {milestones.map((ms, i) => {
        // Support both schema formats: done (boolean) and status ('done'/'pending')
        const isDone = ms.done === true || ms.status === 'done';
        const displayDate = ms.date || ms.target_date || 'TBD';

        return (
          <motion.div
            key={ms.id}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative group pl-12"
          >
            {/* Timeline Dot */}
            <div className={`absolute -left-[54px] top-1.5 w-6 h-6 rounded-full border-4 shadow-2xl transition-all duration-500 flex items-center justify-center ${
              isDone ? 'bg-[#16a34a] border-[#16a34a]/30 shadow-[#16a34a]/20' : 'bg-[#161b22] border-gray-800'
            }`}>
              {isDone && <Check className="text-white" size={14} strokeWidth={4} />}
              {isDone && <div className="absolute -inset-2 bg-[#16a34a]/20 rounded-full animate-ping opacity-50" />}
            </div>

            <div className="card p-10 bg-gradient-to-br from-[#161b22] to-black/40 hover:border-[#16a34a]/30 transition-all duration-500 shadow-xl group">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <h3 className={`text-2xl font-black font-jakarta ${isDone ? 'text-white' : 'text-gray-500'}`}>
                      {ms.title}
                    </h3>
                    {isDone && (
                      <span className="px-3 py-1 bg-[#16a34a]/10 border border-[#16a34a]/30 rounded-full text-[10px] font-black uppercase tracking-widest text-[#16a34a] shadow-lg">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                  <p className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mt-2">
                    <Calendar size={14} className="text-[#16a34a]" /> {displayDate}
                  </p>
                </div>
                
                {ms.amount && (
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black opacity-80">Allocation</p>
                    <p className="text-xl font-extrabold text-[#16a34a] font-jakarta tracking-tight">
                      ₹{ms.amount.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              
              {ms.description && (
                <p className={`text-lg leading-relaxed font-medium transition-colors duration-500 ${
                  isDone ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {ms.description}
                </p>
              )}
              
              {isDone && (
                <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-[#16a34a] uppercase tracking-widest bg-[#16a34a]/5 px-4 py-2 rounded-xl border border-[#16a34a]/10 self-start shadow-sm">
                  <TrendingUp size={16} /> Verified Proof Link Attached ✓
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
