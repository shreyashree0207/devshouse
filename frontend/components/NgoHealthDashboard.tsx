"use client";

import { motion } from 'framer-motion';
import { 
  Upload, Target, Users, ShieldCheck, TrendingUp, 
  AlertTriangle, CheckCircle2, Activity, BarChart3
} from 'lucide-react';

interface NgoHealthProps {
  ngoName: string;
  data?: {
    proof_upload_rate: number;
    milestone_speed: number;
    avg_ai_score: number;
    verified_proofs: number;
    total_proofs: number;
    total_donors: number;
    total_activities: number;
    verified_activities: number;
    suspicious_flags: number;
    health_status: string;
  };
}

function ProgressBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const blocks = 10;
  const filledBlocks = Math.round((pct / 100) * blocks);
  
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: blocks }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className={`w-full h-2.5 rounded-sm ${i < filledBlocks ? '' : 'bg-white/5'}`}
          style={{ backgroundColor: i < filledBlocks ? color : undefined }}
        />
      ))}
      <span className="text-xs font-black text-white ml-2 min-w-[3ch] text-right">{Math.round(pct)}%</span>
    </div>
  );
}

export default function NgoHealthDashboard({ ngoName, data }: NgoHealthProps) {
  const d = data || {
    proof_upload_rate: 80,
    milestone_speed: 60,
    avg_ai_score: 86,
    verified_proofs: 12,
    total_proofs: 15,
    total_donors: 45,
    total_activities: 8,
    verified_activities: 5,
    suspicious_flags: 0,
    health_status: 'good',
  };

  const healthColors: Record<string, { bg: string; border: string; text: string; label: string }> = {
    excellent: { bg: 'bg-[#16a34a]/10', border: 'border-[#16a34a]/30', text: 'text-[#16a34a]', label: 'EXCELLENT ✓' },
    good: { bg: 'bg-[#16a34a]/10', border: 'border-[#16a34a]/20', text: 'text-[#16a34a]', label: 'GOOD ✓' },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', label: 'WARNING ⚠' },
    critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'CRITICAL ✕' },
    unknown: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400', label: 'UNKNOWN' },
  };

  const status = healthColors[d.health_status] || healthColors.unknown;

  const metrics = [
    { label: 'Proof Upload Rate', value: d.proof_upload_rate, color: '#3b82f6', icon: <Upload size={16} /> },
    { label: 'Milestone Speed', value: d.milestone_speed, color: '#a855f7', icon: <Target size={16} /> },
    { label: 'AI Verification Avg', value: d.avg_ai_score, color: '#16a34a', icon: <ShieldCheck size={16} /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2.5rem] bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] border border-white/[0.06] overflow-hidden"
    >
      {/* Header */}
      <div className="px-8 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <BarChart3 size={20} className="text-gray-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-tight">{ngoName}</h3>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Health Dashboard</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-xl ${status.bg} border ${status.border}`}>
          <span className={`text-[10px] font-black ${status.text} uppercase tracking-widest`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Metrics */}
      <div className="p-8 space-y-5">
        {metrics.map((metric, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <span style={{ color: metric.color }}>{metric.icon}</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{metric.label}</span>
            </div>
            <ProgressBar value={metric.value} color={metric.color} />
          </motion.div>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Quick Stats */}
      <div className="p-8 grid grid-cols-3 gap-4">
        {[
          { l: 'Verified', v: `${d.verified_proofs}/${d.total_proofs}`, icon: <CheckCircle2 size={14} className="text-[#16a34a]" /> },
          { l: 'Donors', v: String(d.total_donors), icon: <Users size={14} className="text-blue-400" /> },
          { l: 'Flags', v: String(d.suspicious_flags), icon: d.suspicious_flags > 0 ? <AlertTriangle size={14} className="text-red-400" /> : <ShieldCheck size={14} className="text-[#16a34a]" /> },
        ].map((stat, i) => (
          <div key={i} className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
            <div className="flex justify-center">{stat.icon}</div>
            <p className="text-lg font-black text-white">{stat.v}</p>
            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{stat.l}</p>
          </div>
        ))}
      </div>

      {/* Suspicious flag banner */}
      {d.suspicious_flags > 0 && (
        <div className="mx-8 mb-8 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center gap-3">
          <AlertTriangle size={16} className="text-red-400 shrink-0" />
          <p className="text-[10px] text-red-400 font-bold">
            {d.suspicious_flags} suspicious flag{d.suspicious_flags > 1 ? 's' : ''} detected. Under review until admin clears.
          </p>
        </div>
      )}
    </motion.div>
  );
}
