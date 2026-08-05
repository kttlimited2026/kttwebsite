import React, { useState } from "react";
import Logo from "./Logo";

export default function AdminLogin({ 
  onGoogleLogin, 
  onPasswordLogin, 
  close 
}: { 
  onGoogleLogin: () => void; 
  onPasswordLogin: (password: string) => boolean; 
  close: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [method, setMethod] = useState<"google" | "password">("password");

  const [showForgot, setShowForgot] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!password.trim()) {
      setError("Please enter the admin password.");
      return;
    }
    const success = onPasswordLogin(password.trim());
    if (!success) {
      setError("Incorrect password. Please try again or use Google Auth recovery.");
    }
  };

  return (
    <div className="admin-overlay">
      <div className="admin-login" style={{ maxWidth: 440 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <Logo size={56} />
        </div>
        <h2>KTT Portal</h2>
        <p style={{ marginBottom: 20 }}>Kings Treat Tech — Access Portal</p>

        {/* Login Method Tabs */}
        <div style={{ display: "flex", background: "#111", borderRadius: 8, padding: 4, marginBottom: 20, border: "1px solid #2A2A2A" }}>
          <button 
            type="button"
            onClick={() => { setMethod("password"); setError(""); setShowForgot(false); }}
            style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: method === "password" ? "#FF5E00" : "transparent", color: method === "password" ? "#fff" : "#888", transition: "all 0.2s" }}
          >
            🔑 Admin Password
          </button>
          <button 
            type="button"
            onClick={() => { setMethod("google"); setError(""); setShowForgot(false); }}
            style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: method === "google" ? "#FF5E00" : "transparent", color: method === "google" ? "#fff" : "#888", transition: "all 0.2s" }}
          >
            🔐 Google Auth
          </button>
        </div>

        {method === "password" ? (
          <form onSubmit={handlePasswordSubmit}>
            <div style={{ textAlign: "left", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#ccc" }}>
                  Enter Admin Password / PIN
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgot(!showForgot)}
                  style={{ background: "none", border: "none", color: "#FF5E00", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                >
                  {showForgot ? "Hide Help" : "Forgot Password?"}
                </button>
              </div>

              <input 
                type="password" 
                placeholder="Enter password..."
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                autoFocus
                style={{ width: "100%", padding: "12px 14px", borderRadius: 8, background: "#0A0A0A", border: "1px solid #333", color: "#fff", fontSize: 14, outline: "none" }}
              />
            </div>

            {showForgot && (
              <div style={{ background: "#181205", border: "1px solid #FF9900", borderRadius: 8, padding: "12px 14px", marginBottom: 14, textAlign: "left", fontSize: 12, color: "#ddd", lineHeight: 1.5 }}>
                <strong style={{ color: "#FF9900", display: "block", marginBottom: 4 }}>💡 Password Recovery Steps:</strong>
                <ol style={{ paddingLeft: 18, margin: 0 }}>
                  <li style={{ marginBottom: 4 }}>
                    Switch to the <strong style={{ color: "#39FF14" }}>🔐 Google Auth</strong> tab above and sign in with your registered Google account (<code style={{ color: "#FF9900" }}>chatkttlimited@gmail.com</code> or <code style={{ color: "#FF9900" }}>okpuorba7@gmail.com</code>).
                  </li>
                  <li style={{ marginBottom: 4 }}>
                    This bypasses the password and logs you directly into the Admin Portal.
                  </li>
                  <li>
                    Once inside, go to <strong>Site Settings ➔ Admin Security</strong> to view or change your admin password anytime!
                  </li>
                </ol>
              </div>
            )}

            {error && (
              <div style={{ color: "#FF4D4D", fontSize: 12, marginBottom: 14, textAlign: "left", fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" className="admin-login-btn" style={{ width: "100%", marginTop: 4 }}>
              Unlock Admin Portal ➔
            </button>
          </form>
        ) : (
          <div>
            <p style={{ fontSize: 13, color: "#aaa", marginBottom: 16 }}>
              Sign in with your registered Google account (<strong style={{ color: "#39FF14" }}>Chatkttlimited@gmail.com</strong>, <strong style={{ color: "#39FF14" }}>okpuorba7@gmail.com</strong>, or registered Sub-Admin email).
            </p>
            <button className="admin-login-btn" style={{ width: "100%" }} onClick={onGoogleLogin}>
              🔐 Sign In with Google
            </button>
          </div>
        )}

        <button 
          onClick={close}
          style={{ background: "none", border: "none", color: "#666", marginTop: 18, fontSize: 13, cursor: "pointer", textDecoration: "underline" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

