"use client"
import { useRef } from "react"

export default function ImpactCard({ donor, amount, ngo, impact }) {
  const ref = useRef()
  const download = async () => {
    const h2c = (await import("html2canvas")).default
    const canvas = await h2c(ref.current, {backgroundColor:"#052e16"})
    const a = document.createElement("a")
    a.download = "my-impact.png"
    a.href = canvas.toDataURL()
    a.click()
  }
  return (
    <div>
      <div ref={ref} style={{background:"#052e16",color:"white",borderRadius:16,padding:"28px 32px",width:300,fontFamily:"sans-serif"}}>
        <div style={{fontSize:10,opacity:0.5,letterSpacing:2,marginBottom:8}}>SUSTAINIFY</div>
        <div style={{fontSize:13,opacity:0.7,marginBottom:4}}>{donor} donated</div>
        <div style={{fontSize:40,fontWeight:800,color:"#4ade80"}}>₹{amount}</div>
        <div style={{fontSize:13,opacity:0.7,margin:"8px 0"}}>to {ngo}</div>
        <div style={{fontSize:15,fontWeight:500,lineHeight:1.6,marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.15)"}}>{impact}</div>
      </div>
      <button onClick={download} style={{marginTop:12,background:"#16a34a",color:"white",border:"none",borderRadius:8,padding:"10px 20px",cursor:"pointer",fontSize:14,fontWeight:600}}>
        ⬇️ Download Impact Card
      </button>
    </div>
  )
}