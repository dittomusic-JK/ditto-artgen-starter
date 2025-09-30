// Serverless function on Vercel that calls Replicate to generate 4 images
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, pills } = req.body || {};
    const fullPrompt = [prompt, ...(pills ? Object.values(pills).flat() : [])]
      .filter(Boolean)
      .join(", ");

    // Kick off a prediction using the model endpoint (no version hash needed)
    const createResp = await fetch(
      "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions",
      {
        method: "POST",
        headers: {
          "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          input: {
            prompt: fullPrompt || "album cover, minimalist, high contrast",
            num_outputs: 4,
            width: 1024,
            height: 1024,
            guidance: 3.5
          }
        })
      }
    );

    if (!createResp.ok) {
      const t = await createResp.text();
      return res.status(500).json({ error: "Replicate create failed", detail: t });
    }

    const prediction = await createResp.json();

    // Poll until it finishes (succeeds or fails)
    let status = prediction.status;
    let result = prediction;
    const pollUrl = prediction.urls?.get;

    const started = Date.now();
    const TIMEOUT_MS = 60_000; // 60s max (Vercel function limit is usually 10–60s)

    while (status === "starting" || status === "processing") {
      if (Date.now() - started > TIMEOUT_MS) {
        return res.status(504).json({ error: "Generation timed out" });
      }
      await new Promise(r => setTimeout(r, 1500));
      const pollResp = await fetch(pollUrl, {
        headers: { "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}` }
      });
      result = await pollResp.json();
      status = result.status;
    }

    if (status !== "succeeded") {
      return res.status(500).json({ error: "Generation failed", detail: result?.error || status });
    }

    // result.output is an array of image URLs (hosted by Replicate)
    const images = Array.isArray(result.output) ? result.output : [];
    return res.status(200).json({ images, promptUsed: fullPrompt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", detail: String(err) });
  }
}
