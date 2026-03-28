"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Users, MessageSquare, ShieldCheck, ThumbsUp, ThumbsDown, 
  TrendingUp, Award, Zap, Activity, Info
} from 'lucide-react';
import { supabase, getCurrentUser } from '../../lib/supabase';
import Navbar from '../../components/Navbar';

export default function CommunityFeed() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [proofs, setProofs] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: msgs } = await supabase
        .from('community_feed')
        .select('*')
        .order('created_at', { ascending: true });
      if (msgs) setMessages(msgs);

      const { data: prfs } = await supabase
        .from('proof_updates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      if (prfs) setProofs(prfs);

      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };

    fetchData();

    // Supabase Realtime Subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_feed' },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const { error } = await supabase.from('community_feed').insert({
      user_id: user.id,
      user_email: user.email,
      content: newMessage
    });

    if (error) {
      console.error("Error sending message:", error);
    } else {
      setNewMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-jakarta">
      <Navbar />
      
      <main className="max-w-7xl mx-auto pt-32 pb-20 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-4 gap-12 h-[calc(100vh-128px)]">
        
        {/* Left Sidebar: Community Stats */}
        <div className="hidden lg:flex flex-col gap-6">
           <div className="card p-8 border-[#16a34a]/20 bg-gradient-to-br from-[#161b22] to-black">
              <h3 className="text-sm font-black text-[#16a34a] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <TrendingUp size={16} /> Impact Network
              </h3>
              <div className="space-y-6">
                 <div>
                    <p className="text-2xl font-black">12.4k</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Guardians</p>
                 </div>
                 <div className="h-px bg-gray-800" />
                 <div>
                    <p className="text-2xl font-black text-[#16a34a]">₹8.4M</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Crowd-Verified Impact</p>
                 </div>
              </div>
           </div>

           <div className="card p-8 border-gray-800 bg-[#161b22]/40">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Trending Tags</h3>
              <div className="flex flex-wrap gap-2">
                 {['#EducationForAll', '#CleanWater', '#TamilNaduImpact', '#TransparencyFirst'].map(tag => (
                    <span key={tag} className="text-[10px] px-3 py-1.5 rounded-lg bg-black/40 border border-gray-800 text-gray-500 font-bold hover:text-[#16a34a] hover:border-[#16a34a]/30 cursor-pointer transition-all">
                       {tag}
                    </span>
                 ))}
              </div>
           </div>
        </div>

        {/* Center: Real-time Feed */}
        <div className="lg:col-span-2 flex flex-col card overflow-hidden border-gray-800 bg-[#0d1117]">
           {/* Feed Header */}
           <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#161b22]">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-[#16a34a]/10 border border-[#16a34a]/30 flex items-center justify-center">
                    <MessageSquare size={20} className="text-[#16a34a]" />
                 </div>
                 <div>
                    <h2 className="text-lg font-black tracking-tight leading-none">Guardians Feed</h2>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Real-time Crowdsourced Verification</p>
                 </div>
              </div>
              <div className="flex -space-x-2">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#161b22] bg-gray-700 animate-pulse" />
                 ))}
                 <div className="w-8 h-8 rounded-full border-2 border-[#161b22] bg-[#16a34a] flex items-center justify-center text-[10px] font-black">+24</div>
              </div>
           </div>

           {/* Messages Area */}
           <div 
              ref={scrollRef}
              className="flex-grow p-8 overflow-y-auto space-y-6 scrollbar-hide bg-[#0d1117] radial-gradient"
            >
              {messages.map((msg, i) => (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id || i}
                    className={`flex flex-col ${msg.user_email === user?.email ? 'items-end' : 'items-start'}`}
                 >
                    <div className="flex items-center gap-2 mb-1 px-1">
                       <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{msg.user_email?.split('@')[0]}</span>
                       <span className="text-[8px] text-gray-700 font-bold">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed border ${
                       msg.user_email === user?.email 
                         ? 'bg-[#16a34a]/10 border-[#16a34a]/30 text-white rounded-tr-none' 
                         : 'bg-[#161b22] border-gray-800 text-gray-300 rounded-tl-none'
                    }`}>
                       {msg.content}
                    </div>
                 </motion.div>
              ))}
           </div>

           {/* Input Area */}
           <form onSubmit={handleSendMessage} className="p-6 bg-[#161b22] border-t border-gray-800 flex gap-4">
              <input 
                 type="text" 
                 placeholder="Join the radical transparency movement..."
                 value={newMessage}
                 onChange={(e) => setNewMessage(e.target.value)}
                 className="flex-grow bg-black/40 border border-gray-800 focus:border-[#16a34a/50] rounded-xl px-6 py-4 text-sm outline-none transition-all placeholder:text-gray-600 font-medium"
              />
              <button 
                 type="submit"
                 className="p-4 rounded-xl bg-[#16a34a] text-white hover:scale-110 active:scale-95 transition-all shadow-lg"
              >
                 <Send size={20} />
              </button>
           </form>
        </div>

        {/* Right Sidebar: Crowd Verification */}
        <div className="flex flex-col gap-6">
           <div className="card p-6 border-[#16a34a]/30 bg-[#16a34a]/5">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                 <ShieldCheck size={16} className="text-[#16a34a]" /> Crowd Verification
              </h3>
              <p className="text-[10px] text-gray-400 font-medium italic mb-6">Users manually upvote/downvote recent NGO proof images to ensure ground-truth.</p>
              
              <div className="space-y-6">
                 {proofs.map(proof => (
                    <div key={proof.id} className="group cursor-pointer">
                       <div className="relative h-32 rounded-xl overflow-hidden mb-3 border border-gray-800 group-hover:border-[#16a34a]/50 transition-all">
                          <img src={proof.image_url || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[8px] font-black text-[#16a34a] border border-[#16a34a]/30">AI SAFE</div>
                       </div>
                       <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                             <button className="p-2 rounded-lg bg-gray-800 hover:bg-[#16a34a]/20 text-gray-500 hover:text-[#16a34a] transition-all">
                                <ThumbsUp size={14} />
                             </button>
                             <button className="p-2 rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all">
                                <ThumbsDown size={14} />
                             </button>
                          </div>
                          <span className="text-[10px] font-black text-gray-500">{proof.community_upvotes || 0} votes</span>
                       </div>
                    </div>
                 ))}
                 
                 <button className="w-full py-3 rounded-xl border border-dashed border-gray-800 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white hover:border-gray-600 transition-all">
                    View More Proofs
                 </button>
              </div>
           </div>

           <div className="card p-6 bg-blue-500/5 border-blue-500/20">
              <div className="flex items-start gap-4">
                 <Info size={16} className="text-blue-400 shrink-0 mt-1" />
                 <div>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Guardian Protocol</h4>
                    <p className="text-[9px] text-gray-500 font-semibold leading-relaxed">
                       Your verification votes directly affect an NGO's Transparency Score. Vote responsibly to maintain ecosystem integrity.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </main>

      <style jsx>{`
        .radial-gradient {
          background-image: radial-gradient(circle at 50% -20%, rgba(22, 163, 94, 0.05) 0%, transparent 70%);
        }
      `}</style>
    </div>
  );
}
