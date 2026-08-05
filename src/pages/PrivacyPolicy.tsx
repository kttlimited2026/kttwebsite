import { Settings } from "../types";

export default function PrivacyPolicy({ settings }: { settings: Settings }) {
  const contactEmail = settings.email || "Ktt.inquiries@gmail.com";
  const contactPhone = settings.phone || "07066613373";

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="sec-lbl">Legal & Transparency</div>
          <h1 className="fd">Privacy Policy</h1>
          <p>
            Kings Treat Tech Limited ("KTT") is committed to protecting your privacy and managing your personal data securely.
          </p>
        </div>
      </div>

      <div className="sec" style={{ maxWidth: 840, padding: "40px 20px" }}>
        <div 
          style={{ 
            background: "#121212", 
            border: "1px solid #282828", 
            borderRadius: 16, 
            padding: "36px 32px",
            color: "#DDD",
            lineHeight: 1.7,
            fontSize: 15
          }}
        >
          <div style={{ fontSize: 13, color: "#888", marginBottom: 24, fontWeight: 500 }}>
            Effective Date: Last updated January 2026 | Applies to Kings Treat Tech Limited (Web & Mobile Apps)
          </div>

          <section style={{ marginBottom: 28 }}>
            <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              1. Introduction
            </h2>
            <p style={{ margin: 0, color: "#AAA" }}>
              Kings Treat Tech Limited ("KTT", "we", "our", or "us") operates the website and mobile applications providing food delivery, laundry &amp; dry cleaning, and home/office cleaning services across Abuja, Nigeria. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website, place orders, or use our mobile applications.
            </p>
          </section>

          <section style={{ marginBottom: 28 }}>
            <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              2. Information We Collect
            </h2>
            <p style={{ marginBottom: 12, color: "#AAA" }}>
              To fulfill your service bookings and deliver a seamless experience, we collect the following categories of information:
            </p>
            <ul style={{ paddingLeft: 20, margin: 0, color: "#BBB" }}>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "#fff" }}>Personal Contact Information:</strong> Your full name, email address, phone number, and delivery address.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "#fff" }}>Order &amp; Booking Details:</strong> Requested services (food orders, garment care, cleaning requirements), preferred dates/times, and special instructions.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "#fff" }}>Communication History:</strong> Inquiries, customer support messages, and feedback submitted via web forms, email, or WhatsApp.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "#fff" }}>Technical Data:</strong> Device IP address, browser type, operating system, and session usage logs necessary for platform security and performance optimization.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: 28 }}>
            <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              3. How We Use Your Information
            </h2>
            <p style={{ marginBottom: 12, color: "#AAA" }}>
              We process your personal data strictly for legitimate business operations, including:
            </p>
            <ul style={{ paddingLeft: 20, margin: 0, color: "#BBB" }}>
              <li style={{ marginBottom: 8 }}>Processing, scheduling, and executing your food delivery, laundry, and cleaning bookings.</li>
              <li style={{ marginBottom: 8 }}>Dispatching automated order confirmations and status updates to your email and phone.</li>
              <li style={{ marginBottom: 8 }}>Connecting our verified delivery riders and cleaning staff with your pickup/delivery address.</li>
              <li style={{ marginBottom: 8 }}>Responding to customer inquiries and providing technical support.</li>
              <li style={{ marginBottom: 8 }}>Preventing fraudulent transactions and ensuring network security.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 28 }}>
            <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              4. Data Sharing &amp; Disclosure
            </h2>
            <p style={{ marginBottom: 12, color: "#AAA" }}>
              We respect your privacy. <strong style={{ color: "#39FF14" }}>We do NOT sell, rent, or trade your personal information to third-party marketers.</strong> Information is shared solely under the following conditions:
            </p>
            <ul style={{ paddingLeft: 20, margin: 0, color: "#BBB" }}>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "#fff" }}>Service Personnel:</strong> Sharing necessary contact and address details with assigned dispatch riders, laundry teams, or cleaning professionals for order fulfillment.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "#fff" }}>Cloud &amp; Infrastructure Providers:</strong> Secure database storage hosted on Google Cloud / Firebase platforms with enterprise-grade encryption.
              </li>
              <li style={{ marginBottom: 8 }}>
                <strong style={{ color: "#fff" }}>Legal Compliance:</strong> When required by Nigerian law enforcement, court orders, or regulatory bodies to protect the safety and rights of KTT and our users.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: 28 }}>
            <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              5. Data Security &amp; Protection
            </h2>
            <p style={{ margin: 0, color: "#AAA" }}>
              We enforce strict technical and administrative security measures to protect your personal information against unauthorized access, loss, or alteration. All database transmissions are encrypted using SSL/TLS, and access to customer records is restricted strictly to authorized staff.
            </p>
          </section>

          <section style={{ marginBottom: 28 }}>
            <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              6. Your Rights &amp; Choices
            </h2>
            <p style={{ marginBottom: 12, color: "#AAA" }}>You have the right to:</p>
            <ul style={{ paddingLeft: 20, margin: 0, color: "#BBB" }}>
              <li style={{ marginBottom: 8 }}>Request a copy of the personal information we hold about you.</li>
              <li style={{ marginBottom: 8 }}>Request corrections to inaccurate contact or address details.</li>
              <li style={{ marginBottom: 8 }}>Request deletion of your account or booking history from our active databases.</li>
            </ul>
            <p style={{ marginTop: 12, color: "#AAA" }}>
              To exercise any of these rights, please email our support team at <strong style={{ color: "#fff" }}>{contactEmail}</strong>.
            </p>
          </section>

          <section style={{ marginBottom: 28 }}>
            <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              7. Cookies &amp; Local Storage
            </h2>
            <p style={{ margin: 0, color: "#AAA" }}>
              Our website uses session storage and essential cookies to maintain your login status, cart selections, and preference settings. You can manage or block cookies through your browser settings, though some interactive features may require essential cookies to function properly.
            </p>
          </section>

          <section style={{ marginBottom: 28 }}>
            <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              8. Contact Us
            </h2>
            <p style={{ marginBottom: 12, color: "#AAA" }}>
              If you have any questions, concerns, or privacy requests regarding this Privacy Policy, please contact us at:
            </p>
            <div 
              style={{ 
                background: "#1A1A1A", 
                border: "1px solid #333", 
                borderRadius: 12, 
                padding: "16px 20px",
                fontSize: 14,
                color: "#CCC" 
              }}
            >
              <div style={{ color: "#fff", fontWeight: 700, marginBottom: 4 }}>Kings Treat Tech Limited</div>
              <div>📍 Address: {settings.address || "First gate Apo mechanic Estate, opposite Dubison oil, Abuja, Nigeria"}</div>
              <div>📧 Email: {contactEmail}</div>
              <div>📞 Phone: {contactPhone} {settings.managerPhone ? ` / ${settings.managerPhone}` : ""}</div>
              <div>💬 WhatsApp Only: +234 816 088 0608</div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
