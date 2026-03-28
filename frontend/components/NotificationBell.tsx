"use client";

import { useEffect, useState } from 'react';
import { supabase, getCurrentUser } from '../lib/supabase';
import { Bell, Clock, ShieldCheck, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser();
      if (!user) return;

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }

      // Real-time subscription
      const sub = supabase
        .channel('realtime:notifications')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications', 
            filter: `user_id=eq.${user.id}` 
        }, (payload) => {
            setNotifications(prev => [payload.new, ...prev].slice(0, 5));
            setUnreadCount(prev => prev + 1);
        })
        .subscribe();

      return () => { supabase.removeChannel(sub); };
    };
    init();
  }, []);

  const markAsRead = async () => {
     const user = await getCurrentUser();
     if (!user || unreadCount === 0) return;
     await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
     setUnreadCount(0);
     setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => { setShow(!show); markAsRead(); }}
        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all relative"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-[#0a0f0a] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-80 bg-[#161b22] border border-gray-800 rounded-3xl shadow-3xl overflow-hidden z-[100]"
          >
            <div className="p-5 border-b border-gray-800 flex justify-between items-center">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-[#16a34a]">Notifications</h4>
               <span className="text-[10px] text-gray-500 font-bold">{unreadCount} New</span>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
               {notifications.length === 0 ? (
                 <div className="p-10 text-center space-y-2">
                    <Clock size={32} className="mx-auto text-gray-800" />
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">No Recent Updates</p>
                 </div>
               ) : (
                 notifications.map(n => (
                   <Link 
                      href={`/activities/${n.activity_id}`} 
                      key={n.id} 
                      onClick={() => setShow(false)}
                      className={`block p-5 border-b border-gray-800 hover:bg-[#16a34a]/5 transition-all ${!n.read ? 'bg-white/[0.02]' : ''}`}
                   >
                     <div className="flex gap-4">
                        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                           n.type === 'proof_verified' ? 'bg-[#16a34a]/10 text-[#16a34a]' : 'bg-amber-400/10 text-amber-400'
                        }`}>
                           {n.type === 'proof_verified' ? <ShieldCheck size={16} /> : <Activity size={16} />}
                        </div>
                        <div className="space-y-1">
                           <p className="text-[11px] font-bold text-gray-200 leading-relaxed">{n.message}</p>
                           <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">{new Date(n.created_at).toLocaleTimeString()}</p>
                        </div>
                     </div>
                   </Link>
                 ))
               )}
            </div>
            
            <div className="p-4 bg-black/40 text-center">
               <button onClick={() => setShow(false)} className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white">Close Hub</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
