export default async function handler(req, res) {
  const { url } = req.query || {};
  if (!url) return res.status(400).json({ error: "Missing url" });

  try {
    const r = await fetch(url);
    if (!r.ok) return res.status(500).json({ error: "Fetch failed", status: r.status });
    const mime = r.headers.get("content-type") || "image/png";
    const ab = await r.arrayBuffer();
    const b64 = Buffer.from(ab).toString("base64");
    return res.status(200).json({ dataUrl: `data:${mime};base64,${b64}` });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e) });
  }
}
