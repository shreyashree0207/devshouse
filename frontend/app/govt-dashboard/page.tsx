'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import GovtNGOCard from '@/components/GovtNGOCard'
import { AlertCircle, FileText, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react'

type NGO = {
  id: string
  name: string
  sector?: string
  category?: string
  city?: string
  created_at: string
  status: string
  transparency_score: number
  is_govt_verified: boolean
  verified: boolean
  darpan_id?: string
  blacklisted?: boolean
}

type MilestoneCounts = Record<string, { total: number; completed: number }>

export default function GovtDashboardPage() {
  const [pendingNgos, setPendingNgos] = useState<NGO[]>([])
  const [activeNgos, setActiveNgos] = useState<NGO[]>([])
  const [milestoneCounts, setMilestoneCounts] = useState<MilestoneCounts>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [{ data: pending }, { data: active }] = await Promise.all([
          supabase.from('ngos').select('*').eq('status', 'pending').order('created_at'),
          supabase.from('ngos').select('*').eq('status', 'approved').order('transparency_score', { ascending: false }),
        ])

        setPendingNgos(pending || [])
        setActiveNgos(active || [])

        const activeIds = (active || []).map((n: NGO) => n.id)
        if (activeIds.length > 0) {
          const { data: milestones } = await supabase
            .from('milestones')
            .select('ngo_id, status')
            .in('ngo_id', activeIds)

          const counts: MilestoneCounts = {}
          milestones?.forEach((m: { ngo_id: string; status: string }) => {
            if (!counts[m.ngo_id]) counts[m.ngo_id] = { total: 0, completed: 0 }
            counts[m.ngo_id].total += 1
            if (m.status === 'RELEASED') counts[m.ngo_id].completed += 1
          })
          setMilestoneCounts(counts)
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleVerify = async (ngoId: string) => {
    await supabase.from('ngos').update({ is_govt_verified: true }).eq('id', ngoId)
    setActiveNgos(prev =>
      prev.map(n => (n.id === ngoId ? { ...n, is_govt_verified: true } : n))
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 shadow-xl border-r border-slate-800">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
            <h1 className="font-bold text-white text-lg leading-tight uppercase tracking-wider">Govt Portal</h1>
          </div>

          <nav className="mt-4 px-3 space-y-1">
            <a href="#pending" className="flex items-center justify-between px-3 py-2.5 rounded hover:bg-slate-800 text-sm font-medium transition group">
              <span className="flex items-center text-white">
                <FileText className="w-4 h-4 mr-3 opacity-70 group-hover:opacity-100" /> Pending Apps
              </span>
              {pendingNgos.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingNgos.length}</span>
              )}
            </a>
            <a href="#active" className="flex items-center px-3 py-2.5 rounded hover:bg-slate-800 text-sm font-medium transition text-slate-300 group">
              <CheckCircle2 className="w-4 h-4 mr-3 opacity-70 group-hover:opacity-100" /> Active NGOs
            </a>
            <a href="#blacklist" className="flex items-center px-3 py-2.5 rounded hover:bg-slate-800 text-sm font-medium transition text-slate-300 group">
              <XCircle className="w-4 h-4 mr-3 opacity-70 group-hover:opacity-100" /> Blacklisted NGOs
            </a>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => supabase.auth.signOut().then(() => { window.location.href = '/' })}
            className="w-full text-left px-3 py-2 rounded hover:bg-slate-800 text-sm font-medium transition"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-7xl mx-auto p-8">

          {/* Pending Applications */}
          <section id="pending" className="mb-16">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-2 border-b flex items-center justify-between">
              Pending Applications
              <span className="text-sm font-medium bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                {pendingNgos.length} Pending
              </span>
            </h2>

            {pendingNgos.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed text-slate-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                No pending applications currently.
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b font-medium text-slate-700">
                    <tr>
                      <th className="px-6 py-4">NGO Name</th>
                      <th className="px-6 py-4">Sector</th>
                      <th className="px-6 py-4">City</th>
                      <th className="px-6 py-4">Submitted</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingNgos.map((ngo) => (
                      <tr key={ngo.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-semibold text-slate-800">{ngo.name}</td>
                        <td className="px-6 py-4">
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-semibold">
                            {ngo.sector || ngo.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">{ngo.city}</td>
                        <td className="px-6 py-4">{new Date(ngo.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-md text-sm font-medium transition">
                            Review →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Active NGOs */}
          <section id="active" className="mb-16">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-2 border-b">Active NGOs</h2>

            {activeNgos.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed text-slate-500">
                No active NGOs verified yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeNgos.map((ngo) => (
                  <GovtNGOCard
                    key={ngo.id}
                    ngo={ngo}
                    milestoneCount={milestoneCounts[ngo.id] || { total: 0, completed: 0 }}
                    onVerify={() => handleVerify(ngo.id)}
                  />
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  )
}