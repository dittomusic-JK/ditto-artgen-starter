# Ditto Artwork Generator — MVP Starter (Next.js + Vercel)

This is a **non-dev friendly** starter you can deploy in minutes.

## What it includes
- One-page app with:
  - **Generator**: prompt + genre pills + 4 preview thumbnails (placeholders for now)
  - **Selected artwork**: large preview, add **Artist/Title**, choose **font/size/color**, alignment & vertical position, **safe zone**, and **Export 3000×3000 PNG**
- API stub at `/api/generate` (not required for MVP — UI makes placeholders client-side).

## How to deploy (no terminal needed)
1. **Download the ZIP** from ChatGPT.
2. **Unzip** it on your computer.
3. Go to **https://vercel.com/new** (log in).
4. Click **“Import…” → “Drag & Drop”** and **drop the unzipped folder**.
5. Vercel will detect **Next.js** and deploy automatically.
6. You’ll get a URL like `https://your-project.vercel.app` — open it.

> Optional: connect a GitHub repo if you want version control.

## Replace placeholders with real AI images (later)
- Add your provider key as an **Environment Variable** in Vercel.
- Update `pages/api/generate.js` to call your provider (Fireworks, Fal, Stability).
- Update the client `onGenerate()` to use the URLs returned by the API.

## Notes
- Fonts are loaded via Google Fonts (10 curated, safe choices).
- Export uses a **client-side canvas** — ensure your generated images have **CORS** enabled when you switch to real images (or proxy via your API).

Enjoy!