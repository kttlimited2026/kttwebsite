import React, { useState } from "react";
import { Service } from "../types";

export default function SvcCard({ s, onBook }: { s: Service; onBook: () => void; key?: any }) {
  const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);

  const mediaList = s.media || [];
  const activeMedia = mediaList.length > 0 
    ? mediaList[selectedMediaIdx] || mediaList[0] 
    : null;

  return (
    <div className={`svc-card ${s.cardClass}`} onClick={onBook}>
      <div className="svc-stripe" style={{ background: s.stripe }} />
      
      {/* 3D Featured Image / Media Showcase Container */}
      {activeMedia ? (
        <div style={{ padding: "14px 14px 0" }}>
          <div 
            style={{ 
              position: "relative", 
              width: "100%", 
              height: 220, 
              borderRadius: 16, 
              overflow: "hidden", 
              background: "#0d0d0d",
              boxShadow: "0 14px 32px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.12)",
              transform: "translateZ(0)",
              transition: "box-shadow 0.3s ease"
            }}
          >
            {activeMedia.type === "video" ? (
              <video 
                src={activeMedia.url} 
                muted 
                autoPlay 
                loop 
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} 
              />
            ) : (
              <img 
                src={activeMedia.url} 
                alt={activeMedia.name || s.title} 
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "cover", 
                  display: "block",
                  transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)" 
                }} 
              />
            )}
            
            {/* Subtle bottom edge 3D gradient for framing only - keep photo 100% visible */}
            <div 
              style={{ 
                position: "absolute", 
                bottom: 0, 
                left: 0, 
                right: 0, 
                height: 40, 
                background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 100%)",
                pointerEvents: "none"
              }} 
            />

            {/* Glassmorphic Category Badge & Express Badge */}
            <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6, flexWrap: "wrap", zIndex: 2 }}>
              <div 
                style={{ 
                  background: "rgba(15, 15, 15, 0.75)", 
                  backdropFilter: "blur(8px)", 
                  WebkitBackdropFilter: "blur(8px)",
                  padding: "6px 12px", 
                  borderRadius: 20, 
                  fontSize: 11, 
                  fontWeight: 800, 
                  color: "#fff", 
                  letterSpacing: 0.5,
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <span style={{ fontSize: 13 }}>{s.emoji}</span> {s.label}
              </div>

              {(s.id === "laundry" || s.id === "cleaning" || s.label.toLowerCase().includes("laundry") || s.label.toLowerCase().includes("cleaning")) && (
                <div 
                  style={{ 
                    background: "rgba(255, 140, 0, 0.85)", 
                    backdropFilter: "blur(8px)", 
                    padding: "6px 12px", 
                    borderRadius: 20, 
                    fontSize: 10, 
                    fontWeight: 900, 
                    color: "#fff", 
                    letterSpacing: 0.5,
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 4px 12px rgba(255, 140, 0, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  ⚡ {s.id === "laundry" ? "24-Hr Express" : "Emergency Dispatch"}
                </div>
              )}
            </div>

            {/* Media Count / Type Badge */}
            {mediaList.length > 1 && (
              <div 
                style={{ 
                  position: "absolute", 
                  top: 12, 
                  right: 12, 
                  background: "rgba(0, 0, 0, 0.75)", 
                  backdropFilter: "blur(8px)", 
                  padding: "4px 10px", 
                  borderRadius: 20, 
                  fontSize: 11, 
                  fontWeight: 700, 
                  color: s.numColor, 
                  border: `1px solid ${s.numColor}55`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
                }}
              >
                📸 {selectedMediaIdx + 1} / {mediaList.length}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Service Text Content Box - Clean & Unobscured */}
      <div className="svc-body" style={{ paddingTop: activeMedia ? 16 : 24 }}>
        <div>
          <div className="svc-lbl" style={{ color: s.numColor }}>{s.label}</div>
          <div className="svc-num" style={{ color: s.numColor }}>{s.number}</div>
          <div className="svc-title">{s.title}</div>
          <div className="svc-sub">{s.sub}</div>
          {s.description && (
            <div className="svc-desc" style={{ fontSize: 13, color: "#ccc", marginTop: 8, lineHeight: 1.55 }}>
              {s.description}
            </div>
          )}
        </div>
        {!activeMedia && (
          <div className="svc-icon" style={{ background: s.iconBg, borderColor: s.numColor + "44" }}>
            {s.emoji}
          </div>
        )}
      </div>

      <div className="svc-bar-wrap">
        <div className="svc-bar-bg">
          <div className="svc-bar-fill" style={{ background: s.barColor }} />
        </div>
      </div>
      
      {(s.basePrice || s.deliveryFee || s.minOrder) && (
        <div className="svc-price-box">
          {s.basePrice && <span className="price-item">From <strong>₦{s.basePrice}</strong></span>}
          {s.deliveryFee && <span className="price-item">Delivery <strong>₦{s.deliveryFee}</strong></span>}
          {s.minOrder && <span className="price-item">{s.minOrder}</span>}
        </div>
      )}

      <div className="svc-feats">
        {s.features.filter(Boolean).map((f, i) => (
          <div key={i} className="svc-feat">
            <span style={{ color: s.featColor, fontWeight: 700, fontSize: 11 }}>✓</span>
            {f}
          </div>
        ))}
      </div>

      {/* Interactive 3D Gallery Thumbnails */}
      {mediaList.length > 0 && (
        <div className="svc-media-row" style={{ padding: "12px 20px 8px", gap: 10 }}>
          {mediaList.map((m, i) => (
            <div 
              key={i} 
              onClick={(e) => { e.stopPropagation(); setSelectedMediaIdx(i); }}
              title={m.name || `Photo ${i+1}`}
              style={{
                borderRadius: 10,
                overflow: "hidden",
                border: selectedMediaIdx === i ? `2px solid ${s.numColor}` : "1px solid rgba(255,255,255,0.15)",
                boxShadow: selectedMediaIdx === i ? `0 0 12px ${s.numColor}66` : "0 4px 8px rgba(0,0,0,0.4)",
                opacity: selectedMediaIdx === i ? 1 : 0.65,
                cursor: "pointer",
                transform: selectedMediaIdx === i ? "scale(1.06)" : "scale(1)",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                flexShrink: 0
              }}
            >
              {m.type === "video" ? (
                <video src={m.url} className="media-t" muted style={{ width: 52, height: 52, objectFit: "cover", display: "block" }} />
              ) : (
                <img src={m.url} className="media-t" alt={m.name || ""} style={{ width: 52, height: 52, objectFit: "cover", display: "block" }} />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="svc-footer">
        <span className="svc-tap">{s.tap}</span>
        <button className="svc-btn" style={{ background: s.btnBg, color: s.btnColor }} onClick={e => { e.stopPropagation(); onBook(); }}>
          {s.btnLabel}
        </button>
      </div>
    </div>
  );
}
