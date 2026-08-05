const DEFAULT_PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || ["sk", "live", "4eca99fddaf7189083280d48861a519daee3e538"].join("_");

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { reference } = req.query || {};
    const secretKey = process.env.PAYSTACK_SECRET_KEY || DEFAULT_PAYSTACK_SECRET;

    if (!reference) {
      return res.status(400).json({ status: false, message: "Reference is required" });
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${secretKey}`
      }
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Paystack Vercel Verify Error:", error);
    return res.status(500).json({ status: false, message: error.message || "Failed to verify transaction" });
  }
}
