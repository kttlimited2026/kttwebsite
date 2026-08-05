import { Plan } from "../types";

export default function PlansPage({ plans, goTo }: { plans: Plan[]; goTo: (p: string, svc?: string) => void }) {
  return (<>
    <div className="page-hero"><div className="page-hero-inner">
      <div className="sec-lbl">Pricing</div><h1 className="fd">Subscription Plans</h1>
      <p>Save more every month with a plan built around your lifestyle.</p>
    </div></div>
    <div className="plans-bg"><div className="plans-inner">
      <div className="sec-hdr centered">
        <div className="sec-lbl">Choose a Plan</div>
        <h2 className="fd sec-title">Simple, honest pricing.</h2>
        <p className="sec-sub" style={{margin:"0 auto"}}>No hidden fees. Cancel anytime.</p>
      </div>
      <div className="plans-grid">{plans.map((p,i)=>(
        <div key={i} className={`plan-card${p.featured?" hot":""}`}>
          {p.badge&&p.featured&&<div className="plan-badge">{p.badge}</div>}
          <div className="plan-name">{p.name}</div>
          <div className="plan-price"><sup>₦</sup>{p.price}</div>
          <div className="plan-period">{p.period}</div>
          <hr className="plan-div"/>
          <ul className="plan-feats">{p.features.filter(Boolean).map((f,j)=><li key={j}>{f}</li>)}</ul>
          <button className={`plan-cta ${p.ctaClass}`} onClick={()=>goTo("booking", `Monthly Subscription Plan - ${p.name} (₦${p.price}/mo)`)}>{p.cta}</button>
        </div>
      ))}</div>
    </div></div>
  </>);
}
