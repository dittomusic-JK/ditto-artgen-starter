export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { prompt, pills } = req.body || {};
  // Placeholder API (client creates thumbnails locally in MVP)
  return res.status(200).json({
    ok: true,
    promptUsed: `${prompt || ""} — ${(pills||[]).join(", ")}`.trim()
  });
}