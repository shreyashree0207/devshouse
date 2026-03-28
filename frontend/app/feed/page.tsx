"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Flame, MessageCircle, Share2, CheckCircle2, User, AlertTriangle, MessageSquare } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function GlobalFeed() {
  const [activeTab, setActiveTab] = useState('Global');
  const [posts, setPosts] = useState([
    { 
      id: 1, ngo: 'Akshara Foundation', project: 'Rural Laptop Drive', img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', 
      verified: true, date: '2 hours ago', caption: 'First batch of 50 laptops distributed to students in village schools. Witnessing their smiles makes all the effort worth it!', 
      aiVerdict: 'VERIFIED', isOriginal: true, reactions: { heart: 24, flame: 12, hands: 45 }, comments: [] 
    },
    { 
      id: 2, ngo: 'Water for All', project: 'Clean Drinking Water', img: 'https://images.unsplash.com/photo-1541810574063-e18e3c3b0fa4?w=800', 
      verified: true, date: '5 hours ago', caption: 'The new filtration plant is successfully installed and operational. 2000 families now have access to safe drinking water.', 
      aiVerdict: 'VERIFIED', isOriginal: false, reactions: { heart: 112, flame: 89, hands: 231 }, 
      comments: [{ user: 'Anonymous Donor', text: 'Incredible work, glad to see this deployed!', NGOreply: 'Thank you for your trust!' }] 
    }
  ]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <div className="pt-32 pb-20 max-w-3xl mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-extrabold font-jakarta tracking-tight">Impact Feed</h1>
            <p className="text-gray-500 font-medium italic mt-2">Live, verified updates from the ground.</p>
          </div>
          <div className="flex bg-[#161b22] rounded-full p-1 border border-gray-800">
            {['Global', 'Following'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[#16a34a] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-12">
          {posts.map(post => (
            <motion.div key={post.id} initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="card bg-[#161b22] border border-gray-800/60 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-6 flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#16a34a] to-[#22c55e] flex items-center justify-center p-0.5"><div className="w-full h-full bg-[#161b22] rounded-full border border-black flex items-center justify-center"><User size={20} className="text-[#16a34a]"/></div></div>
                  <div>
                    <h3 className="font-bold flex items-center gap-2">{post.ngo} {post.verified && <CheckCircle2 size={14} className="text-[#16a34a]"/>}</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{post.project} • {post.date}</p>
                  </div>
                </div>
              </div>
              <div className="relative h-[400px]">
                <img src={post.img} alt="Post image" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-xl border ${post.aiVerdict === 'VERIFIED' ? 'bg-[#16a34a]/90 text-white border-[#16a34a]/50' : 'bg-red-500/90 text-white border-red-500/50'}`}>
                    AI {post.aiVerdict}
                  </div>
                  {!post.isOriginal && (
                    <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-xl border bg-orange-600/90 text-white border-orange-500/50 flex items-center gap-2">
                       <AlertTriangle size={12}/> ⚠️ Originality Flag
                    </div>
                  )}
                </div>
              </div>
              <div className="p-8">
                <p className="text-gray-300 leading-relaxed font-jakarta">{post.caption}</p>
                <div className="flex items-center gap-6 mt-8 pt-6 border-t border-gray-800">
                  <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors group"><Heart size={20} className="group-hover:fill-current"/> <span className="text-sm font-black">{post.reactions.heart}</span></button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-[#16a34a] transition-colors group">🙌 <span className="text-sm font-black">{post.reactions.hands}</span></button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors group"><Flame size={20} className="group-hover:fill-current"/> <span className="text-sm font-black">{post.reactions.flame}</span></button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors ml-auto"><MessageCircle size={20}/> <span className="text-sm font-black">{post.comments.length}</span></button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors"><Share2 size={20}/></button>
                </div>

                {/* Threaded Comments */}
                {post.comments.length > 0 && (
                  <div className="mt-8 space-y-4 bg-black/20 p-5 rounded-2xl">
                    {post.comments.map((c, i) => (
                      <div key={i} className="text-sm text-gray-400">
                        <p><span className="font-bold text-white">{c.user}</span>: {c.text}</p>
                        {c.NGOreply && (
                          <div className="mt-2 ml-6 pl-3 border-l-2 border-[#16a34a]/30">
                            <p className="text-gray-300"><span className="text-[#16a34a] font-black uppercase text-[10px] tracking-widest px-2 py-0.5 rounded-full bg-[#16a34a]/10 mr-2">NGO</span>{c.NGOreply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
