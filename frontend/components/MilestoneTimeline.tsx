'use client'

import { useState } from 'react'
import { Calendar, CheckCircle2, CircleDashed, Lock, Clock, FileWarning } from 'lucide-react'
import ProofUploadModal from './ProofUploadModal'

interface Milestone {
  id: string
  title: string
  description: string
  amount_locked: number
  status: 'LOCKED' | 'UNLOCKED' | 'RELEASED'
  required_proof: string
  target_date: string
  proof_updates?: any[]
}

interface MilestoneTimelineProps {
  milestones: Milestone[]
  ngoId: string
  ngo: any
}

export default function MilestoneTimeline({ milestones, ngoId, ngo }: MilestoneTimelineProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)

  const completed = milestones.filter(m => m.status === 'RELEASED').length
  const total = milestones.length
  
  const allReleased = completed === total && total > 0

  return (
    <div className="max-w-3xl mx-auto py-8">
      {allReleased && ngo.is_govt_verified ? (
        <div className="bg-green-100 text-green-800 border border-green-300 p-4 rounded-xl flex items-center shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-2 bg-green-500 rounded-l-xl" />
          <CheckCircle2 className="w-8 h-8 mr-4 text-green-600" />
          <div>
            <h2 className="text-xl font-bold tracking-tight">Government Verified Organisation ✓</h2>
            <p className="text-sm opacity-90 font-medium">This NGO has satisfied all government transparency milestones.</p>
          </div>
        </div>
      ) : allReleased ? (
        <div className="bg-amber-100 text-amber-800 border border-amber-300 p-4 rounded-xl flex items-center shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-2 bg-amber-500 rounded-l-xl" />
          <CircleDashed className="w-8 h-8 mr-4 text-amber-600" />
          <div>
            <h2 className="text-xl font-bold tracking-tight">All milestones completed!</h2>
            <p className="text-sm opacity-90 font-medium">Awaiting final government verification and status update.</p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl flex flex-col mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-slate-800 tracking-tight">Milestone Progress</h2>
            <span className="bg-white border rounded-full px-3 py-1 text-sm font-bold text-slate-700 shadow-sm">{completed} of {total} completed</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden border border-slate-300 shadow-inner">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-1000 ease-out relative" 
              style={{ width: `${total ? (completed/total)*100 : 0}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
        {milestones.map((milestone, idx) => {
          const isLocked = milestone.status === 'LOCKED'
          const isUnlocked = milestone.status === 'UNLOCKED'
          const isReleased = milestone.status === 'RELEASED'

          return (
            <div key={milestone.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors duration-300
                ${isReleased ? 'bg-green-500 text-white shadow-green-200' : isUnlocked ? 'bg-amber-400 text-white shadow-amber-100' : ''}
              `}>
                {isReleased ? <CheckCircle2 className="w-5 h-5" /> : isUnlocked ? <Clock className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border shadow-sm bg-white transition hover:shadow-md relative overflow-hidden group">
                <div className={`absolute left-0 inset-y-0 w-1 ${isReleased ? 'bg-green-500' : isUnlocked ? 'bg-amber-400' : 'bg-red-500'}`} />
                
                <div className="flex justify-between items-start mb-2 pt-1 pl-2">
                  <span className={`text-xs font-bold uppercase py-1 px-2.5 rounded-full inline-block mb-1
                    ${isReleased ? 'bg-green-100 text-green-700' : isUnlocked ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}
                  `}>
                    Phase {idx + 1} • {milestone.status}
                  </span>
                  {milestone.target_date && (
                    <span className="flex items-center text-xs text-slate-500 font-medium bg-slate-50 border px-2 py-1 rounded">
                      <Calendar className="w-3 h-3 mr-1.5" />
                      {new Date(milestone.target_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <div className="pl-2 pr-2">
                  <h3 className="font-bold text-slate-900 text-lg mb-1">{milestone.title}</h3>
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">{milestone.description}</p>
                  
                  <div className="bg-amber-50 rounded-lg p-3 text-sm flex items-start text-amber-800 border border-amber-100/50 mb-4">
                    <FileWarning className="w-4 h-4 mt-0.5 mr-2 shrink-0 opacity-70" />
                    <span className="italic opacity-90"><span className="font-medium not-italic">Requires:</span> {milestone.required_proof}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto border-t pt-3">
                    <div className="font-mono font-medium text-slate-700">
                      ₹{milestone.amount_locked.toLocaleString()} <span className="text-slate-400 text-xs font-sans tracking-wide">LOCKED</span>
                    </div>
                    
                    {isLocked && (
                      <button 
                        onClick={() => setSelectedMilestone(milestone)}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1.5 px-4 rounded-lg shadow-sm transition transform hover:-translate-y-0.5"
                      >
                        Upload Proof
                      </button>
                    )}
                    
                    {isUnlocked && (
                      <span className="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-200">
                        Under AI Review
                      </span>
                    )}

                    {isReleased && milestone.proof_updates?.[0] && (
                      <img 
                        src={milestone.proof_updates[0].image_url} 
                        className="w-12 h-12 rounded object-cover border border-slate-200"
                        alt="Proof thumbnail"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selectedMilestone && (
        <ProofUploadModal 
          milestone={selectedMilestone} 
          ngo={ngo} 
          onClose={() => setSelectedMilestone(null)}
          onSuccess={() => {
            setSelectedMilestone(null)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
