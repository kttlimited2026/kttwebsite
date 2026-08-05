import { WHY } from "../constants";

export default function About() {
  return (<>
    <div className="page-hero"><div className="page-hero-inner">
      <div className="sec-lbl">Our Story</div>
      <h1 className="fd">About Kings Treat Tech</h1>
      <p>Built around one promise — making everyday life easier for every Nigerian household.</p>
    </div></div>
    <div className="sec"><div className="about-grid">
      <div>
        <div className="sec-lbl">Who We Are</div>
        <h2 className="fd sec-title">Everything Home,<br/><span style={{color:"var(--neon-lime)"}}>One Platform.</span></h2>
        {["Kings Treat Tech Limited (KTT) was founded with a simple mission: remove the friction from everyday life. We noticed how much time and energy people spend managing basic household needs — food, laundry, and cleaning — and decided to bring all of it under one roof.",
          "Today, we serve households and businesses across Abuja, delivering restaurant-quality meals, professionally laundered garments, and spotlessly cleaned spaces — all bookable in minutes.",
          "Our team is made up of passionate service professionals who take pride in their work. We vet every partner, train every agent, and hold ourselves to a standard that makes our customers genuinely happy."
        ].map((t,i)=><p key={i} style={{color:"#888",fontSize:14,lineHeight:1.8,fontWeight:300,marginBottom:13}}>{t}</p>)}
      </div>
      <div className="about-stats">
        {[
          {n:"2,500+",l:"Happy Customers",c:"var(--bright-orange)",hl:true},
          {n:"98%",l:"Satisfaction Rate",c:"var(--neon-lime)"},
          {n:"50,000+",l:"Orders Completed",c:"var(--neon-lime)"},
          {n:"4",l:"Core Services",c:"var(--bright-orange)"}
        ].map((s,i)=>(
          <div key={i} className={`astat${s.hl?" hl":""}`}><div className="astat-num" style={{color:s.c}}>{s.n}</div><p>{s.l}</p></div>
        ))}
      </div>
    </div></div>
    <hr className="sec-div"/>
    <div className="sec">
      <div className="sec-hdr centered"><div className="sec-lbl">Our Values</div><h2 className="fd sec-title">What drives us every day</h2></div>
      <div className="why-grid">{WHY.map((w,i)=><div key={i} className="why-card"><div className="why-ico">{w.icon}</div><div><h4>{w.title}</h4><p>{w.desc}</p></div></div>)}</div>
    </div>
  </>);
}
