"use client";

import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Users, ShieldCheck, Info } from 'lucide-react';
import { useState } from 'react';

interface CrowdVotingProps {
  proofId: string;
  imageUrl?: string;
  currentVotes?: { genuine: number; fake: number };
  aiScore?: number;
  onVote?: (vote: 'genuine' | 'fake') => void;
}

export default function CrowdVoting({ proofId, imageUrl, currentVotes, aiScore = 75, onVote }: CrowdVotingProps) {
  const [voted, setVoted] = useState<'genuine' | 'fake' | null>(null);
  const [votes, setVotes] = useState(currentVotes || { genuine: 12, fake: 2 });
  const [showResult, setShowResult] = useState(false);

  const totalVotes = votes.genuine + votes.fake;
  const crowdScore = totalVotes > 0 ? Math.round((votes.genuine / totalVotes) * 100) : 50;
  const finalScore = Math.round(aiScore * 0.7 + crowdScore * 0.3);

  const handleVote = (v: 'genuine' | 'fake') => {
    if (voted) return;
    setVoted(v);
    setVotes(prev => ({
      genuine: prev.genuine + (v === 'genuine' ? 1 : 0),
      fake: prev.fake + (v === 'fake' ? 1 : 0),
    }));
    setShowResult(true);
    onVote?.(v);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-[2rem] bg-white/[0.03] border border-white/[0.06] overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-purple-400" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Community Verification</span>
        </div>
        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
          {totalVotes + (voted ? 1 : 0)} votes
        </span>
      </div>

      <div className="p-6 space-y-5">
        {/* Question */}
        <p className="text-sm font-bold text-white text-center">
          Does this look like genuine NGO work?
        </p>

        {/* Vote buttons */}
        {!voted ? (
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleVote('genuine')}
              className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#16a34a]/10 border border-[#16a34a]/20 text-[#16a34a] font-black text-[11px] uppercase tracking-widest hover:bg-[#16a34a]/20 transition-all"
            >
              <ThumbsUp size={18} /> Yes, Genuine
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleVote('fake')}
              className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-black text-[11px] uppercase tracking-widest hover:bg-red-500/20 transition-all"
            >
              <ThumbsDown size={18} /> Looks Fake
            </motion.button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Thank you */}
            <div className={`p-3 rounded-xl text-center ${voted === 'genuine' ? 'bg-[#16a34a]/10 border border-[#16a34a]/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest ${voted === 'genuine' ? 'text-[#16a34a]' : 'text-red-400'}`}>
                ✓ You voted: {voted === 'genuine' ? 'Genuine' : 'Suspicious'}
              </p>
            </div>

            {/* Vote breakdown bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                <span className="text-[#16a34a]">Genuine ({votes.genuine})</span>
                <span className="text-red-400">Fake ({votes.fake})</span>
              </div>
              <div className="w-full h-2 bg-red-500/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#16a34a] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(votes.genuine / (votes.genuine + votes.fake)) * 100}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>

            {/* Blended score */}
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-purple-400" />
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Blended Trust Score</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xl font-black text-[#16a34a]">{aiScore}</p>
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">AI (70%)</p>
                </div>
                <div>
                  <p className="text-xl font-black text-purple-400">{crowdScore}</p>
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Crowd (30%)</p>
                </div>
                <div className="border-l border-white/5">
                  <p className="text-xl font-black text-white">{finalScore}</p>
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Final</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Info note */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[9px] text-blue-400/70 font-medium leading-relaxed">
            Community votes combined with AI analysis create a blended trust score. 
            This helps catch edge cases AI might miss.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
