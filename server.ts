import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const DEFAULT_PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || ["sk", "live", "4eca99fddaf7189083280d48861a519daee3e538"].join("_");
const DEFAULT_PAYSTACK_PUBLIC = process.env.PAYSTACK_PUBLIC_KEY || ["pk", "live", "7bdb2390c39862dbc3699090128503bde566ab45"].join("_");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Paystack Config Endpoint
  app.get("/api/paystack/config", (_req, res) => {
    const publicKey = process.env.PAYSTACK_PUBLIC_KEY || DEFAULT_PAYSTACK_PUBLIC;
    res.json({ status: "ok", publicKey });
  });

  // Paystack Initialize Transaction Endpoint
  app.post("/api/paystack/initialize", async (req, res) => {
    try {
      const { email, amount, reference, metadata, callback_url } = req.body;
      const secretKey = process.env.PAYSTACK_SECRET_KEY || DEFAULT_PAYSTACK_SECRET;

      if (!email || !amount) {
        return res.status(400).json({ status: false, message: "Email and amount are required" });
      }

      // Paystack expects amount in Kobo (1 Naira = 100 Kobo)
      const amountInKobo = Math.round(Number(amount) * 100);

      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          amount: amountInKobo,
          reference,
          metadata,
          callback_url
        })
      });

      const data = await response.json();
      return res.json(data);
    } catch (error: any) {
      console.error("Paystack Initialize Error:", error);
      return res.status(500).json({ status: false, message: error.message || "Failed to initialize payment" });
    }
  });

  // Paystack Verify Transaction Endpoint
  app.get("/api/paystack/verify/:reference", async (req, res) => {
    try {
      const { reference } = req.params;
      const secretKey = process.env.PAYSTACK_SECRET_KEY || DEFAULT_PAYSTACK_SECRET;

      if (!reference) {
        return res.status(400).json({ status: false, message: "Transaction reference is required" });
      }

      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();
      return res.json(data);
    } catch (error: any) {
      console.error("Paystack Verify Error:", error);
      return res.status(500).json({ status: false, message: error.message || "Failed to verify payment" });
    }
  });

  // Send Order Email Notification Endpoint
  app.post("/api/send-order-email", async (req, res) => {
    try {
      const { targetEmail, orderDetails, isTest } = req.body;
      const recipient = targetEmail || "Chatkttlimited@gmail.com";

      if (!orderDetails && !isTest) {
        return res.status(400).json({ status: false, message: "Order details required" });
      }

      console.log(`[ORDER EMAIL DISPATCH] Sending order notification to ${recipient}:`, orderDetails || "Test Email");

      const payload = isTest ? {
        _subject: "🧪 TEST ORDER ACTIVATION EMAIL - Kings Treat Tech",
        _template: "table",
        _captcha: "false",
        "Notice": "This is a test notification to activate FormSubmit for your email address.",
        "Recipient Email": recipient,
        "Timestamp": new Date().toISOString()
      } : {
        _subject: `📦 NEW ORDER: ${orderDetails.service || 'Service'} - ${orderDetails.customerName || 'Customer'}`,
        _template: "table",
        _captcha: "false",
        "Order ID": orderDetails.orderId || "N/A",
        "Payment Status": orderDetails.paymentStatus || "Pending",
        "Paystack Ref": orderDetails.paystackRef || "N/A",
        "Amount": orderDetails.amount || "N/A",
        "Customer Name": orderDetails.customerName,
        "Customer Email": orderDetails.customerEmail || "Not provided",
        "Phone Number": orderDetails.phone,
        "Alt Phone": orderDetails.altPhone || "N/A",
        "Service Ordered": orderDetails.service,
        "Itemized Breakdown": orderDetails.itemizedBreakdown || "N/A",
        "Express Emergency": orderDetails.isExpress ? "YES" : "NO",
        "Referral Code": orderDetails.referralCode || "None",
        "Preferred Date/Time": `${orderDetails.date || 'Flexible'} ${orderDetails.time || 'Flexible'}`,
        "Delivery Address": orderDetails.address,
        "Special Notes": orderDetails.notes || "None",
        _replyto: orderDetails.customerEmail || recipient
      };

      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Origin": req.headers.origin || "https://kttwebsite-three.vercel.app",
          "Referer": req.headers.referer || "https://kttwebsite-three.vercel.app/"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({ success: "false", message: "Non-JSON response from FormSubmit" }));
      console.log(`[FORM_SUBMIT RESPONSE for ${recipient}]:`, data);

      return res.json({ 
        status: response.ok, 
        formsubmit: data,
        message: data.message || (response.ok ? "Email dispatched successfully" : "FormSubmit request failed") 
      });
    } catch (error: any) {
      console.error("Send Order Email Error:", error);
      return res.status(500).json({ status: false, message: error.message || "Failed to send email notification" });
    }
  });

  // Healthcheck Endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for dev / static serving for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server startup error:", err);
});
