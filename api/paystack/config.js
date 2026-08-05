const DEFAULT_PAYSTACK_PUBLIC = process.env.PAYSTACK_PUBLIC_KEY || ["pk", "live", "7bdb2390c39862dbc3699090128503bde566ab45"].join("_");

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const publicKey = process.env.PAYSTACK_PUBLIC_KEY || DEFAULT_PAYSTACK_PUBLIC;
  return res.status(200).json({ status: "ok", publicKey });
}
