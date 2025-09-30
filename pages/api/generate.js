import Replicate from "replicate";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "Missing REPLICATE_API_TOKEN in env" });
  }

  try {
    const { prompt, pills } = req.body || {};
    const fullPrompt =
      [prompt, ...(pills ? Object.values(pills).flat() : [])]
        .filter(Boolean)
        .join(", ")
        .trim() || "album cover, minimalist, high contrast";

    const replicate = new Replicate({ auth: token });

    // Run FLUX Schnell — fast, 1:1 covers
    const output = await replicate.run("black-forest-labs/flux-schnell", {
      input: {
        prompt: fullPrompt,
        num_outputs: 4,
        width: 1024,
        height: 1024,
        guidance: 3.5
      }
    });

    // output is typically an array of Replicate File objects (or URLs)
    const images = [];
    for (const item of output || []) {
      if (typeof item === "string") {
        images.push(item);
      } else if (item && typeof item.url === "function") {
        images.push(item.url());
      }
    }

    if (!images.length) {
      return res.status(500).json({ error: "No images returned from Replicate", detail: output });
    }

    res.status(200).json({ images, promptUsed: fullPrompt });
  } catch (err) {
    console.error("Replicate error", err);
    res.status(500).json({ error: "Replicate create failed", detail: String(err) });
  }
}
