import React from "react";
import { Settings } from "../types";

export default function ExpressBadge({ settings, onBookExpress }: { settings?: Settings; onBookExpress?: () => void }) {
  if (settings?.expressEnabled === false) return null;

  const title = settings?.expressBadgeTitle || "⚡ Express 24-Hr Delivery & Emergency Same-Day Cleaning";
  const sub = settings?.expressBadgeSub || "Need urgent laundry before an event or emergency home cleaning for sudden guests? Request express 24-hr turnaround or same-day dispatch!";
  const fee = settings?.expressFee || "5000";

  return (
    <div 
      style={{
        background: "linear-gradient(135deg, #241400 0%, #120A00 100%)",
        border: "1px solid rgba(255, 140, 0, 0.4)",
        borderRadius: 20,
        padding: "24px 28px",
        margin: "24px 0 32px",
        boxShadow: "0 12px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255, 140, 0, 0.2)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div 
        style={{
          position: "absolute",
          bottom: "-40px",
          left: "-40px",
          width: 180,
          height: 180,
          background: "radial-gradient(circle, rgba(255,140,0,0.18) 0%, rgba(0,0,0,0) 70%)",
          pointerEvents: "none"
        }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255, 140, 0, 0.15)", border: "1px solid rgba(255, 140, 0, 0.4)", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800, color: "#FF8C00", marginBottom: 10 }}>
            <span>⚡</span> SAME-DAY &amp; 24-HOUR EXPRESS SERVICE
          </div>
          <h3 style={{ fontSize: 21, fontWeight: 800, color: "#fff", margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
            {title}
          </h3>
          <p style={{ fontSize: 14, color: "#ddd", lineHeight: 1.5, margin: 0, maxWidth: 620 }}>
            {sub}
          </p>
          <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap", fontSize: 13, color: "#bbb" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#FFB03B", fontWeight: 700 }}>
              ⏱️ 24-Hr Express Laundry Pickup &amp; Return
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#FFB03B", fontWeight: 700 }}>
              🚀 Emergency Same-Day Cleaner Dispatch
            </span>
          </div>
        </div>

        <div style={{ flex: "0 0 auto", textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#aaa", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5, marginBottom: 2 }}>
            Express Option
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#FF8C00", marginBottom: 12 }}>
            +₦{Number(fee).toLocaleString()} <span style={{ fontSize: 12, fontWeight: 500, color: "#aaa" }}>surcharge</span>
          </div>
          {onBookExpress && (
            <button
              onClick={onBookExpress}
              style={{
                background: "linear-gradient(90deg, #FF8C00, #FF5E00)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "12px 22px",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(255, 140, 0, 0.35)",
                transition: "transform 0.2s ease"
              }}
            >
              ⚡ Request Express Service
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
