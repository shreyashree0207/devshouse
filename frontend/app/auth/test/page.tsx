"use client";

import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { ShieldCheck, UserPlus, LogIn, Server, Loader2, CheckCircle, XCircle, Copy, ArrowRight } from 'lucide-react';

export default function AuthTest() {
  const [email, setEmail] = useState("khyati@test.com");
  const [password, setPassword] = useState("123456");
  const [logs, setLogs] = useState<{ type: 'info' | 'success' | 'error'; msg: string }[]>([]);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState("");
  const [backendUrl, setBackendUrl] = useState("http://127.0.0.1:8000");

  const log = (type: 'info' | 'success' | 'error', msg: string) => {
    setLogs(prev => [...prev, { type, msg }]);
  };

  // ─── STEP 1: SIGNUP ───
  const handleSignup = async () => {
    setLoading("signup");
    log('info', `📝 Signing up with email: ${email}`);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      log('error', `❌ Signup failed: ${error.message}`);
    } else {
      log('success', `✅ User created! ID: ${data.user?.id}`);
      log('info', `📧 Email: ${data.user?.email}`);
      log('info', `🔑 Check Supabase Dashboard → Authentication → Users to verify`);
    }
    setLoading("");
  };

  // ─── STEP 2: LOGIN ───
  const handleLogin = async () => {
    setLoading("login");
    log('info', `🔑 Logging in with email: ${email}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      log('error', `❌ Login failed: ${error.message}`);
    } else {
      const accessToken = data.session?.access_token || "";
      setToken(accessToken);
      log('success', `✅ Login successful!`);
      log('info', `👤 User ID: ${data.user?.id}`);
      log('info', `📧 Email: ${data.user?.email}`);
      log('success', `🔐 Access Token received (${accessToken.length} chars)`);
      log('info', `🎯 Token saved — ready for backend API calls`);
    }
    setLoading("");
  };

  // ─── STEP 3: TEST BACKEND /me ───
  const testBackendMe = async () => {
    if (!token) { log('error', '❌ No token! Login first.'); return; }
    setLoading("me");
    log('info', `🌐 Calling ${backendUrl}/me with Bearer token...`);

    try {
      const res = await fetch(`${backendUrl}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        log('success', `✅ Backend verified! ${JSON.stringify(data, null, 2)}`);
      } else {
        log('error', `❌ Backend error: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      log('error', `❌ Connection failed: ${err.message}. Is the backend running?`);
    }
    setLoading("");
  };

  // ─── STEP 4: TEST BACKEND /ngos ───
  const testBackendNgos = async () => {
    if (!token) { log('error', '❌ No token! Login first.'); return; }
    setLoading("ngos");
    log('info', `🌐 Calling ${backendUrl}/ngos with Bearer token...`);

    try {
      const res = await fetch(`${backendUrl}/ngos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        log('success', `✅ Got ${Array.isArray(data) ? data.length : 0} NGOs from backend!`);
        if (Array.isArray(data) && data.length > 0) {
          data.slice(0, 3).forEach((ngo: any) => {
            log('info', `  🏢 ${ngo.name} — ${ngo.city} | ₹${ngo.raised_amount || ngo.raised} raised`);
          });
        }
      } else {
        log('error', `❌ Backend error: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      log('error', `❌ Connection failed: ${err.message}`);
    }
    setLoading("");
  };

  // ─── STEP 5: TEST DONATION ───
  const testDonate = async () => {
    if (!token) { log('error', '❌ No token! Login first.'); return; }
    setLoading("donate");
    log('info', `💰 Sending test donation of ₹500 to ngo_id=1...`);

    try {
      const res = await fetch(`${backendUrl}/donate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ngo_id: "1", amount: 500, name: "Test Donor" })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        log('success', `✅ Donation recorded! ${data.message}`);
        log('info', `  👤 User: ${data.donor_email} | ID: ${data.user_id}`);
      } else {
        log('error', `❌ Donation failed: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      log('error', `❌ Connection failed: ${err.message}`);
    }
    setLoading("");
  };

  // ─── STEP 6: TEST MY DONATIONS ───
  const testMyDonations = async () => {
    if (!token) { log('error', '❌ No token! Login first.'); return; }
    setLoading("mydonations");
    log('info', `📋 Fetching my donations...`);

    try {
      const res = await fetch(`${backendUrl}/my-donations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        log('success', `✅ Found ${Array.isArray(data) ? data.length : 0} donations`);
        if (Array.isArray(data)) {
          data.forEach((d: any) => {
            log('info', `  💸 ₹${d.amount} to NGO ${d.ngo_id} by ${d.donor_name || d.donor_email}`);
          });
        }
      } else {
        log('error', `❌ Error: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      log('error', `❌ Connection failed: ${err.message}`);
    }
    setLoading("");
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8 bg-[#0d1117]">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">
            <ShieldCheck size={14} /> Developer Auth Testing Console
          </div>
          <h1 className="text-5xl font-extrabold font-jakarta text-white tracking-tighter">
            Supabase Auth <span className="text-[#16a34a]">Test Flow</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Step-by-step test: Signup → Login → Get Token → Hit Backend APIs → Verify Identity
          </p>
        </div>

        {/* Config Bar */}
        <div className="card p-6 flex flex-col md:flex-row gap-6 border-gray-800">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-gray-800 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-[#16a34a] transition-colors" />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full bg-black/40 border border-gray-800 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-[#16a34a] transition-colors" />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Backend URL</label>
            <input value={backendUrl} onChange={e => setBackendUrl(e.target.value)} className="w-full bg-black/40 border border-gray-800 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-[#16a34a] transition-colors" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "1. Signup", fn: handleSignup, key: "signup", icon: UserPlus, color: "blue" },
            { label: "2. Login", fn: handleLogin, key: "login", icon: LogIn, color: "green" },
            { label: "3. /me", fn: testBackendMe, key: "me", icon: ShieldCheck, color: "purple" },
            { label: "4. /ngos", fn: testBackendNgos, key: "ngos", icon: Server, color: "orange" },
            { label: "5. Donate", fn: testDonate, key: "donate", icon: ArrowRight, color: "pink" },
            { label: "6. My Donations", fn: testMyDonations, key: "mydonations", icon: Copy, color: "cyan" },
          ].map(btn => (
            <button
              key={btn.key}
              onClick={btn.fn}
              disabled={loading === btn.key}
              className={`card p-4 text-center border-gray-800 hover:border-[#16a34a]/30 transition-all group cursor-pointer ${loading === btn.key ? 'opacity-50' : ''}`}
            >
              {loading === btn.key 
                ? <Loader2 className="animate-spin text-[#16a34a] mx-auto mb-2" size={24} />
                : <btn.icon className="text-[#16a34a] mx-auto mb-2 group-hover:scale-110 transition-transform" size={24} />
              }
              <p className="text-xs font-bold text-white">{btn.label}</p>
            </button>
          ))}
        </div>

        {/* Token Display */}
        {token && (
          <div className="card p-6 border-[#16a34a]/30 bg-[#16a34a]/5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-[#16a34a] uppercase tracking-widest">🔐 Access Token (JWT)</span>
              <button 
                onClick={() => { navigator.clipboard.writeText(token); log('success', '📋 Token copied!'); }}
                className="text-xs text-[#16a34a] hover:underline flex items-center gap-1"
              >
                <Copy size={14} /> Copy
              </button>
            </div>
            <p className="text-xs text-gray-400 font-mono break-all bg-black/30 p-4 rounded-lg border border-gray-800 max-h-24 overflow-y-auto">
              {token}
            </p>
          </div>
        )}

        {/* Console Log */}
        <div className="card border-gray-800 overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-black/40">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Console Output</span>
            <button onClick={() => setLogs([])} className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-widest">Clear</button>
          </div>
          <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto bg-[#0a0e14] font-mono text-sm">
            {logs.length === 0 && (
              <p className="text-gray-700 italic">Click the buttons above to start testing...</p>
            )}
            {logs.map((l, i) => (
              <div key={i} className={`flex items-start gap-2 ${
                l.type === 'success' ? 'text-green-400' : 
                l.type === 'error' ? 'text-red-400' : 
                'text-gray-400'
              }`}>
                {l.type === 'success' ? <CheckCircle size={14} className="mt-0.5 shrink-0" /> : 
                 l.type === 'error' ? <XCircle size={14} className="mt-0.5 shrink-0" /> : 
                 <span className="text-gray-600 shrink-0">›</span>}
                <pre className="whitespace-pre-wrap break-all">{l.msg}</pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
