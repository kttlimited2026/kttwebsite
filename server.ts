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
