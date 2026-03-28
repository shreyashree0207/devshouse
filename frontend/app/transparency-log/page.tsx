"use client";
import { ShieldAlert, Info, ArrowUpRight, Search } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function TransparencyLog() {
  const suspended = [
    { id: 1, name: 'Global Health Network', reason: 'Repeated non-delivery of verified proofs for critical milestones over 120 days.', date: 'Oct 02, 2025', status: 'SUSPENDED' },
    { id: 2, name: 'Unity Educational Trust', reason: 'High confidence match on repeated stock imagery in proof submissions.', date: 'Aug 14, 2025', status: 'SUSPENDED' },
    { id: 3, name: 'Save Water Action', reason: 'Community dispute threshold exceeded (>30% of verifications contested).', date: 'Jan 10, 2026', status: 'UNDER REVIEW' },
    { id: 4, name: 'Childrens Future', reason: 'Audit cleared after initial flag. Found compliant with local regulations.', date: 'Sep 22, 2025', status: 'REINSTATED' },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      
      {/* Top Banner */}
      <div className="w-full bg-red-600 border-b border-red-800 text-white text-center py-2 font-black uppercase tracking-[0.2em] text-[10px] fixed top-[60px] z-40">
         {"Sustainify believes in radical transparency. All enforcement actions are public."}
      </div>

      <div className="pt-36 pb-20 max-w-6xl mx-auto px-4">
         <div className="text-center mb-16">
            <h1 className="text-5xl font-extrabold font-jakarta tracking-tight inline-flex items-center gap-4">
              <ShieldAlert className="text-red-500" size={48} /> Platform Integrity Log
            </h1>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto leading-relaxed">
              We strictly enforce our transparency standards. Any NGO failing to provide authentic, verifiable proof of impact faces immediate suspension and public logging.
            </p>
         </div>

         <div className="relative max-w-md mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input type="text" placeholder="Search by NGO name..." className="w-full bg-[#161b22] border border-gray-800 rounded-full py-3 pl-10 pr-4 text-sm text-white focus:border-red-500 outline-none transition-colors" />
         </div>

         <div className="bg-[#161b22] border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-black/40 text-xs text-gray-500 uppercase tracking-widest">
                  <th className="p-6 font-black w-1/4">NGO Name</th>
                  <th className="p-6 font-black">Suspension Reason</th>
                  <th className="p-6 font-black w-32">Date</th>
                  <th className="p-6 font-black w-48">Status</th>
                  <th className="p-6 font-black w-32">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {suspended.map(s => (
                  <tr key={s.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                    <td className="p-6 font-bold">{s.name}</td>
                    <td className="p-6 text-gray-400 leading-relaxed pr-10">{s.reason}</td>
                    <td className="p-6 text-gray-500 font-medium">{s.date}</td>
                    <td className="p-6">
                      <span className={`inline-block px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${
                        s.status === 'SUSPENDED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        s.status === 'UNDER REVIEW' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        'bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <button className="flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-[#16a34a] hover:text-white transition-colors">
                        View Details <ArrowUpRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
