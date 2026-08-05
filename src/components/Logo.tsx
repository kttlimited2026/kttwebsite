export default function Logo({ size=42 }) {
  return (
    <div style={{width:size,height:size,borderRadius:size*.22,background:"var(--bg-dark)",border:"2px solid var(--bright-orange)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <span style={{fontSize:size*.32,fontWeight:900,color:"#fff",fontFamily:"'DM Sans',sans-serif"}}>K</span>
      <span style={{fontSize:size*.32,fontWeight:900,color:"var(--neon-lime)",letterSpacing:"-2px",fontFamily:"'DM Sans',sans-serif"}}>TT</span>
    </div>
  );
}
