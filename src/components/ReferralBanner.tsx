import React, { useState } from "react";
import { Settings } from "../types";
import { dbService } from "../services/dbService";

export default function ReferralBanner({ settings, onBookWithCode }: { settings?: Settings; onBookWithCode?: (code: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [referrerInput, setReferrerInput] = useState("");
  const [showLookup, setShowLookup] = useState(false);
  const [lookupQuery, setLookupQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [lookupResult, setLookupResult] = useState<{ 
    countReferred: number; 
    ownBookingsCount: number;
    grossEarned: number; 
    totalRedeemed: number; 
    netAvailableBalance: number; 
    codeUsed: string; 
    queryPhone: string;
    checked: boolean 
  } | null>(null);

  if (settings?.referralEnabled === false) return null;

  const headline = settings?.referralHeadline || "Refer a Neighbor or Friend — Give ₦1,000, Get ₦1,000!";
  const minOrderAmount = settings?.referralMinOrder || "5000";
  const description = settings?.referralDescription || `Word-of-mouth is our pride. Share your unique phone number referral code with a friend or neighbor in Abuja. When they book any service of ₦${Number(minOrderAmount).toLocaleString()} or more, they get ₦1,000 off, and YOU earn ₦1,000 reward credit!`;
  const discountAmount = settings?.referralDiscountAmount || "1000";
  const codePrefix = settings?.referralCodePrefix || "REF";

  // Build clean personalized referral code based on user's unique phone number input or default
  const cleanPhoneInput = referrerInput.trim().replace(/[^0-9]/g, "");
  const promoCode = cleanPhoneInput ? `${codePrefix}-${cleanPhoneInput}` : `${codePrefix}-08160880608`;

  const shareLink = `${window.location.origin}${window.location.pathname}?ref=${promoCode}`;
  const shareText = `Hey! I use KTT Home & Laundry Services in Abuja. Use my referral link or code *${promoCode}* to get ₦${Number(discountAmount).toLocaleString()} off your first booking of ₦${Number(minOrderAmount).toLocaleString()}+! 🧼🏠 Order here: ${shareLink}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const copyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCheckBalance = async () => {
    const rawQuery = lookupQuery.trim();
    if (!rawQuery) return;
    setSearching(true);
    try {
      const allBookings = await dbService.getBookings();
      
      // Extract numeric digits from search query
      let queryDigits = rawQuery.replace(/[^0-9]/g, "");
      if (queryDigits.startsWith("234") && queryDigits.length >= 12) {
        queryDigits = "0" + queryDigits.slice(3);
      }
      const queryCleanLower = rawQuery.toLowerCase();

      const singleReward = Number(discountAmount);

      // 1. Friends referred: bookings placed where referralCodeApplied matches this phone/code
      const friendBookings = allBookings.filter(b => {
        if (!b.referralCodeApplied) return false;
        const refApplied = b.referralCodeApplied.toLowerCase().replace(/[^a-z0-9]/g, "");
        const cleanQ = queryCleanLower.replace(/[^a-z0-9]/g, "");
        
        const codeMatch = refApplied.includes(cleanQ) || 
                          (queryDigits.length >= 5 && refApplied.includes(queryDigits));
        if (!codeMatch) return false;

        // Exclude self-booking if phone matches
        const bookingPhoneDigits = (b.phone || "").replace(/[^0-9]/g, "");
        if (queryDigits.length >= 6 && bookingPhoneDigits.length >= 6) {
          if (bookingPhoneDigits.includes(queryDigits) || queryDigits.includes(bookingPhoneDigits)) {
            return false;
          }
        }
        return true;
      });

      // 2. Own bookings placed by this phone number
      const ownBookings = allBookings.filter(b => {
        const bookingPhoneDigits = (b.phone || "").replace(/[^0-9]/g, "");
        return queryDigits.length >= 6 && bookingPhoneDigits.length >= 6 &&
          (bookingPhoneDigits.includes(queryDigits) || queryDigits.includes(bookingPhoneDigits));
      });

      // 3. Redeemed discount bookings placed by this referrer
      const redeemedBookings = ownBookings.filter(b => 
        Number(b.referralDiscountAmount || 0) > 0 || (b.referralCodeApplied && b.referralCodeApplied.trim() !== "")
      );

      const countReferred = friendBookings.length;
      const grossEarned = countReferred * singleReward;
      const totalRedeemed = redeemedBookings.reduce((sum, b) => sum + Number(b.referralDiscountAmount || 0), 0);
      const netAvailableBalance = Math.max(0, grossEarned - totalRedeemed);

      const displayCode = queryDigits.length >= 6 ? `${codePrefix}-${queryDigits}` : rawQuery.toUpperCase();

      setLookupResult({
        countReferred,
        ownBookingsCount: ownBookings.length,
        grossEarned,
        totalRedeemed,
        netAvailableBalance,
        codeUsed: displayCode,
        queryPhone: queryDigits || rawQuery,
        checked: true
      });
    } catch (err) {
      console.error("Failed to check referral earnings:", err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div 
      style={{
        background: "linear-gradient(135deg, #162416 0%, #0A140A 100%)",
        border: "1px solid rgba(57, 255, 20, 0.35)",
        borderRadius: 20,
        padding: "26px 28px",
        margin: "24px 0 32px",
        boxShadow: "0 12px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(57, 255, 20, 0.2)",
        position: "relative",
        overflow: "hidden",
        color: "#ffffff"
      }}
    >
      {/* Background glow circle */}
      <div 
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: 180,
          height: 180,
          background: "radial-gradient(circle, rgba(57,255,20,0.15) 0%, rgba(0,0,0,0) 70%)",
          pointerEvents: "none"
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap", justifyContent: "space-between" }}>
        
        {/* Left Column - Headline & Details */}
        <div style={{ flex: "1 1 340px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(57, 255, 20, 0.12)", border: "1px solid rgba(57, 255, 20, 0.3)", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, color: "#39FF14", marginBottom: 12 }}>
            <span>🤝</span> 2-WAY REFERRAL &amp; REWARD PROGRAM
          </div>

          <h3 style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", margin: "0 0 10px 0", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {headline}
          </h3>

          <p style={{ fontSize: 14, color: "#cccccc", lineHeight: 1.6, margin: "0 0 18px 0", maxWidth: 580 }}>
            {description}
          </p>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", fontSize: 13, color: "#39FF14", fontWeight: 700 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(57, 255, 20, 0.08)", border: "1px solid rgba(57, 255, 20, 0.25)", padding: "6px 12px", borderRadius: 8 }}>
              ✓ Friend saves ₦{Number(discountAmount).toLocaleString()}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(57, 255, 20, 0.08)", border: "1px solid rgba(57, 255, 20, 0.25)", padding: "6px 12px", borderRadius: 8 }}>
              ✓ You earn ₦{Number(discountAmount).toLocaleString()} credit
            </span>
          </div>

          <button
            onClick={() => setShowLookup(!showLookup)}
            style={{
              marginTop: 18,
              background: showLookup 
                ? "linear-gradient(90deg, #333333 0%, #1A1A1A 100%)" 
                : "linear-gradient(90deg, #FF9900 0%, #FF5E00 100%)",
              border: showLookup ? "1px solid #555" : "none",
              color: "#ffffff",
              borderRadius: 10,
              padding: "12px 22px",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: showLookup ? "none" : "0 4px 16px rgba(255, 94, 0, 0.45)",
              transition: "all 0.2s ease-in-out"
            }}
          >
            <span>🔍</span> {showLookup ? "Close Earnings Checker" : "Check My Referral Earnings & Balance"}
          </button>
        </div>

        {/* Right Column - Personalized Generator Card */}
        <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 12, minWidth: 280, width: "100%", maxWidth: 360 }}>
          <div style={{ background: "#0D170D", border: "1px solid rgba(57, 255, 20, 0.3)", borderRadius: 12, padding: "14px 16px" }}>
            <label style={{ fontSize: 11, textTransform: "uppercase", color: "#39FF14", fontWeight: 800, letterSpacing: 0.5, display: "block", marginBottom: 6 }}>
              📱 Enter Phone Number to Create Link
            </label>
            <input 
              type="tel" 
              placeholder="e.g. 08160880608"
              value={referrerInput}
              onChange={e => setReferrerInput(e.target.value)}
              style={{
                width: "100%",
                background: "#050A05",
                border: "1px solid #223A22",
                color: "#ffffff",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 13,
                outline: "none",
                marginBottom: 10,
                boxSizing: "border-box"
              }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div>
                <div style={{ fontSize: 10, color: "#888888", fontWeight: 600 }}>Your Referral Code:</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#39FF14", fontFamily: "monospace" }}>{promoCode}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button 
                  onClick={copyCode}
                  style={{
                    background: copied ? "#39FF14" : "rgba(255,255,255,0.1)",
                    color: copied ? "#000" : "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 10px",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {copied ? "✓ Copied" : "📋 Code"}
                </button>
                <button 
                  onClick={copyLink}
                  style={{
                    background: copiedLink ? "#39FF14" : "rgba(57,255,20,0.18)",
                    color: copiedLink ? "#000" : "#39FF14",
                    border: "1px solid rgba(57,255,20,0.4)",
                    borderRadius: 6,
                    padding: "6px 10px",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  {copiedLink ? "✓ Link Copied" : "🔗 Link"}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <a 
              href={whatsappShareUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1,
                background: "#25D366",
                color: "#000000",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 12,
                fontWeight: 800,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6
              }}
            >
              💬 Share on WhatsApp
            </a>
            {onBookWithCode && (
              <button
                onClick={() => onBookWithCode(promoCode)}
                style={{
                  flex: 1,
                  background: "#39FF14",
                  color: "#0A0A0A",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4
                }}
              >
                🏷️ Claim ₦{Number(discountAmount).toLocaleString()} Off
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Earnings & Reward Credit Balance Lookup Drawer */}
      {showLookup && (
        <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(57, 255, 20, 0.2)", background: "#0A140A", borderRadius: 12, padding: 18 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(57, 255, 20, 0.15)", border: "1px solid rgba(57, 255, 20, 0.4)", color: "#39FF14", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, marginBottom: 10 }}>
            🔍 REFERRAL BALANCE CHECKER
          </div>
          
          <h4 style={{ margin: "0 0 6px 0", fontSize: 16, fontWeight: 800, color: "#39FF14" }}>
            💳 Check Your Accumulated Referral Earnings &amp; Available Credits
          </h4>
          
          <p style={{ margin: "0 0 12px 0", fontSize: 13, color: "#aaa", lineHeight: 1.5 }}>
            Type your phone number below (e.g. <span style={{ color: "#39FF14" }}>08160880608</span> or <span style={{ color: "#39FF14" }}>REF-08160880608</span>) and click <strong>Check Balance</strong> to view your friends referred and live credit balance:
          </p>

          {/* Form wrapper so pressing Enter triggers search automatically */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleCheckBalance(); }}
            style={{ display: "flex", gap: 10, maxWidth: 500, flexWrap: "wrap", marginBottom: 12 }}
          >
            <input 
              type="tel" 
              placeholder="Enter phone number e.g. 08160880608"
              value={lookupQuery}
              onChange={e => { setLookupQuery(e.target.value); }}
              style={{
                flex: "1 1 220px",
                background: "#000000",
                border: "1px solid #223A22",
                color: "#ffffff",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 14,
                outline: "none"
              }}
            />
            <button
              type="submit"
              disabled={searching}
              style={{
                background: "#39FF14",
                color: "#000000",
                border: "none",
                borderRadius: 8,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              {searching ? "Searching..." : "Check Balance ➔"}
            </button>
          </form>

          {/* Live Search Result Output */}
          {lookupResult && lookupResult.checked && (
            <div style={{ marginTop: 14, background: "#112211", border: "1px solid #39FF14", borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <span>📊 Referral Status for Code: <code style={{ color: "#39FF14", background: "rgba(57,255,20,0.15)", padding: "2px 8px", borderRadius: 4 }}>{lookupResult.codeUsed}</code></span>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(57,255,20,0.2)", color: "#39FF14", padding: "2px 8px", borderRadius: 12 }}>Verified Live</span>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap", fontSize: 13 }}>
                <div style={{ background: "#050F05", padding: "10px 14px", borderRadius: 8, border: "1px solid #1A3A1A", flex: "1 1 130px" }}>
                  <div style={{ color: "#888", fontSize: 11 }}>Bookings Placed</div>
                  <div style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>{lookupResult.ownBookingsCount} order(s)</div>
                  <div style={{ color: "#888", fontSize: 11 }}>by this phone</div>
                </div>

                <div style={{ background: "#050F05", padding: "10px 14px", borderRadius: 8, border: "1px solid #1A3A1A", flex: "1 1 130px" }}>
                  <div style={{ color: "#888", fontSize: 11 }}>Friends Referred</div>
                  <div style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>{lookupResult.countReferred} person(s)</div>
                  <div style={{ color: "#39FF14", fontSize: 11 }}>+₦{lookupResult.grossEarned.toLocaleString()} earned</div>
                </div>

                <div style={{ background: "#050F05", padding: "10px 14px", borderRadius: 8, border: "1px solid #1A3A1A", flex: "1 1 130px" }}>
                  <div style={{ color: "#888", fontSize: 11 }}>Credits Redeemed</div>
                  <div style={{ color: lookupResult.totalRedeemed > 0 ? "#FF6B6B" : "#aaa", fontSize: 16, fontWeight: 800 }}>-₦{lookupResult.totalRedeemed.toLocaleString()}</div>
                  <div style={{ color: "#888", fontSize: 11 }}>applied on orders</div>
                </div>

                <div style={{ background: "#0A200A", padding: "10px 14px", borderRadius: 8, border: "1px solid #39FF14", flex: "1 1 150px" }}>
                  <div style={{ color: "#39FF14", fontSize: 11, fontWeight: 700 }}>AVAILABLE CREDIT BALANCE</div>
                  <div style={{ color: "#39FF14", fontSize: 20, fontWeight: 900 }}>₦{lookupResult.netAvailableBalance.toLocaleString()}</div>
                  <div style={{ color: "#aaa", fontSize: 11 }}>Net available to spend</div>
                </div>
              </div>

              {lookupResult.countReferred === 0 && (
                <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(255,255,255,0.05)", borderRadius: 8, color: "#ccc", fontSize: 12, lineHeight: 1.5 }}>
                  ℹ️ No referred bookings found yet for phone / code <code style={{ color: "#39FF14" }}>{lookupResult.codeUsed}</code>. Once your friend completes a booking of ₦{Number(minOrderAmount).toLocaleString()}+ with your referral link or code, your ₦{Number(discountAmount).toLocaleString()} reward credit will show up here!
                </div>
              )}

              {lookupResult.netAvailableBalance > 0 && onBookWithCode && (
                <button
                  onClick={() => onBookWithCode(lookupResult.codeUsed)}
                  style={{
                    marginTop: 14,
                    background: "linear-gradient(90deg, #39FF14, #28C80F)",
                    color: "#000000",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 18px",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    width: "100%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6
                  }}
                >
                  🛍️ Book &amp; Apply Available ₦{lookupResult.netAvailableBalance.toLocaleString()} Credit →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

