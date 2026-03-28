"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentUser, signOut } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { LogOut, Compass, Leaf, MapPin, Building2, Upload, Users } from 'lucide-react';

import NotificationBell from './NotificationBell';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const u = await getCurrentUser();
      setUser(u);
      setRole(u?.user_metadata?.role || null);
    };
    fetch();
    const hs = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', hs);
    return () => window.removeEventListener('scroll', hs);
  }, [pathname]);

  const active = (p: string) => pathname === p;
  const lc = (p: string) => `flex items-center gap-2 hover:text-[#00ff88] transition-colors font-medium text-sm ${active(p) ? 'text-[#00ff88]' : 'text-gray-300'}`;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0f0a]/90 backdrop-blur-xl border-b border-white/[0.06] py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-[#00ff88] p-1.5 rounded-lg shadow-[0_0_15px_rgba(0,255,136,0.4)]">
              <Leaf className="text-[#0a0f0a]" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Sustainify</span>
          </Link>

          <div className="flex items-center gap-5">
            {/* No session or donor */}
             {(!role || role === 'donor') && (
               <>
                 <Link href="/ngos" className={lc('/ngos')}><Compass size={17} /> <span className="hidden sm:inline">Explore NGOs</span></Link>
                 <Link href="/explore-map" className={lc('/explore-map')}><MapPin size={17} /> <span className="hidden sm:inline">Map</span></Link>
                 <Link href="/community" className={lc('/community')}><Users size={17} /> <span className="hidden sm:inline">Feed</span></Link>
                 {role === 'donor' && (
                   <Link href="/dashboard" className={lc('/dashboard')}>Dashboard</Link>
                 )}
               </>
             )}

            {/* NGO role */}
             {role === 'ngo' && (
               <>
                 <Link href="/ngo-dashboard" className={lc('/ngo-dashboard')}><Building2 size={17} /> My NGO</Link>
                 <Link href="/explore-map" className={lc('/explore-map')}><MapPin size={17} /> Map</Link>
                 <Link href="/community" className={lc('/community')}><Users size={17} /> Feed</Link>
               </>
             )}

            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <NotificationBell />
                <img src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || 'U')}&background=00ff88&color=0a0f0a&bold=true`}
                  alt="" className="w-8 h-8 rounded-full border border-white/10" />
                <button onClick={() => signOut()} className="p-2 text-gray-500 hover:text-red-400 transition-colors" title="Sign Out">
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-[#00ff88] text-[#0a0f0a] px-5 py-2 rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
