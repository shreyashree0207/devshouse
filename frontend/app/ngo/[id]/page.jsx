"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ScoreRing from "@/components/ScoreRing"
import VerdictCard from "@/components/VerdictCard"
import AttestationWidget from "@/components/AttestationWidget"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function NGODetail() {
  const { id } = useParams()
  const [ngo, setNgo] = useState(null)
  const [updates, setUpdates] = useState([])
  const [milestones, setMilestones] = useState([])
  const [score, setScore] = useState(0)
  const [tips, setTips] = useState([])

  useEffect(() => {
    fetch(`${API}/ngos/${id}`).then(r=>r.json()).then(n=>{
      setNgo(n)
      fetch(`${API}/ai/score`,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({milestones_done:n.milestones_done,milestones_total:n.milestones_total,
          verified_proofs:n.verified_proofs,total_updates:n.total_updates,
          returning_donors:n.returning_donors,total_donors:n.total_donors})
      }).then(r=>r.json()).then(d=>setScore(d.score))
    }).catch(()=>{})
    fetch(`${API}/ngos/${id}/updates`).then(r=>r.json()).then(setUpdates).catch(()=>{})
    fetch(`${API}/ngos/${id}/milestones`).then(r=>r.json()).then(setMilestones).catch(()=>{})
    fetch(`${API}/ngos/${id}/tips`).then(r=>r.json()).then(d=>setTips(d.tips||[])).catch(()=>{})
  }, [id])

  if (!ngo) return <div style={{padding:40,textAlign:"center"}}>Loading...</div>

  const isBlacklisted = ngo.status === "blacklisted"

  return (
    <div style={{fontFamily:"sans-serif",maxWidth:1000,margin:"0 auto",padding:20}}>
      {/* Header */}
      <div style={{background:"#052e16",borderRadius:16,padding:"28px 32px",marginBottom:24,color:"white"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
              <h1 style={{margin:0,fontSize:28,fontWeight:800}}>{ngo.name}</h1>
              <span style={{background:isBlacklisted?"#dc2626":"#16a34a",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600}}>
                {isBlacklisted?"⛔ Blacklisted":"✅ Active"}
              </span>
            </div>
            <div style={{opacity:0.8,fontSize:14}}>{ngo.category?.toUpperCase()} · 📍 {ngo.location}</div>
            <p style={{opacity:0.7,fontSize:13,marginTop:8}}>{ngo.description}</p>
          </div>
          <div style={{textAlign:"center"}}>
            <ScoreRing score={score}/>
            <div style={{marginTop:8,background:"rgba(255,255,255,0.1)",borderRadius:10,padding:"6px 14px",fontSize:13}}>
              🏛 {ngo.gov_points} Gov Points
            </div>
          </div>
        </div>
        {tips.length > 0 && (
          <div style={{marginTop:16,background:"rgba(255,255,255,0.07)",borderRadius:10,padding:"12px 16px"}}>
            <div style={{fontSize:12,opacity:0.6,marginBottom:6}}>💡 Score Improvement Tips</div>
            {tips.map((t,i)=><div key={i} style={{fontSize:12,opacity:0.85,marginBottom:3}}>• {t}</div>)}
          </div>
        )}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:20}}>
        {/* Milestones */}
        <div style={{background:"white",borderRadius:12,padding:20,border:"1px solid #e5e7eb",height:"fit-content"}}>
          <h3 style={{margin:"0 0 14px",fontSize:15,color:"#052e16"}}>🎯 Milestones</h3>
          {milestones.map((m,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:12,padding:"10px 12px",background:m.achieved?"#f0fdf4":"#f9fafb",borderRadius:8,border:`1px solid ${m.achieved?"#bbf7d0":"#e5e7eb"}`}}>
              <span style={{fontSize:16}}>{m.achieved?"✅":"⬜"}</span>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:"#111"}}>{m.title}</div>
                {m.gov_funded && <span style={{fontSize:11,background:"#fff7ed",color:"#c2410c",borderRadius:20,padding:"2px 8px",marginTop:4,display:"inline-block"}}>🏛 Gov Funded</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Feed */}
        <div>
          <h3 style={{margin:"0 0 14px",fontSize:15,color:"#052e16"}}>📸 Proof Feed</h3>
          {updates.map(u=>(
            <div key={u.id} style={{background:"white",borderRadius:12,border:"1px solid #e5e7eb",marginBottom:16,overflow:"hidden"}}>
              <img src={u.image_url} alt={u.description} style={{width:"100%",height:200,objectFit:"cover"}}/>
              <div style={{padding:"14px 16px"}}>
                <p style={{margin:"0 0 8px",fontSize:13,fontWeight:500}}>{u.description}</p>
                <VerdictCard score={u.ai_score} verdict={u.ai_verdict} labels={u.ai_labels} webMatches={u.web_matches||0}/>
                <AttestationWidget updateId={u.id} ngoId={id}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{marginTop:24,textAlign:"center"}}>
        <a href={`/donate?id=${id}&name=${encodeURIComponent(ngo.name)}&cat=${ngo.category}`}
          style={{background:"#16a34a",color:"white",textDecoration:"none",padding:"14px 40px",borderRadius:12,fontSize:16,fontWeight:700,display:"inline-block"}}>
          💚 Donate to {ngo.name} →
        </a>
      </div>
    </div>
  )
}