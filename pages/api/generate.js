export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.REPLICATE_API_TOKEN;
  const version = process.env.FLUX_SCHNELL_VERSION; // <-- set this in Vercel

  if (!token) {
    return res.status(500).json({ error: "Missing REPLICATE_API_TOKEN in env" });
  }
  if (!version) {
    return res.status(500).json({ error: "Missing FLUX_SCHNELL_VERSION in env" });
  }

  try {
    const { prompt, pills } = req.body || {};
    const fullPrompt = [prompt, ...(pills ? Object.values(pills).flat() : [])]
      .filter(Boolean)
      .join(", ")
      .trim() || "album cover, minimalist, high contrast";

    // Use the generic endpoint WITH a version hash and wait up to 60s.
    // Replicate docs: you can pass ?wait=n (1..60) so the request returns after it finishes. :contentReference[oaicite:1]{index=1}
    const resp = await fetch("https://api.replicate.com/v1/predictions?wait=60", {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version,             // REQUIRED for community models
        input: {
          prompt: fullPrompt,
          num_outputs: 4,    // four images
          width: 1024,
          height: 1024,
          guidance: 3.5
        }
      })
    });

    const data = await resp.json();
    if (!resp.ok) {
      // Surface Replicate's error back to the UI for easier debugging
      return res.status(500).json({ error: "Replicate create failed", detail: data });
    }

    // data.output should be an array of hosted image URLs
    const images = Array.isArray(data.output) ? data.output : [];
    return res.status(200).json({ images, promptUsed: fullPrompt });
  } catch (err) {
    return res.status(500).json({ error: "Server error", detail: String(err) });
  }
}
