"use client"
import { useState, useEffect } from "react"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function GovPortal() {
  const [token, setToken] = useState("")
  const [loggedIn, setLoggedIn] = useState(false)
  const [ngos, setNgos] = useState([])
  const [tab, setTab] = useState("all")
  const [pts, setPts] = useState({})
  const [error, setError] = useState("")

  const login = () => {
    if (token === "GOV-DEMO-2025") setLoggedIn(true)
    else setError("Invalid token")
  }

  const load = () => fetch(`${API}/api/v1/gov/ngos`).then(r=>r.json()).then(setNgos).catch(()=>{})
  useEffect(() => { if (loggedIn) load() }, [loggedIn])

  const action = async (ngo_id, act, points=0) => {
    await fetch(`${API}/api/v1/gov/action`, {method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({token:"GOV-DEMO-2025",ngo_id,action:act,points,reason:"Gov review"})})
    load()
  }

  const filtered = ngos.filter(n => tab==="all" ? true : tab==="blacklisted" ? n.status==="blacklisted" : n.status==="active")

  if (!loggedIn) return (
    <div style={{minHeight:"100vh",background:"#1e3a5f",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"sans-serif"}}>
      <div style={{background:"white",borderRadius:16,padding:"40px 48px",width:360,textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:8}}>🏛</div>
        <h2 style={{margin:"0 0 4px",color:"#1e3a5f"}}>Government Portal</h2>
        <p style={{color:"#6b7280",fontSize:13,marginBottom:24}}>Sustainify NGO Oversight System</p>
        <div style={{height:4,background:"linear-gradient(to right,#ff9933,white,#138808)",borderRadius:2,marginBottom:24}}/>
        <input type="password" placeholder="Enter Gov Access Token" value={token} onChange={e=>setToken(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&login()}
          style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #d1d5db",fontSize:14,marginBottom:12,boxSizing:"border-box"}}/>
        {error && <p style={{color:"#dc2626",fontSize:12,margin:"0 0 8px"}}>{error}</p>}
        <button onClick={login} style={{width:"100%",background:"#1e3a5f",color:"white",border:"none",borderRadius:8,padding:"12px",fontSize:14,fontWeight:600,cursor:"pointer"}}>
          Login →
        </button>
        <p style={{color:"#9ca3af",fontSize:11,marginTop:12}}>Demo token: GOV-DEMO-2025</p>
      </div>
    </div>
  )

  return (
    <div style={{fontFamily:"sans-serif",minHeight:"100vh",background:"#f8fafc"}}>
      <div style={{background:"#1e3a5f",padding:"20px 32px",color:"white",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <h1 style={{margin:0,fontSize:22,fontWeight:800}}>🏛 Government Portal</h1>
          <p style={{margin:0,fontSize:13,opacity:0.7}}>NGO Oversight & Verification — Sustainify</p>
        </div>
        <div style={{height:6,width:120,background:"linear-gradient(to right,#ff9933,white,#138808)",borderRadius:3}}/>
      </div>

      <div style={{maxWidth:900,margin:"0 auto",padding:24}}>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {["all","active","blacklisted"].map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{padding:"8px 20px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:600,fontSize:13,
                background:tab===t?"#1e3a5f":"white",color:tab===t?"white":"#374151",
                boxShadow:tab===t?"none":"0 1px 3px rgba(0,0,0,0.1)"}}>
              {t.charAt(0).toUpperCase()+t.slice(1)} ({ngos.filter(n=>t==="all"?true:n.status===t).length})
            </button>
          ))}
        </div>

        {filtered.map(n=>(
          <div key={n.id} style={{background:"white",borderRadius:12,padding:"20px 24px",marginBottom:16,border:"1px solid #e5e7eb",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                  <h3 style={{margin:0,fontSize:16}}>{n.name}</h3>
                  <span style={{fontSize:11,borderRadius:20,padding:"2px 10px",fontWeight:600,
                    background:n.status==="active"?"#dcfce7":"#fee2e2",
                    color:n.status==="active"?"#16a34a":"#dc2626"}}>
                    {n.status==="active"?"✅ Active":"⛔ Blacklisted"}
                  </span>
                </div>
                <div style={{fontSize:12,color:"#6b7280"}}>{n.category} · {n.location} · Milestones: {n.milestones_done}/{n.milestones_total}</div>
                <div style={{marginTop:8,background:"#f3f4f6",borderRadius:20,height:6,width:200}}>
                  <div style={{background:"#1e3a5f",borderRadius:20,height:6,width:`${n.gov_points}%`}}/>
                </div>
                <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>🏛 {n.gov_points}/100 Gov Points</div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button onClick={()=>action(n.id,"verify")} style={{background:"#16a34a",color:"white",border:"none",borderRadius:8,padding:"8px 14px",cursor:"pointer",fontSize:12,fontWeight:600}}>✅ Verify</button>
                <button onClick={()=>action(n.id,"blacklist")} style={{background:"#dc2626",color:"white",border:"none",borderRadius:8,padding:"8px 14px",cursor:"pointer",fontSize:12,fontWeight:600}}>⛔ Blacklist</button>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  <input type="number" placeholder="pts" value={pts[n.id]||""} onChange={e=>setPts({...pts,[n.id]:e.target.value})}
                    style={{width:60,padding:"7px 8px",borderRadius:8,border:"1px solid #d1d5db",fontSize:12}}/>
                  <button onClick={()=>action(n.id,"add_points",parseInt(pts[n.id]||0))}
                    style={{background:"#1e3a5f",color:"white",border:"none",borderRadius:8,padding:"8px 12px",cursor:"pointer",fontSize:12,fontWeight:600}}>➕ Pts</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
