import React, { useState } from "react";
import { Settings } from "../types";
import { InstagramIcon, TikTokIcon, FacebookIcon, TwitterIcon } from "../components/SocialIcons";

export default function Contact({ settings }: { settings: Settings }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  
  const h = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const targetEmail = settings.email || "Chatkttlimited@gmail.com";

  const sendMessage = async () => {
    if (!form.name || !form.email || !form.message) {
      alert("Please enter your Name, Email, and Message.");
      return;
    }

    setLoading(true);

    try {
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _subject: `💬 New Contact Inquiry: ${form.subject || 'General Inquiry'} from ${form.name}`,
          _template: "table",
          _captcha: "false",
          "Sender Name": form.name,
          "Sender Email": form.email,
          "Subject": form.subject || "General Inquiry",
          "Message": form.message,
          _replyto: form.email
        })
      });
    } catch (err) {
      console.warn("Contact email dispatch note:", err);
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (<>
    <div className="page-hero"><div className="page-hero-inner">
      <div className="sec-lbl">Get In Touch</div><h1 className="fd">Contact Us</h1>
      <p>We're here to help. Reach out anytime — we respond fast.</p>
    </div></div>
    <div className="sec"><div className="contact-grid">
      <div>
        <h2 className="fd" style={{fontSize:22,marginBottom:24,color:"#fff"}}>Reach <span style={{color:"var(--neon-lime)"}}>KTT</span></h2>
        {[
          {icon:"📞",title:"Front Desk / Phone Calls",text:settings.phone},
          ...(settings.managerPhone ? [{icon:"👔",title:"Manager / Complaints",text:settings.managerPhone}] : []),
          {icon:"💬",title:"WhatsApp Only",text:"+234 816 088 0608"},
          {icon:"📧",title:"Email",text:settings.email},
          {icon:"📍",title:"Address",text:settings.address},
          {icon:"🕐",title:"Operating Hours",text:`Mon – Thu: ${settings.monThu || "9am – 10pm"}\nFri – Sat: ${settings.friSat || "9am – 12am"}\nSunday: ${settings.sunday || "2pm – 10pm"}`},
        ].map((c,i)=>(
          <div key={i} className="cinfo">
            <div className="cinfo-ico">{c.icon}</div>
            <div><h4>{c.title}</h4><p style={{whiteSpace:"pre-line", wordBreak:"break-word"}}>{c.text}</p></div>
          </div>
        ))}
        <a href={`https://wa.me/${(settings.whatsapp || "2348160880608").replace(/[^0-9]/g, "")}`} className="wa-btn" target="_blank" rel="noreferrer">💬 Chat on WhatsApp (+234 816 088 0608)</a>

        <div style={{marginTop: 28, paddingTop: 24, borderTop: "1px solid #2A2A2A"}}>
          <h4 style={{fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14}}>Follow Us On Social Media</h4>
          <div style={{display: "flex", gap: 12, flexWrap: "wrap"}}>
            {settings.instagram && (
              <a href={settings.instagram} target="_blank" rel="noreferrer" style={{display: "inline-flex", alignItems: "center", gap: 10, background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none"}}>
                <InstagramIcon size={22} /> Instagram (@kingstreatabuja)
              </a>
            )}
            {settings.tiktok && (
              <a href={settings.tiktok} target="_blank" rel="noreferrer" style={{display: "inline-flex", alignItems: "center", gap: 10, background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none"}}>
                <TikTokIcon size={22} /> TikTok (@kingtreatsabuja)
              </a>
            )}
            {settings.facebook && (
              <a href={settings.facebook} target="_blank" rel="noreferrer" style={{display: "inline-flex", alignItems: "center", gap: 10, background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none"}}>
                <FacebookIcon size={22} /> Facebook
              </a>
            )}
            {settings.twitter && (
              <a href={settings.twitter} target="_blank" rel="noreferrer" style={{display: "inline-flex", alignItems: "center", gap: 10, background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none"}}>
                <TwitterIcon size={22} /> Twitter / X
              </a>
            )}
          </div>
        </div>
      </div>
      <div>
        {sent ? (
          <div className="success">
            <div style={{fontSize:40,marginBottom:10}}>✉️</div>
            <h3>Message Sent!</h3>
            <p>Your message was delivered to <strong>{targetEmail}</strong>. We'll get back to you within 24 hours.</p>
          </div>
        ) : (
          <div className="form-box">
            <h3 style={{fontSize:16,fontWeight:700,marginBottom:18,color:"#fff"}}>Send a Message</h3>
            <div className="fg">
              {[
                {l:"Name *",n:"name",ph:"Your name"},
                {l:"Email *",n:"email",ph:"you@email.com",t:"email"}
              ].map(f=>(
                <div key={f.n} className="f">
                  <label>{f.l}</label>
                  <input className="fi" name={f.n} type={f.t||"text"} placeholder={f.ph} value={(form as any)[f.n]} onChange={h}/>
                </div>
              ))}
              <div className="f full"><label>Subject</label><input className="fi" name="subject" placeholder="How can we help?" value={form.subject} onChange={h}/></div>
              <div className="f full"><label>Message *</label><textarea className="fi fi-ta" name="message" placeholder="Tell us what you need..." value={form.message} onChange={h}/></div>
              <button 
                className="f-submit" 
                onClick={sendMessage}
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? "⏳ Sending Email..." : "Send Message →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div></div>
  </>);
}
