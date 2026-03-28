"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, AlertTriangle, MapPin, Image, Eye, 
  CheckCircle2, XCircle, Loader2, Scan, Fingerprint,
  Layers, Globe, Camera, Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface VerificationLayer {
  label: string;
  icon: React.ReactNode;
  score: number;
  status: 'pass' | 'warn' | 'fail';
  reason: string;
}

interface VerificationResultProps {
  result: {
    layer1_authenticity?: {
      is_real: boolean;
      confidence: number;
      type: string;
      reason: string;
      signals_detected?: string[];
    };
    layer2_relevance?: {
      matches_description: boolean;
      confidence: number;
      reason: string;
      detected_objects?: string[];
    };
    layer3_geo_consistency?: {
      location_plausible: boolean;
      confidence: number;
      reason: string;
      detected_region_cues?: string[];
    };
    overall_trust_score: number;
    verdict: string;
    verdict_reason: string;
    short_description?: string;
    tags?: string[];
    spoofing_flags?: string[];
    authentic: boolean;
    requires_manual_review?: boolean;
    suspicious_activity?: {
      flagged: boolean;
      flags: string[];
      severity: string;
    };
  } | null;
  loading?: boolean;
  onClose?: () => void;
}

export default function VerificationResultCard({ result, loading, onClose }: VerificationResultProps) {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (result && !loading) {
      const t1 = setTimeout(() => setAnimationPhase(1), 300);
      const t2 = setTimeout(() => setAnimationPhase(2), 800);
      const t3 = setTimeout(() => setAnimationPhase(3), 1300);
      const t4 = setTimeout(() => setAnimationPhase(4), 1800);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }
  }, [result, loading]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[2.5rem] border-2 border-[#16a34a]/20 bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] p-10 shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-1">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#16a34a] via-cyan-400 to-[#16a34a]"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            style={{ width: '50%' }}
          />
        </div>
        
        <div className="flex flex-col items-center gap-6 py-8">
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ rotate: { duration: 2, repeat: Infinity, ease: 'linear' }, scale: { duration: 1, repeat: Infinity } }}
            className="w-20 h-20 rounded-full bg-[#16a34a]/10 border-2 border-[#16a34a]/30 flex items-center justify-center"
          >
            <Scan size={36} className="text-[#16a34a]" />
          </motion.div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black text-white uppercase tracking-widest">Analyzing Image</h3>
            <p className="text-xs text-gray-500 font-bold">Multi-layer AI verification in progress...</p>
          </div>
          
          <div className="w-full max-w-md space-y-3 mt-4">
            {['Checking authenticity...', 'Verifying relevance...', 'Analyzing geolocation...', 'Computing trust score...'].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.4 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <Loader2 size={14} className="text-[#16a34a] animate-spin" />
                <span className="text-[11px] font-bold text-gray-400">{step}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (!result) return null;

  const isVerified = result.verdict === 'VERIFIED' || result.authentic;
  const isFlagged = result.verdict === 'FLAGGED' || result.requires_manual_review;
  const isRejected = result.verdict === 'REJECTED';

  const statusColor = isVerified ? '#16a34a' : isFlagged ? '#f59e0b' : '#ef4444';
  const statusBg = isVerified ? 'bg-[#16a34a]' : isFlagged ? 'bg-amber-500' : 'bg-red-500';
  const statusBgLight = isVerified ? 'bg-[#16a34a]/10' : isFlagged ? 'bg-amber-500/10' : 'bg-red-500/10';
  const statusBorder = isVerified ? 'border-[#16a34a]/30' : isFlagged ? 'border-amber-500/30' : 'border-red-500/30';
  const statusText = isVerified ? 'text-[#16a34a]' : isFlagged ? 'text-amber-500' : 'text-red-500';
  const StatusIcon = isVerified ? CheckCircle2 : isFlagged ? AlertTriangle : XCircle;

  const layers: VerificationLayer[] = [];
  if (result.layer1_authenticity) {
    const l1 = result.layer1_authenticity;
    layers.push({
      label: 'Authenticity',
      icon: <Fingerprint size={18} />,
      score: l1.confidence,
      status: l1.is_real ? 'pass' : l1.confidence < 40 ? 'fail' : 'warn',
      reason: l1.reason,
    });
  }
  if (result.layer2_relevance) {
    const l2 = result.layer2_relevance;
    layers.push({
      label: 'Relevance',
      icon: <Eye size={18} />,
      score: l2.confidence,
      status: l2.matches_description ? 'pass' : l2.confidence < 40 ? 'fail' : 'warn',
      reason: l2.reason,
    });
  }
  if (result.layer3_geo_consistency) {
    const l3 = result.layer3_geo_consistency;
    layers.push({
      label: 'Geo Match',
      icon: <Globe size={18} />,
      score: l3.confidence,
      status: l3.location_plausible ? 'pass' : l3.confidence < 40 ? 'fail' : 'warn',
      reason: l3.reason,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-[2.5rem] border-2 ${statusBorder} bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] shadow-2xl`}
    >
      {/* Ambient glow */}
      <div className="absolute top-[-30%] right-[-20%] w-64 h-64 rounded-full blur-[80px] opacity-[0.08] pointer-events-none" style={{ background: statusColor }} />
      <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 rounded-full blur-[60px] opacity-[0.05] pointer-events-none" style={{ background: statusColor }} />

      {/* Top status bar */}
      <div className={`${statusBg} px-8 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <StatusIcon size={20} className="text-black" />
          <span className="text-[11px] font-black text-black uppercase tracking-[0.3em]">
            {isVerified ? '✓ VERIFIED — Real Photo' : isFlagged ? '⚠ FLAGGED — Needs Review' : '✕ REJECTED — Suspicious'}
          </span>
        </div>
        <span className="text-[10px] font-black text-black/60 uppercase tracking-widest">
          {result.layer1_authenticity?.type?.replace('_', ' ') || 'Unknown'}
        </span>
      </div>

      <div className="p-8 md:p-10 space-y-8">
        {/* Main Score */}
        <AnimatePresence>
          {animationPhase >= 1 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col md:flex-row items-center gap-8"
            >
              {/* Circular score */}
              <div className="relative w-32 h-32 shrink-0">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <motion.circle 
                    cx="60" cy="60" r="50" fill="none" 
                    stroke={statusColor} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(result.overall_trust_score / 100) * 314} 314`}
                    initial={{ strokeDasharray: '0 314' }}
                    animate={{ strokeDasharray: `${(result.overall_trust_score / 100) * 314} 314` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">{result.overall_trust_score}</span>
                  <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Trust</span>
                </div>
              </div>

              {/* Verdict text */}
              <div className="text-center md:text-left flex-grow space-y-3">
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                  {result.short_description || (isVerified ? 'Image Verified' : isFlagged ? 'Under Review' : 'Image Rejected')}
                </h3>
                <p className="text-sm text-gray-400 italic font-medium leading-relaxed max-w-md">
                  &quot;{result.verdict_reason}&quot;
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Layer Breakdown */}
        <AnimatePresence>
          {animationPhase >= 2 && layers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <Layers size={14} /> Verification Layers
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                {layers.map((layer, i) => {
                  const layerColor = layer.status === 'pass' ? '#16a34a' : layer.status === 'warn' ? '#f59e0b' : '#ef4444';
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2" style={{ color: layerColor }}>
                          {layer.icon}
                          <span className="text-[10px] font-black uppercase tracking-widest">{layer.label}</span>
                        </div>
                        <span className="text-lg font-black" style={{ color: layerColor }}>{layer.score}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: layerColor }}
                          initial={{ width: 0 }}
                          animate={{ width: `${layer.score}%` }}
                          transition={{ duration: 1, delay: i * 0.15 + 0.3 }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{layer.reason}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tags */}
        <AnimatePresence>
          {animationPhase >= 3 && result.tags && result.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <Camera size={14} /> Detected Content
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spoofing Flags */}
        <AnimatePresence>
          {animationPhase >= 3 && result.spoofing_flags && result.spoofing_flags.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-3"
            >
              <h4 className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <AlertTriangle size={14} /> Red Flags Detected
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.spoofing_flags.map((flag, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] font-black text-red-400 uppercase tracking-wider">
                    ⚠ {flag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suspicious Activity Warning */}
        <AnimatePresence>
          {animationPhase >= 4 && result.suspicious_activity?.flagged && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-2xl bg-orange-500/5 border border-orange-500/20 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0">
                <Sparkles size={20} className="text-orange-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">
                  Suspicious Pattern: {result.suspicious_activity.severity}
                </h4>
                <p className="text-[11px] text-gray-500 font-medium">
                  {result.suspicious_activity.flags.join(', ')} — This NGO has been flagged for additional monitoring.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manual Review Badge */}
        {result.requires_manual_review && (
          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-center">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
              📋 Score between 50–70 — Queued for manual admin review
            </p>
          </div>
        )}

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] transition-all"
          >
            Dismiss
          </button>
        )}
      </div>
    </motion.div>
  );
}
