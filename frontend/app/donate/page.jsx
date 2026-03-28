"use client"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import ImpactCard from "@/components/ImpactCard"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const PRESETS = [100, 500, 1000, 5000]

function DonateForm() {
  const params = useSearchParams()
  const ngoId = params.get("id") || "mock-1"
  const ngoName = params.get("name") || "Akshaya Patra"
  const cat = params.get("cat") || "education"

  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [anon, setAnon] = useState(false)
  const [impact, setImpact] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!amount || amount < 50) return
    const t = setTimeout(() => {
      fetch(`${API}/ai/impact`,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({amount:parseInt(amount),category:cat,ngo_name:ngoName})})
      .then(r=>r.json()).then(d=>setImpact(d.message)).catch(()=>{})
    }, 500)
    return () => clearTimeout(t)
  }, [amount])

  const donate = async () => {
    if (!amount || amount < 1) return alert("Enter a valid amount")
    setLoading(true)
    const res = await fetch(`${API}/donations`,{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ngo_id:ngoId,ngo_name:ngoName,category:cat,donor_name:name||"Anonymous",amount:parseInt(amount),is_anonymous:anon})})
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  if (result) return (
    <div style={{maxWidth:500,margin:"0 auto",padding:24,fontFamily:"sans-serif"}}>
      <h2 style={{color:"#052e16",textAlign:"center",marginBottom:24}}>🎉 Donation Successful!</h2>
      <ImpactCard donor={result.donor} amount={result.amount} ngo={result.ngo} impact={result.impact}/>
      <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:12,padding:"20px 24px",marginTop:20}}>
        <h3 style={{margin:"0 0 12px",fontSize:15,color:"#052e16"}}>🧾 Donation Receipt — 80G Eligible</h3>
        <p style={{fontSize:13,color:"#374151",lineHeight:1.7,whiteSpace:"pre-line"}}>{result.receipt}</p>
      </div>
      <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,padding:"20px 24px",marginTop:16}}>
        <h3 style={{margin:"0 0 12px",fontSize:14,color:"#052e16"}}>💡 Start Your Own NGO</h3>
        {["Register on NGO Darpan portal (free, govt portal)","Apply for 80G & 12A tax exemption status","Document every activity with photos from day 1"].map((t,i)=>(
          <div key={i} style={{fontSize:13,color:"#166534",marginBottom:6}}>✅ {t}</div>
        ))}
      </div>
      <a href="/" style={{display:"block",textAlign:"center",marginTop:20,color:"#16a34a",fontSize:14}}>← Back to NGOs</a>
    </div>
  )

  return (
    <div style={{maxWidth:480,margin:"0 auto",padding:24,fontFamily:"sans-serif"}}>
      <a href="/" style={{fontSize:13,color:"#6b7280",textDecoration:"none"}}>← Back</a>
      <div style={{background:"#052e16",borderRadius:16,padding:"20px 24px",margin:"16px 0 24px",color:"white"}}>
        <div style={{fontSize:11,opacity:0.6,marginBottom:4}}>DONATING TO</div>
        <h2 style={{margin:0,fontSize:22}}>{ngoName}</h2>
        <div style={{fontSize:12,opacity:0.7,marginTop:4}}>{cat.toUpperCase()}</div>
      </div>

      <div style={{marginBottom:16}}>
        <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:6}}>Your Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Leave blank for anonymous"
          style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #d1d5db",fontSize:14,boxSizing:"border-box"}}/>
        <label style={{display:"flex",alignItems:"center",gap:8,marginTop:8,fontSize:13,cursor:"pointer"}}>
          <input type="checkbox" checked={anon} onChange={e=>setAnon(e.target.checked)}/>
          Donate anonymously
        </label>
      </div>

      <div style={{marginBottom:16}}>
        <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:8}}>Amount (₹)</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
          {PRESETS.map(p=>(
            <button key={p} onClick={()=>setAmount(p.toString())}
              style={{padding:"8px 16px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,
                border:`2px solid ${amount==p?"#16a34a":"#e5e7eb"}`,
                background:amount==p?"#f0fdf4":"white",color:amount==p?"#16a34a":"#374151"}}>
              ₹{p.toLocaleString()}
            </button>
          ))}
        </div>
        <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Or enter custom amount"
          style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1px solid #d1d5db",fontSize:14,boxSizing:"border-box"}}/>
        {impact && (
          <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,padding:"10px 14px",marginTop:10,fontSize:13,color:"#166534"}}>
            💚 {impact}
          </div>
        )}
      </div>

      <button onClick={donate} disabled={loading}
        style={{width:"100%",background:"#16a34a",color:"white",border:"none",borderRadius:10,padding:"14px",fontSize:16,fontWeight:700,cursor:"pointer",opacity:loading?0.7:1}}>
        {loading ? "Processing..." : `Donate ₹${amount||"..."} →`}
      </button>
    </div>
  )
}

export default function DonatePage() {
  return <Suspense fallback={<div style={{padding:40,textAlign:"center"}}>Loading...</div>}><DonateForm/></Suspense>
}