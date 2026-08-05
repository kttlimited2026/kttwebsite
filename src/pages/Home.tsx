import { Service, Plan, Settings } from "../types";
import { WHY, TESTIMONIALS } from "../constants";
import SvcCard from "../components/SvcCard";
import ReferralBanner from "../components/ReferralBanner";
import ExpressBadge from "../components/ExpressBadge";

export default function Home({ svcs, plans, goTo, settings, onBookWithCode }: { svcs: Service[]; plans: Plan[]; goTo: (p: string, svc?: string) => void; settings?: Settings; onBookWithCode?: (code: string) => void }) {
  return (<>
    <div className="hero-wrap">
      <div className="hero-inner">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 }}>
          <div className="pill" style={{ marginBottom: 0 }}><span style={{ width: 6, height: 6, background: "var(--neon-lime)", borderRadius: "50%" }}></span>NOW SERVING ABUJA</div>
          <div className="pill" style={{ marginBottom: 0, background: "rgba(255, 94, 0, 0.1)", border: "1px solid rgba(255, 94, 0, 0.3)", color: "var(--bright-orange)" }}><span style={{ width: 6, height: 6, background: "var(--bright-orange)", borderRadius: "50%" }}></span>COMING TO LAGOS SOON</div>
        </div>
        <h1 className="headline">Everything Home, <br /><em>One Platform.</em></h1>
        <p className="tagline">Reliable food delivery, chilled bar &amp; drinks, professional laundry care, and premium cleaning services in Abuja.</p>
        
        {settings?.heroBannerImage && (
          <div style={{ marginTop: 24, maxWidth: 900, margin: "24px auto 0", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,94,0,0.3)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <img src={settings.heroBannerImage} alt="Promotional Banner" style={{ width: "100%", maxHeight: 350, objectFit: "cover", display: "block" }} />
          </div>
        )}
      </div>
    </div>

    <div className="tabs">
      {[
        {i:"🍽️",l:"Food Delivery",act:()=>goTo("booking", "Food Delivery & Restaurant Meals")},
        {i:"🍾",l:"Bar Menu",act:()=>goTo("booking", "Bar & Drinks Menu")},
        {i:"👔",l:"Laundry",act:()=>goTo("booking", "Laundry & Dry Cleaning")},
        {i:"🧹",l:"Cleaning",act:()=>goTo("booking", "Home Cleaning")},
        {i:"💳",l:"Plans",act:()=>goTo("plans")},
        {i:"📞",l:"Contact",act:()=>goTo("contact")}
      ].map((t,i)=>(
        <button key={i} className="tab" onClick={t.act}>
          {t.i} {t.l}
        </button>
      ))}
    </div>

    <div className="dash"><div className="dash-inner">
      <div className="stats-grid">
        {[{n:"2,500+",l:"Customers",c:"var(--neon-lime)"},{n:"98%",l:"Satisfaction",c:"var(--bright-orange)"},{n:"50K+",l:"Orders Done",c:"var(--neon-lime)"},{n:"24/7",l:"Support",c:"var(--bright-orange)"}].map((s,i)=>(
          <div key={i} className="stat-item"><span className="stat-num" style={{color:s.c}}>{s.n}</span><span className="stat-label">{s.l}</span></div>
        ))}
      </div>
      
      <div className="dash-lbl">Select a service &amp; book instantly</div>
      <div className="cards-grid">
        {svcs.map((s,i)=><SvcCard key={i} s={s} onBook={()=>goTo("booking")}/>)}
      </div>
    </div></div>

    <div className="sec">
      <div className="sec-hdr"><div className="sec-lbl">Why KTT</div><h2 className="fd sec-title">Built for your <span style={{color:"var(--neon-lime)"}}>convenience.</span></h2><p className="sec-sub">Every part of our service is designed to make your everyday life simpler.</p></div>
      <div className="why-grid">{WHY.map((w,i)=><div key={i} className="why-card"><div className="why-ico">{w.icon}</div><div><h4>{w.title}</h4><p>{w.desc}</p></div></div>)}</div>
    </div>

    {/* Express Emergency Service Banner - Moved right before Pricing */}
    <div className="sec" style={{ paddingTop: 10, paddingBottom: 10 }}>
      <ExpressBadge settings={settings} onBookExpress={() => goTo("booking")} />
    </div>

    <div className="plans-bg"><div className="plans-inner">
      <div className="sec-hdr centered"><div className="sec-lbl">Pricing</div><h2 className="fd sec-title">Simple, honest pricing.</h2><p className="sec-sub" style={{margin:"0 auto"}}>Subscribe and save.</p></div>
      <div className="plans-grid">{plans.map((p,i)=>(
        <div key={i} className={`plan-card${p.featured?" hot":""}`}>
          {p.badge&&p.featured&&<div className="plan-badge">{p.badge}</div>}
          <div className="plan-name">{p.name}</div>
          <div className="plan-price"><sup>₦</sup>{p.price}</div>
          <div className="plan-period">{p.period}</div>
          <hr className="plan-div"/>
          <ul className="plan-feats">{p.features.filter(Boolean).map((f,j)=><li key={j}>{f}</li>)}</ul>
          <button className={`plan-cta ${p.ctaClass}`} onClick={()=>goTo("booking")}>{p.cta}</button>
        </div>
      ))}</div>
    </div></div>

    <div className="sec">
      <div className="sec-hdr centered"><div className="sec-lbl">Testimonials</div><h2 className="fd sec-title">What our customers say.</h2></div>
      <div className="testi-grid">{TESTIMONIALS.map((t,i)=>(
        <div key={i} className="testi-card">
          <div className="testi-stars">{t.stars}</div>
          <p className="testi-txt">"{t.text}"</p>
          <div className="testi-author">
            <div className="testi-av" style={{background:t.bg,color:t.tc}}>{t.name[0]}</div>
            <div><div className="testi-name">{t.name}</div><div className="testi-role">{t.role}</div></div>
          </div>
        </div>
      ))}</div>
    </div>

    {/* Referral Perks Banner - Placed immediately after Testimonials */}
    <div className="sec" style={{ paddingTop: 0, paddingBottom: 40 }}>
      <ReferralBanner settings={settings} onBookWithCode={onBookWithCode || (() => goTo("booking"))} />
    </div>

    <div className="cta-strip">
      <div className="sec-lbl" style={{display:"flex",justifyContent:"center",marginBottom:8}}>Ready to get started?</div>
      <h2 className="fd sec-title" style={{marginBottom:8}}>Book your first service today.</h2>
      <p className="sec-sub" style={{margin:"0 auto 24px"}}>No commitments. Just great service at your door.</p>
      <div style={{display:"flex",gap:11,justifyContent:"center",flexWrap:"wrap"}}>
        <button className="btn-orange" style={{fontSize:15,padding:"13px 26px"}} onClick={()=>goTo("booking")}>Book a Service</button>
        <button className="btn-lime" style={{fontSize:15,padding:"13px 26px"}} onClick={()=>goTo("plans")}>View Plans</button>
        <a href={`https://wa.me/${settings?.whatsapp || "2347066613373"}`} className="wa-btn" target="_blank" rel="noreferrer">💬 WhatsApp Us</a>
      </div>
    </div>
  </>);
}
