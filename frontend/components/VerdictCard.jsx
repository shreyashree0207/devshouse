export default function VerdictCard({ score, verdict, labels, webMatches }) {
  const color = score >= 70 ? "#16a34a" : score >= 40 ? "#d97706" : "#dc2626"
  const bg = score >= 70 ? "#f0fdf4" : score >= 40 ? "#fffbeb" : "#fef2f2"
  return (
    <div style={{border:`1.5px solid ${color}`,borderRadius:10,padding:"12px 16px",marginTop:10,background:bg}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
        <span style={{fontSize:24,fontWeight:700,color}}>{score}</span>
        <span style={{fontSize:11,color:"#6b7280"}}>/100 authenticity</span>
        {webMatches > 0 && <span style={{fontSize:11,background:"#fef2f2",color:"#dc2626",borderRadius:20,padding:"2px 8px"}}>⚠️ {webMatches} web matches</span>}
        {webMatches === 0 && <span style={{fontSize:11,background:"#f0fdf4",color:"#16a34a",borderRadius:20,padding:"2px 8px"}}>✅ Original</span>}
      </div>
      <p style={{fontSize:12,margin:"0 0 8px",color:"#374151"}}>{verdict}</p>
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {(labels||[]).slice(0,5).map(l=>(
          <span key={l} style={{fontSize:11,background:"#f3f4f6",borderRadius:20,padding:"2px 8px",color:"#374151"}}>{l}</span>
        ))}
      </div>
    </div>
  )
}