const DEFAULT_PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || ["sk", "live", "4eca99fddaf7189083280d48861a519daee3e538"].join("_");

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ status: false, message: "Method not allowed" });
  }

  try {
    const { email, amount, reference, metadata, callback_url } = req.body || {};
    const secretKey = process.env.PAYSTACK_SECRET_KEY || DEFAULT_PAYSTACK_SECRET;

    if (!email || !amount) {
      return res.status(400).json({ status: false, message: "Email and amount are required" });
    }

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
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Paystack Vercel Initialize Error:", error);
    return res.status(500).json({ status: false, message: error.message || "Failed to initialize payment" });
  }
}
