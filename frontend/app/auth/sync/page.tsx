"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { motion } from 'framer-motion';

export default function AuthSyncPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Syncing your account...');

  useEffect(() => {
    const syncUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }

        const role = localStorage.getItem('sustainify_role') || 'donor';
        const name = localStorage.getItem('sustainify_name') || user.user_metadata?.full_name || '';
        const ngoType = localStorage.getItem('sustainify_ngo_type') || 'existing';

        // ── GOVERNMENT FLOW ───────────────────────────────────
        if (role === 'govt') {
          setStatus('Verifying government credentials...');
          const email = user.email || '';

          if (!email.endsWith('@tn.gov.in')) {
            // Hard reject — sign out and redirect with error
            await supabase.auth.signOut();
            ['sustainify_role', 'sustainify_name', 'sustainify_ngo_type'].forEach(k => localStorage.removeItem(k));
            router.push('/login?error=invalid_govt_email');
            return;
          }

          // Update user metadata
          await supabase.auth.updateUser({
            data: { role: 'govt', full_name: name }
          });

          // Upsert govt_officials record
          const { data: existing } = await supabase
            .from('govt_officials')
            .select('id')
            .eq('email', email)
            .single();

          if (!existing) {
            await supabase.from('govt_officials').insert({
              name: user.user_metadata?.full_name || name,
              email,
              department: 'Social Welfare Department',
              state: 'Tamil Nadu',
              user_id: user.id,
            });
          }

          ['sustainify_role', 'sustainify_name', 'sustainify_ngo_type'].forEach(k => localStorage.removeItem(k));
          setStatus('Government access granted! Redirecting...');
          setTimeout(() => router.push('/govt-dashboard'), 800);
          return;
        }

        // ── NGO FLOW ──────────────────────────────────────────
        if (role === 'ngo') {
          setStatus('Setting up your NGO account...');

          if (ngoType === 'new') {
            // New NGO — no Darpan yet, send to registration
            await supabase.auth.updateUser({
              data: { role: 'ngo', full_name: name, ngo_type: 'new' }
            });
            ['sustainify_role', 'sustainify_name', 'sustainify_ngo_type'].forEach(k => localStorage.removeItem(k));
            setStatus('Redirecting to NGO registration...');
            setTimeout(() => router.push('/ngo-register'), 800);
            return;
          }

          // Existing NGO with Darpan ID
          const darpanId = localStorage.getItem('sustainify_darpan') || '';
          const ngoId = localStorage.getItem('sustainify_ngo_id') || '';
          const ngoName = localStorage.getItem('sustainify_ngo_name') || '';

          await supabase.auth.updateUser({
            data: { role: 'ngo', full_name: name, darpan_id: darpanId, ngo_id: ngoId || null, ngo_name: ngoName }
          });

          // Check if ngo_accounts record already exists
          const { data: existingAccount } = await supabase
            .from('ngo_accounts')
            .select('id, verified, status')
            .eq('user_id', user.id)
            .single();

          if (!existingAccount) {
            await supabase.from('ngo_accounts').insert({
              user_id: user.id,
              darpan_id: darpanId,
              ngo_id: ngoId || null,
              verified: !!ngoId,
              status: ngoId ? 'approved' : 'pending',
            });
          }

          ['sustainify_role', 'sustainify_darpan', 'sustainify_ngo_id', 'sustainify_name', 'sustainify_ngo_name', 'sustainify_ngo_type'].forEach(k => localStorage.removeItem(k));

          if (ngoId) {
            setStatus('NGO verified! Redirecting to dashboard...');
            setTimeout(() => router.push('/ngo-dashboard'), 800);
          } else if (existingAccount?.verified) {
            setTimeout(() => router.push('/ngo-dashboard'), 800);
          } else {
            setStatus('Registration submitted for review...');
            setTimeout(() => router.push('/ngo-pending'), 800);
          }
          return;
        }

        // ── DONOR FLOW ────────────────────────────────────────
        await supabase.auth.updateUser({ data: { role: 'donor', full_name: name } });
        ['sustainify_role', 'sustainify_name', 'sustainify_ngo_type'].forEach(k => localStorage.removeItem(k));
        setStatus('Welcome aboard! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 800);

      } catch (err) {
        console.error('Sync error:', err);
        setTimeout(() => router.push('/'), 1500);
      }
    };
    syncUser();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f0a]">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto border-4 border-[#00ff88]/20 border-t-[#00ff88] rounded-full" />
        <p className="text-[#00ff88] font-bold text-lg">{status}</p>
        <p className="text-gray-600 text-xs uppercase tracking-widest">Securing your session...</p>
      </motion.div>
    </div>
  );
}
