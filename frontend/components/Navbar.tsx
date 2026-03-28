"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentUser, signOut } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { LogOut, Compass, Leaf, MapPin, Building2, Users, Shield } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [ngoSession, setNgoSession] = useState<any>(null);
  const [govtSession, setGovtSession] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const init = async () => {
      const u = await getCurrentUser();
      setUser(u);
      setRole(u?.user_metadata?.role || null);
    };
    init();

    // Check hardcoded local sessions
    try {
      const ngo = localStorage.getItem('sustainify_ngo_session');
      const govt = localStorage.getItem('sustainify_govt_session');
      if (ngo) setNgoSession(JSON.parse(ngo));
      if (govt) setGovtSession(JSON.parse(govt));
    } catch {}

    const hs = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', hs);
    return () => window.removeEventListener('scroll', hs);
  }, [pathname]);

  const active = (p: string) => pathname.startsWith(p);
  const lc = (p: string, green = true) =>
    `flex items-center gap-1.5 transition-colors font-medium text-sm ${active(p)
      ? green ? 'text-[#00ff88]' : 'text-blue-300'
      : 'text-gray-400 hover:' + (green ? 'text-[#00ff88]' : 'text-blue-300')
    }`;

  const isGovPage = pathname.startsWith('/gov');

  const handleNgoSignout = () => {
    localStorage.removeItem('sustainify_ngo_session');
    window.location.href = '/ngo-login';
  };
  const handleGovSignout = () => {
    localStorage.removeItem('sustainify_govt_session');
    window.location.href = '/gov-login';
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled
      ? isGovPage
        ? 'bg-[#060b17]/95 backdrop-blur-xl border-b border-blue-500/10 py-3'
        : 'bg-[#0a0f0a]/90 backdrop-blur-xl border-b border-white/[0.06] py-3'
      : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-[#00ff88] p-1.5 rounded-lg shadow-[0_0_15px_rgba(0,255,136,0.4)]">
              <Leaf className="text-[#0a0f0a]" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Sustainify</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Public: no session at all */}
            {!ngoSession && !govtSession && !role && (
              <>
                <Link href="/ngos" className={lc('/ngos')}><Compass size={15} /><span className="hidden sm:inline">For Donors</span></Link>
                <Link href="/ngo-login" className={lc('/ngo-login')}><Building2 size={15} /><span className="hidden sm:inline">For NGOs</span></Link>
                <Link href="/gov-login" className={lc('/gov-login', false)}><Shield size={15} /><span className="hidden sm:inline">For Government</span></Link>
              </>
            )}

            {/* Donor OAuth */}
            {role === 'donor' && (
              <>
                <Link href="/ngos" className={lc('/ngos')}><Compass size={15} /> Explore NGOs</Link>
                <Link href="/explore-map" className={lc('/explore-map')}><MapPin size={15} /> Map</Link>
                <Link href="/community" className={lc('/community')}><Users size={15} /> Feed</Link>
                <Link href="/dashboard" className={lc('/dashboard')}>Dashboard</Link>
              </>
            )}

            {/* NGO OAuth (no local session) */}
            {role === 'ngo' && !ngoSession && (
              <>
                <Link href="/ngo-dashboard" className={lc('/ngo-dashboard')}><Building2 size={15} /> My NGO</Link>
                <Link href="/community" className={lc('/community')}><Users size={15} /> Feed</Link>
              </>
            )}

            {/* NGO local session */}
            {ngoSession && (
              <>
                <Link href="/ngo-dashboard" className={lc('/ngo-dashboard')}><Building2 size={15} /> NGO Dashboard</Link>
                <button onClick={handleNgoSignout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-400 transition-colors">
                  <LogOut size={15} /> Sign Out
                </button>
              </>
            )}

            {/* Govt local session */}
            {govtSession && (
              <>
                <Link href="/gov-dashboard" className={lc('/gov-dashboard', false)}><Shield size={15} /> Gov Dashboard</Link>
                <button onClick={handleGovSignout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-400 transition-colors">
                  <LogOut size={15} /> Sign Out
                </button>
              </>
            )}

            {/* OAuth avatar */}
            {user && !ngoSession && !govtSession && (
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <NotificationBell />
                <img
                  src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || 'U')}&background=00ff88&color=0a0f0a&bold=true`}
                  alt="" className="w-8 h-8 rounded-full border border-white/10"
                />
                <button onClick={() => signOut()} className="p-2 text-gray-500 hover:text-red-400 transition-colors" title="Sign Out">
                  <LogOut size={17} />
                </button>
              </div>
            )}

            {/* Not logged in at all */}
            {!user && !ngoSession && !govtSession && (
              <Link href="/login" className="ml-2 bg-[#00ff88] text-[#0a0f0a] px-5 py-2 rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
