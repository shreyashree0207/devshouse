"use client"
import { useState, useEffect } from "react"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const ROLE_BADGE = { beneficiary:"🟢", volunteer:"🔵", attendee:"🟡" }

export default function AttestationWidget({ updateId, ngoId }) {
  const [list, setList] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name:"", experience:"", role:"attendee" })
  const [submitted, setSubmitted] = useState(false)

  const load = () => fetch(`${API}/attestations/${updateId}`)
    .then(r=>r.json()).then(setList).catch(()=>{})

  useEffect(() => { load() }, [updateId])

  const upvote = async (id) => {
    await fetch(`${API}/attestations/${id}/upvote`, { method:"POST" })
    load()
  }

  const submit = async () => {
    if (form.experience.length < 15) return alert("Please share more detail (min 15 chars)")
    await fetch(`${API}/attestations`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ update_id:updateId, ngo_id:ngoId, ...form })
    })
    setSubmitted(true); setOpen(false); load()
  }

  return (
    <div style={{marginTop:12,padding:"12px 14px",background:"#f9fafb",borderRadius:10,border:"1px solid #e5e7eb"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{fontSize:13,fontWeight:600,color:"#374151"}}>👥 Community Verification</span>
        <span style={{fontSize:12,background:"#dcfce7",color:"#16a34a",borderRadius:20,padding:"2px 8px"}}>{list.length} verified</span>
      </div>

      {list.slice(0,3).map(a=>(
        <div key={a.id} style={{background:"white",borderRadius:8,padding:"10px 12px",marginBottom:8,border:"1px solid #f3f4f6"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:12,fontWeight:600}}>{ROLE_BADGE[a.role]} {a.name}</span>
            <button onClick={()=>upvote(a.id)} style={{fontSize:11,background:"none",border:"1px solid #e5e7eb",borderRadius:20,padding:"2px 8px",cursor:"pointer"}}>👍 {a.upvotes}</button>
          </div>
          <p style={{fontSize:12,color:"#6b7280",margin:"4px 0 0"}}>{a.experience}</p>
        </div>
      ))}

      {submitted && <p style={{fontSize:12,color:"#16a34a",margin:"6px 0"}}>✅ Thank you! Your verification helps donors trust this NGO.</p>}

      {!submitted && (
        <button onClick={()=>setOpen(!open)} style={{fontSize:12,background:"none",border:"1px solid #d1d5db",borderRadius:8,padding:"6px 12px",cursor:"pointer",width:"100%",marginTop:4}}>
          {open ? "✕ Cancel" : "✋ I was there — verify this"}
        </button>
      )}

      {open && (
        <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:8}}>
          <input placeholder="Your name (optional)" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
            style={{padding:"8px 10px",borderRadius:8,border:"1px solid #d1d5db",fontSize:13}}/>
          <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}
            style={{padding:"8px 10px",borderRadius:8,border:"1px solid #d1d5db",fontSize:13}}>
            <option value="attendee">🟡 I attended the event</option>
            <option value="beneficiary">🟢 I was a beneficiary</option>
            <option value="volunteer">🔵 I volunteered</option>
          </select>
          <textarea placeholder="Share your experience (min 15 chars)" value={form.experience}
            onChange={e=>setForm({...form,experience:e.target.value})}
            rows={3} style={{padding:"8px 10px",borderRadius:8,border:"1px solid #d1d5db",fontSize:13,resize:"none"}}/>
          <button onClick={submit} style={{background:"#16a34a",color:"white",border:"none",borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,fontWeight:600}}>
            Submit Verification
          </button>
        </div>
      )}
    </div>
  )
}