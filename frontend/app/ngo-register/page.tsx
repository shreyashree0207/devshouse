"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, getCurrentUser } from '../../lib/supabase';
import { CheckCircle2, Upload, FileText, Loader2, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

const SECTORS = ['Education', 'Healthcare', 'Environment', 'Women Empowerment', 'Food & Nutrition', 'Child Welfare'];
const TN_DISTRICTS = [
  'Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tirunelveli','Tiruppur',
  'Erode','Vellore','Thoothukudi','Thanjavur','Dindigul','Cuddalore','Kancheepuram',
  'Namakkal','Virudhunagar','Nagapattinam','Ramanathapuram','Dharmapuri','Krishnagiri',
  'Perambalur','Ariyalur','Pudukkottai','Sivaganga','Theni','Nilgiris','Tiruvannamalai',
  'Villupuram','Kallakurichi','Ranipet','Tirupattur','Chengalpattu','Tenkasi','Mayiladuthurai'
];

const STEPS = ['Organisation Details', 'Supporting Documents', 'Review & Submit'];

// ── Step indicator ──────────────────────────────────────
function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      {STEPS.map((s, i) => (
        <div key={i} className="flex items-center gap-3 flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
            i < current ? 'bg-[#00ff88] text-black' :
            i === current ? 'bg-purple-500 text-white ring-4 ring-purple-500/20' :
            'bg-white/[0.05] text-gray-600'
          }`}>
            {i < current ? <CheckCircle2 size={14}/> : i + 1}
          </div>
          <span className={`text-xs font-black uppercase tracking-widest hidden sm:block transition-all ${
            i === current ? 'text-white' : i < current ? 'text-[#00ff88]' : 'text-gray-600'
          }`}>{s}</span>
          {i < STEPS.length - 1 && <div className={`flex-1 h-[2px] rounded-full transition-all ${i < current ? 'bg-[#00ff88]' : 'bg-white/[0.06]'}`} />}
        </div>
      ))}
    </div>
  );
}

// ── Field ────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] text-gray-500 uppercase tracking-widest font-black block pl-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-black/40 border border-white/[0.08] rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-purple-400/40 transition-all placeholder-gray-600";

// ── Main ─────────────────────────────────────────────────
export default function NgoRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Step 1
  const [form, setForm] = useState({
    name: '', founderName: '', category: 'Education',
    foundedYear: '', city: '', district: 'Chennai',
    description: '', contactEmail: '',
  });

  // Step 2 — document uploads
  const [docs, setDocs] = useState<{
    regCert: File | null; addressProof: File | null; founderID: File | null;
  }>({ regCert: null, addressProof: null, founderID: null });
  const [docStatus, setDocStatus] = useState<Record<string, 'idle'|'uploading'|'done'>>({
    regCert: 'idle', addressProof: 'idle', founderID: 'idle',
  });

  // Step 3
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const init = async () => {
      const u = await getCurrentUser();
      if (!u) { router.push('/login'); return; }
      if (u.user_metadata?.role !== 'ngo') { router.push('/login'); return; }
      setUser(u);
      setForm(p => ({ ...p, contactEmail: u.email || '' }));
    };
    init();
  }, [router]);

  const updateForm = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const uploadDoc = async (key: keyof typeof docs, file: File) => {
    if (!user) return;
    setDocStatus(p => ({ ...p, [key]: 'uploading' }));
    const path = `${user.id}/${key}_${Date.now()}_${file.name}`;
    await supabase.storage.from('ngo-documents').upload(path, file, { upsert: true });
    setDocs(p => ({ ...p, [key]: file }));
    setDocStatus(p => ({ ...p, [key]: 'done' }));
  };

  const canProceedStep1 = form.name && form.founderName && form.city && form.district && form.description.length >= 50 && form.contactEmail;
  const canProceedStep2 = docs.regCert && docs.addressProof && docs.founderID;

  const handleSubmit = async () => {
    if (!agreed || !user) return;
    setSubmitting(true);

    // Insert NGO
    const { data: ngoData } = await supabase.from('ngos').insert({
      name: form.name,
      description: form.description,
      city: form.city,
      district: form.district,
      state: 'Tamil Nadu',
      category: form.category,
      sector: form.category,
      goal_amount: 0,
      raised_amount: 0,
      donor_count: 0,
      beneficiaries: 0,
      transparency_score: 0,
      contact_email: form.contactEmail,
      verified: false,
      status: 'pending',
      is_new: true,
      has_darpan: false,
      created_at: new Date().toISOString(),
    }).select().single();

    if (ngoData) {
      // Insert ngo_accounts
      await supabase.from('ngo_accounts').insert({
        user_id: user.id,
        ngo_id: ngoData.id,
        verified: false,
        status: 'pending',
      });

      // Update user metadata with ngo_id
      await supabase.auth.updateUser({ data: { ngo_id: ngoData.id, ngo_name: ngoData.name } });
    }

    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => router.push('/ngo-pending'), 2500);
  };

  // ── Submitted state ──────────────────────────────────
  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f0a] px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 max-w-md">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
          className="w-24 h-24 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={48} className="text-purple-400" />
        </motion.div>
        <h2 className="text-3xl font-black text-white">Application Submitted!</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Your application has been submitted. The government will review and assign your Darpan ID within <strong className="text-purple-400">5-7 working days</strong>.
        </p>
        <div className="w-8 h-1 bg-purple-500/30 rounded-full mx-auto animate-pulse" />
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-400">New NGO Registration</span>
          </motion.div>
          <h1 className="text-4xl font-black tracking-tight">Register Your NGO</h1>
          <p className="text-gray-500 text-sm">Complete the 3-step process. A government official will review your application.</p>
        </div>

        <StepBar current={step} />

        <AnimatePresence mode="wait">
          {/* ── STEP 1 ─────────────────────────────────── */}
          {step === 0 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="space-y-6 p-8 bg-white/[0.03] border border-white/[0.06] rounded-[2rem]">
              <h2 className="text-xl font-black">Organisation Details</h2>
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="NGO Name *">
                  <input className={inputCls} value={form.name} onChange={e => updateForm('name', e.target.value)} placeholder="Full legal name of NGO" />
                </Field>
                <Field label="Founder / Authorised Person *">
                  <input className={inputCls} value={form.founderName} onChange={e => updateForm('founderName', e.target.value)} placeholder="Name of authorised rep" />
                </Field>
                <Field label="Category / Sector *">
                  <select className={inputCls} value={form.category} onChange={e => updateForm('category', e.target.value)}>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Founded Year">
                  <input type="number" className={inputCls} value={form.foundedYear} onChange={e => updateForm('foundedYear', e.target.value)} placeholder="e.g. 2015" min="1900" max="2025" />
                </Field>
                <Field label="City *">
                  <input className={inputCls} value={form.city} onChange={e => updateForm('city', e.target.value)} placeholder="City of operation" />
                </Field>
                <Field label="District *">
                  <select className={inputCls} value={form.district} onChange={e => updateForm('district', e.target.value)}>
                    {TN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Contact Email *">
                  <input type="email" className={inputCls} value={form.contactEmail} onChange={e => updateForm('contactEmail', e.target.value)} />
                </Field>
              </div>
              <Field label={`Description * (min 50 chars — ${form.description.length}/50)`}>
                <textarea rows={4} className={inputCls + ' resize-none'} value={form.description} onChange={e => updateForm('description', e.target.value)}
                  placeholder="Describe your NGO's mission, impact, and what you do..." />
              </Field>
              <button onClick={() => setStep(1)} disabled={!canProceedStep1}
                className="w-full py-5 rounded-2xl bg-purple-600 text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-purple-500 transition-all">
                Next: Upload Documents <ChevronRight size={18}/>
              </button>
            </motion.div>
          )}

          {/* ── STEP 2 ─────────────────────────────────── */}
          {step === 1 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="space-y-6 p-8 bg-white/[0.03] border border-white/[0.06] rounded-[2rem]">
              <h2 className="text-xl font-black">Supporting Documents</h2>
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-xs text-amber-300 leading-relaxed">
                📋 Documents are reviewed by the Tamil Nadu Social Welfare Department. All uploads are stored securely (private bucket — government access only).
              </div>

              {([
                { key: 'regCert' as const, label: 'Registration Certificate', hint: 'PDF or image of your legal registration document' },
                { key: 'addressProof' as const, label: 'Address Proof', hint: 'Utility bill, lease agreement, or official letter' },
                { key: 'founderID' as const, label: 'Founder ID Proof', hint: 'Aadhar, Passport, or Driving Licence' },
              ]).map(doc => (
                <div key={doc.key} className="p-6 bg-black/30 border border-white/[0.06] rounded-2xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-black text-sm text-white">{doc.label}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{doc.hint}</p>
                    </div>
                    {docStatus[doc.key] === 'done' && (
                      <div className="flex items-center gap-1.5 text-[#00ff88] text-xs font-bold">
                        <CheckCircle2 size={14}/> {docs[doc.key]?.name}
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer block">
                    <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="sr-only"
                      onChange={e => { const f = e.target.files?.[0]; if (f) uploadDoc(doc.key, f); }} />
                    <div className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-sm font-bold transition-all ${
                      docStatus[doc.key] === 'done' ? 'border-[#00ff88]/30 text-[#00ff88] bg-[#00ff88]/5' :
                      docStatus[doc.key] === 'uploading' ? 'border-purple-500/30 text-purple-400' :
                      'border-white/10 text-gray-500 hover:border-purple-400/30 hover:text-purple-300'
                    }`}>
                      {docStatus[doc.key] === 'uploading' ? <><Loader2 size={16} className="animate-spin"/> Uploading...</> :
                       docStatus[doc.key] === 'done' ? <><CheckCircle2 size={16}/> Uploaded ✓</> :
                       <><Upload size={16}/> Choose File</>}
                    </div>
                  </label>
                </div>
              ))}

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="px-6 py-4 rounded-2xl bg-white/5 text-gray-400 font-bold text-sm hover:text-white transition-all">← Back</button>
                <button onClick={() => setStep(2)} disabled={!canProceedStep2}
                  className="flex-1 py-4 rounded-2xl bg-purple-600 text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-purple-500 transition-all">
                  Next: Review <ChevronRight size={18}/>
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3 ─────────────────────────────────── */}
          {step === 2 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="space-y-6 p-8 bg-white/[0.03] border border-white/[0.06] rounded-[2rem]">
              <h2 className="text-xl font-black">Review & Submit</h2>

              <div className="space-y-3">
                {[
                  ['NGO Name', form.name], ['Founder', form.founderName],
                  ['Category', form.category], ['City', form.city],
                  ['District', form.district], ['Contact Email', form.contactEmail],
                  ['Founded Year', form.foundedYear || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-3 border-b border-white/[0.05]">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">{k}</span>
                    <span className="text-sm text-white font-bold">{v}</span>
                  </div>
                ))}
                <div className="py-3">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black block mb-2">Description</span>
                  <p className="text-sm text-gray-300 leading-relaxed">{form.description}</p>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <FileText size={14} className="text-[#00ff88]" />
                  <span className="text-xs text-gray-400">{Object.values(docs).filter(Boolean).length} documents uploaded</span>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl">
                <div onClick={() => setAgreed(!agreed)} className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${agreed ? 'bg-purple-500 border-purple-500' : 'border-white/20'}`}>
                  {agreed && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <span className="text-xs text-gray-400 leading-relaxed">
                  I certify that all information provided is accurate and complete. I understand that false information may result in permanent disqualification.
                </span>
              </label>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-6 py-4 rounded-2xl bg-white/5 text-gray-400 font-bold text-sm hover:text-white transition-all">← Back</button>
                <motion.button onClick={handleSubmit} disabled={!agreed || submitting}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="flex-1 py-5 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-700 text-white font-black text-sm flex items-center justify-center gap-3 disabled:opacity-40 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                  {submitting ? <><Loader2 size={18} className="animate-spin"/> Submitting...</> : '🚀 Submit for Government Review'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
