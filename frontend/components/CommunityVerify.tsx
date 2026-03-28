'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Users, CheckCircle, MessageSquare } from 'lucide-react'

interface CommunityVerifyProps {
  proofUpdate: any
  ngoId: string
  currentUser: any
}

export default function CommunityVerify({ proofUpdate, ngoId, currentUser }: CommunityVerifyProps) {
  const [count, setCount] = useState(0)
  const [hasVerified, setHasVerified] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    setLoading(true)
    
    // Get total count
    const { count: total, error: countErr } = await supabase
      .from('community_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('proof_update_id', proofUpdate.id)
      
    if (!countErr && total !== null) setCount(total)

    // Check if current user has verified
    if (currentUser?.email) {
      const { data, error } = await supabase
        .from('community_verifications')
        .select('id')
        .eq('proof_update_id', proofUpdate.id)
        .eq('verifier_email', currentUser.email)
        .single()
        
      if (data && !error) setHasVerified(true)
    }
    
    setLoading(false)
  }

  const handleVerify = async () => {
    if (!currentUser) return
    setSubmitting(true)
    
    try {
      // Create verification
      const { error } = await supabase.from('community_verifications').insert({
        proof_update_id: proofUpdate.id,
        ngo_id: ngoId,
        verifier_name: currentUser.user_metadata?.full_name || currentUser.email.split('@')[0],
        verifier_email: currentUser.email,
        attended_event: true,
        comment: comment || null
      })
      
      if (error) throw error
      
      setHasVerified(true)
      setCount(prev => prev + 1)
      setShowForm(false)
      
      // We don't worry about modifying transparency score synchronously 
      // but the backend will handle that or next reload will pick it up
      
    } catch (e) {
      console.error(e)
      alert("Failed to submit verification")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="animate-pulse h-10 bg-slate-100 rounded my-4"></div>

  return (
    <div className="bg-slate-50 p-4 border rounded-xl mt-4 space-y-3 shadow-sm border-slate-200">
      <div className="flex items-center text-slate-700 font-medium pb-2 border-b border-slate-200">
        <Users className="w-5 h-5 mr-2 text-indigo-500" /> 
        {count} people confirmed this event
      </div>
      
      {!currentUser ? (
        <p className="text-sm text-slate-500 italic mt-2">Login as a donor to verify you attended this event.</p>
      ) : hasVerified ? (
        <div className="flex items-center text-green-700 bg-green-50 px-3 py-2 border border-green-200 rounded-lg text-sm font-semibold mt-2 shadow-sm">
          <CheckCircle className="w-4 h-4 mr-2" /> You verified this
        </div>
      ) : showForm ? (
        <div className="mt-4 bg-white p-3 rounded-xl border shadow-sm">
          <div className="relative mb-3">
            <MessageSquare className="absolute top-3 pl-3 w-8 h-8 text-slate-400 opacity-60 pointer-events-none" />
            <textarea
              className="w-full text-sm border-0 bg-slate-50 focus:bg-white rounded-lg p-3 pl-10 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="I attended on 15th March, saw 200 students..."
              value={comment}
              rows={2}
              onChange={e => setComment(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="text-slate-500 hover:text-slate-700 text-sm font-medium px-4 py-2 border rounded-lg bg-white"
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-wait text-white text-sm font-medium px-4 py-2 rounded-lg flex-1 shadow transition"
            >
              {submitting ? 'Confirming...' : 'Confirm I was there'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-2 w-full border-2 border-indigo-600 border-dashed text-indigo-700 hover:bg-indigo-50 bg-white font-semibold flex items-center justify-center py-2 px-4 rounded-lg transition"
        >
          <CheckCircle className="w-4 h-4 mr-2" /> I attended this event
        </button>
      )}
    </div>
  )
}
