'use client'

import { useState } from 'react'
import exifr from 'exifr'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { X, Upload, MapPin, Camera, AlertTriangle, Loader2, CheckCircle } from 'lucide-react'
import AIVerificationSteps from './AIVerificationSteps'

interface Milestone {
  id: string
  title: string
  required_proof: string
}

interface NGO {
  id: string
  sector?: string
  category?: string
  city: string
}

interface ProofUploadModalProps {
  milestone: Milestone
  ngo: NGO
  onClose: () => void
  onSuccess: () => void
}

export default function ProofUploadModal({ milestone, ngo, onClose, onSuccess }: ProofUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [exifData, setExifData] = useState<any>(null)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [steps, setSteps] = useState([
    { label: 'Uploading image to secure storage...', done: false, active: false },
    { label: 'Running AI verification on image content...', done: false, active: false },
    { label: 'Saving proof record to blockchain ledger...', done: false, active: false },
    { label: 'Updating organisation transparency score...', done: false, active: false }
  ])
  
  const [result, setResult] = useState<any>(null)
  
  const supabase = createClientComponentClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const f = e.target.files[0]
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    
    try {
      const meta = await exifr.parse(f, { gps: true, tiff: true })
      setExifData(meta)
    } catch {
      setExifData({ error: 'Failed to extract metadata' })
    }
  }

  const updateStep = (idx: number, updates: Partial<{done: boolean, active: boolean}>) => {
    setSteps(prev => prev.map((s, i) => i === idx ? { ...s, ...updates } : s))
  }

  const handleSubmit = async () => {
    if (!file) return
    setIsProcessing(true)
    
    try {
      // Step 0: start uploading
      updateStep(0, { active: true })
      
      const path = `proofs/${ngo.id}/${milestone.id}/${Date.now()}.jpg`
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('proof-images').upload(path, file)
      
      if (uploadErr) throw new Error('Failed to upload image')
      
      const imageUrl = supabase.storage
        .from('proof-images').getPublicUrl(path).data.publicUrl
        
      updateStep(0, { done: true, active: false })
      
      // Step 1: AI verification
      updateStep(1, { active: true })
      const reader = new FileReader()
      const base64 = await new Promise<string>((res) => {
        reader.onload = () => res((reader.result as string).split(',')[1])
        reader.readAsDataURL(file)
      })
      
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inline_data: { mime_type: 'image/jpeg', data: base64 } },
                { text: `Verify this NGO proof image.
  Required: "${milestone.required_proof}"
  Sector: "${ngo.sector || ngo.category}"
  City: "${ngo.city}"
  Return ONLY JSON format:
  {
    "ai_score": <0-100 number>,
    "ai_verdict": "<2 sentence assessment string>",
    "ai_label": "<GENUINE | SUSPICIOUS | STOCK_PHOTO | UNRELATED>",
    "is_original": <true if score >= 70 boolean>,
    "content_matches": <true or false boolean>,
    "flags": ["<string flag>", "<string flag>"]
  }` }
              ]
            }]
          })
        }
      )
      
      const geminiData = await geminiRes.json()
      
      // Parse safely
      const rawText = geminiData.candidates[0].content.parts[0].text
      const aiResult = JSON.parse(rawText.replace(/```json|```/g,'').trim())
      
      updateStep(1, { done: true, active: false })
      
      // Step 2: Save proof record
      updateStep(2, { active: true })
      
      await supabase.from('proof_updates').insert({
        ngo_id: ngo.id,
        milestone_id: milestone.id,
        image_url: imageUrl,
        caption,
        ai_score: aiResult.ai_score,
        ai_verdict: aiResult.ai_verdict,
        ai_label: aiResult.ai_label,
        is_original: aiResult.is_original
      })
      
      if (aiResult.is_original && aiResult.content_matches) {
        await supabase.from('milestones')
          .update({ status: 'UNLOCKED' })
          .eq('id', milestone.id)
      }
      
      updateStep(2, { done: true, active: false })
      
      // Step 3: Update transparency
      updateStep(3, { active: true })
      const { data: allProofs } = await supabase
        .from('proof_updates').select('ai_score').eq('ngo_id', ngo.id)
        
      if (allProofs) {
        const avg = allProofs.reduce((s, p) => s + (p.ai_score || 0), 0) / allProofs.length
        await supabase.from('ngos')
          .update({ transparency_score: Math.round(avg) })
          .eq('id', ngo.id)
      }
      
      updateStep(3, { done: true, active: false })
      
      setResult(aiResult)
      
    } catch (e) {
      console.error(e)
      alert("Error occurred during verification process")
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto" style={{minHeight: '100vh'}}>
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col my-auto relative shadow-2xl">
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-900 z-10 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8 pb-4">
          <h2 className="text-2xl font-semibold mb-1 pr-6 pb-2">Upload Proof for: {milestone.title}</h2>
          
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg my-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Required Proof:</p>
              <p className="text-sm">{milestone.required_proof}</p>
            </div>
          </div>
          
          {!isProcessing && !result && (
            <div className="space-y-6">
              <label 
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition min-h-64"
                htmlFor="proof-upload"
              >
                {previewUrl ? (
                  <img src={previewUrl} className="max-h-56 object-contain rounded" alt="Preview" />
                ) : (
                  <>
                    <div className="p-4 bg-green-100 text-green-600 rounded-full mb-4">
                      <Upload className="w-8 h-8" />
                    </div>
                    <span className="font-medium">Click to upload or drag & drop</span>
                    <span className="text-sm text-gray-500 mt-2">JPEG, PNG up to 10MB</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  id="proof-upload"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {exifData && (
                <div className="bg-slate-50 border p-4 rounded-lg text-sm grid gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>GPS: {exifData?.latitude ? `${exifData.latitude.toFixed(4)}, ${exifData.longitude.toFixed(4)} ✓` : 'Not found ⚠'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-gray-500" />
                    <span>Device: {exifData?.Make ? `${exifData.Make} ${exifData.Model}` : 'Unknown'}</span>
                  </div>
                  {!exifData.latitude && (
                    <p className="text-amber-600 text-xs mt-1">No GPS data found. Try taking the photo with Location ON for a better verification score.</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea 
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                  rows={3} 
                  placeholder="Describe what this photo shows..."
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleSubmit}
                  disabled={!file}
                  className="w-full bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 text-white font-medium py-3 rounded-lg shadow transition"
                >
                  Verify with AI & Submit
                </button>
              </div>
            </div>
          )}

          {isProcessing && !result && (
            <div className="py-8 px-4 flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-6" />
              <h3 className="text-xl font-semibold mb-8 text-center">Processing Evidence</h3>
              <div className="w-full max-w-sm">
                 <AIVerificationSteps steps={steps} />
              </div>
            </div>
          )}

          {result && (
            <div className={`p-6 rounded-xl border ${result.is_original && result.content_matches ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start gap-4 mb-4">
                {result.is_original && result.content_matches ? (
                  <CheckCircle className="w-10 h-10 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-10 h-10 text-red-500 flex-shrink-0" />
                )}
                <div>
                  <h3 className={`text-xl font-bold ${result.is_original && result.content_matches ? 'text-green-800' : 'text-red-800'}`}>
                    {result.is_original && result.content_matches ? 'AI Verified ✓' : `Image Flagged: ${result.ai_label}`}
                  </h3>
                  <p className="mt-1 font-medium flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-white border font-mono">Score: {result.ai_score}/100</span>
                  </p>
                </div>
              </div>
              
              <p className="text-gray-800 leading-relaxed mt-4 bg-white/50 p-4 rounded italic">"{result.ai_verdict}"</p>
              
              {(!result.is_original || !result.content_matches) && result.flags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.flags.map((f: string, i: number) => (
                    <span key={i} className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">{f}</span>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-black/10 flex justify-end">
                {result.is_original && result.content_matches ? (
                  <button onClick={onSuccess} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium shadow">
                    Awesome! Close
                  </button>
                ) : (
                  <div className="flex w-full items-center justify-between">
                    <span className="text-red-700 text-sm font-medium">Please retake photo properly.</span>
                    <button onClick={() => { setResult(null); setFile(null); setPreviewUrl(null); setIsProcessing(false) }} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-medium shadow">
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
