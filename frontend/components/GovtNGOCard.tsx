'use client'

interface NGO {
  id: string
  name: string
  darpan_id: string
  sector: string
  transparency_score: number
  is_govt_verified: boolean
  verified: boolean
  status: string
}

interface GovtNGOCardProps {
  ngo: NGO
  milestoneCount: { total: number; completed: number }
  onVerify: () => void
}

export default function GovtNGOCard({ ngo, milestoneCount, onVerify }: GovtNGOCardProps) {
  const allReleased = milestoneCount.completed === milestoneCount.total && milestoneCount.total > 0

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow transition flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 border-b pb-1">{ngo.name}</h3>
          <span className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2 py-1 rounded-full whitespace-nowrap">
            {ngo.sector || 'Uncategorized'}
          </span>
        </div>
        
        <div className="space-y-1 mt-3">
          <p className="font-mono text-sm tracking-tight text-gray-600">
            {ngo.darpan_id || 'Pending ID'}
          </p>
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-24">Milestones:</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2 relative border border-gray-200 shadow-inner">
              <div 
                className="bg-green-500 h-2 rounded-full absolute top-0 left-0" 
                style={{ width: `${milestoneCount.total > 0 ? (milestoneCount.completed/milestoneCount.total)*100 : 0}%` }}
              />
            </div>
            <span className="ml-2 font-medium text-gray-700 text-xs w-8 text-right">
              {milestoneCount.completed}/{milestoneCount.total}
            </span>
          </div>
          
          <div className="flex items-center text-sm mt-1">
            <span className="text-gray-500 w-24">Trust Score:</span>
            <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ring-2" style={{
              backgroundColor: `hsl(${Math.max(0, ngo.transparency_score)} 70% 50% / 10%)`,
              color: `hsl(${Math.max(0, ngo.transparency_score)} 70% 35%)`,
              ringColor: `hsl(${Math.max(0, ngo.transparency_score)} 70% 50%)`
            }}>
              {ngo.transparency_score || 0}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t">
        {allReleased && !ngo.is_govt_verified ? (
          <button 
            onClick={onVerify}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 px-3 rounded text-sm transition"
          >
            Mark as Govt Verified ✓
          </button>
        ) : ngo.is_govt_verified ? (
          <div className="text-center font-medium py-1.5 px-3 rounded text-sm bg-green-50 text-green-700 w-full border border-green-200">
            Govt Verified ✓
          </div>
        ) : (
          <div className="text-center text-gray-400 text-sm py-1.5 w-full bg-gray-50 rounded border border-gray-100">
            In Progress
          </div>
        )}
      </div>
    </div>
  )
}
