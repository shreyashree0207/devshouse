"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Heart, ShieldCheck, Trophy, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FeedItem {
  id: string;
  type: string;
  user_name: string;
  ngo_name: string;
  amount?: number | null;
  message: string;
  activity_title: string;
  category: string;
  icon: string;
  created_at: string;
}

interface ImpactFeedProps {
  apiUrl?: string;
}

const DEMO_FEED: FeedItem[] = [
  {
    id: "1", type: "donation", user_name: "Priya Sharma",
    ngo_name: "GreenSteps Chennai", amount: 500,
    message: "Will fund 2 tree planting sessions in Adyar",
    activity_title: "Urban Green Cover Drive", category: "Environment",
    icon: "🌱", created_at: new Date(Date.now() - 2 * 60000).toISOString()
  },
  {
    id: "2", type: "donation", user_name: "Rahul Krishnan",
    ngo_name: "Udaan Education Trust", amount: 1000,
    message: "Will provide textbooks for 12 children in Salem",
    activity_title: "Books for Bright Futures", category: "Education",
    icon: "📚", created_at: new Date(Date.now() - 15 * 60000).toISOString()
  },
  {
    id: "3", type: "verification", user_name: "AI System",
    ngo_name: "Namma Medics", amount: null,
    message: "Proof verified: Medical camp photo scored 94/100 — AI confirmed authentic",
    activity_title: "Free Eye Checkup Camp", category: "Healthcare",
    icon: "✅", created_at: new Date(Date.now() - 20 * 60000).toISOString()
  },
  {
    id: "4", type: "milestone", user_name: "System",
    ngo_name: "Clean Coast TN", amount: null,
    message: "Milestone 2 completed: 500kg plastic removed from Marina Beach",
    activity_title: "Marina Beach Cleanup", category: "Environment",
    icon: "🏆", created_at: new Date(Date.now() - 35 * 60000).toISOString()
  },
  {
    id: "5", type: "donation", user_name: "Ananya Reddy",
    ngo_name: "Akshara Foundation", amount: 2500,
    message: "Will support 3 months of after-school tutoring for 5 students",
    activity_title: "After-School Academic Support", category: "Education",
    icon: "✨", created_at: new Date(Date.now() - 65 * 60000).toISOString()
  },
  {
    id: "6", type: "badge", user_name: "System",
    ngo_name: "GreenSteps Chennai", amount: null,
    message: "Earned 'Consistent Verifier' badge — 10 consecutive proofs verified above 85",
    activity_title: "", category: "Environment",
    icon: "🛡️", created_at: new Date(Date.now() - 80 * 60000).toISOString()
  },
  {
    id: "7", type: "donation", user_name: "Karthik S.",
    ngo_name: "Namma Medics", amount: 750,
    message: "Will cover medicines for 15 patients at the next health camp",
    activity_title: "Community Health Initiative", category: "Healthcare",
    icon: "💊", created_at: new Date(Date.now() - 95 * 60000).toISOString()
  },
  {
    id: "8", type: "donation", user_name: "Meera Venkat",
    ngo_name: "Clean Coast TN", amount: 300,
    message: "Will provide cleanup kits for 6 volunteers",
    activity_title: "Marina Beach Cleanup", category: "Environment",
    icon: "🌊", created_at: new Date(Date.now() - 110 * 60000).toISOString()
  }
];

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'donation': return <Heart size={14} className="text-pink-400" />;
    case 'verification': return <ShieldCheck size={14} className="text-[#16a34a]" />;
    case 'milestone': return <Trophy size={14} className="text-yellow-400" />;
    case 'badge': return <Sparkles size={14} className="text-purple-400" />;
    default: return <Activity size={14} className="text-blue-400" />;
  }
}

function getTypeBorder(type: string) {
  switch (type) {
    case 'donation': return 'border-l-pink-500/30';
    case 'verification': return 'border-l-[#16a34a]/30';
    case 'milestone': return 'border-l-yellow-500/30';
    case 'badge': return 'border-l-purple-500/30';
    default: return 'border-l-blue-500/30';
  }
}

export default function ImpactFeed({ apiUrl: propApiUrl }: ImpactFeedProps) {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemId, setNewItemId] = useState<string | null>(null);

  const apiUrl = propApiUrl || process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const loadFeed = async () => {
      if (apiUrl) {
        try {
          const res = await fetch(`${apiUrl}/api/v1/feed`);
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setFeed(data);
          } else {
            setFeed(DEMO_FEED);
          }
        } catch {
          setFeed(DEMO_FEED);
        }
      } else {
        setFeed(DEMO_FEED);
      }
      setLoading(false);
    };
    loadFeed();
  }, [apiUrl]);

  // Simulate live updates every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const names = ['Deepa M.', 'Vijay Kumar', 'Sathya R.', 'Lakshmi N.', 'Arjun P.', 'Divya S.'];
      const ngos = ['GreenSteps Chennai', 'Udaan Education', 'Namma Medics', 'Clean Coast TN'];
      const amounts = [200, 500, 750, 1000, 1500, 2000];
      const messages = [
        'Will fund classroom supplies for 8 children',
        'Will support one week of clean water supply',
        'Will provide nutrition packs for 20 families',
        'Will plant 5 saplings in the metro area',
      ];
      
      const newItem: FeedItem = {
        id: `live-${Date.now()}`,
        type: 'donation',
        user_name: names[Math.floor(Math.random() * names.length)],
        ngo_name: ngos[Math.floor(Math.random() * ngos.length)],
        amount: amounts[Math.floor(Math.random() * amounts.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        activity_title: '',
        category: 'General',
        icon: '🌱',
        created_at: new Date().toISOString(),
      };
      
      setNewItemId(newItem.id);
      setFeed(prev => [newItem, ...prev.slice(0, 9)]);
      setTimeout(() => setNewItemId(null), 3000);
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity size={20} className="text-[#16a34a]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#16a34a] rounded-full animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Live Impact Feed</h3>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Real-time donor activity</p>
          </div>
        </div>
        <span className="px-3 py-1.5 bg-[#16a34a]/10 border border-[#16a34a]/20 rounded-full text-[8px] font-black text-[#16a34a] uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#16a34a] rounded-full animate-pulse" /> Live
        </span>
      </div>

      {/* Feed items */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
        <AnimatePresence>
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-white/[0.03] border border-white/5 rounded-2xl animate-pulse" />
            ))
          ) : (
            feed.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.4, delay: i < 5 ? i * 0.08 : 0 }}
                className={`relative p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] border-l-2 ${getTypeBorder(item.type)} 
                  hover:bg-white/[0.04] transition-all group ${item.id === newItemId ? 'ring-1 ring-[#16a34a]/30' : ''}`}
              >
                {item.id === newItemId && (
                  <motion.div 
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 3 }}
                    className="absolute inset-0 bg-[#16a34a]/5 rounded-2xl pointer-events-none"
                  />
                )}
                
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5 shrink-0">{item.icon}</span>
                  <div className="flex-grow min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTypeIcon(item.type)}
                      <span className="text-xs font-black text-white">{item.user_name}</span>
                      {item.amount && (
                        <span className="text-xs font-black text-[#16a34a]">₹{item.amount.toLocaleString()}</span>
                      )}
                      <span className="text-[9px] font-bold text-gray-600">→</span>
                      <span className="text-[10px] font-bold text-gray-400 truncate">{item.ngo_name}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                      &quot;{item.message}&quot;
                    </p>
                    <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{timeAgo(item.created_at)}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
