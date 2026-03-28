export default function ScoreRing({ score }) {
  const r = 40, circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 70 ? "#16a34a" : score >= 40 ? "#d97706" : "#dc2626"
  return (
    <div style={{textAlign:"center"}}>
      <svg width="110" height="110" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8"/>
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{transition:"stroke-dasharray 1.2s ease"}}/>
        <text x="50" y="54" textAnchor="middle" fontSize="20" fontWeight="700" fill={color}>{score}</text>
      </svg>
      <div style={{fontSize:12,color:"#6b7280",marginTop:4}}>Transparency Score</div>
    </div>
  )
}