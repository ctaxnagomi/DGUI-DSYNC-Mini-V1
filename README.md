# DGUI DSYNC — Mini (V1)

**Autonomous video-to-slide workflow with voice cloning and multi-format export.**

DSYNC Mini turns short video/audio input into polished, presentable slides — synchronised and exportable in the formats you actually need. Built as a lightweight, single-purpose React app on top of Gemini.

## Features

- **Video → Slides** — autonomous conversion of video/audio input into a slide deck
- **Voice Recorder** — capture narration directly in the browser (microphone permission)
- **Theme Selector** — switch presentation themes on the fly
- **Multi-format export** — export to **PPTX**, **PDF**, and **DOCX**
- **Live preview** — see slides update as you build

## Tech Stack

- React 19 + TypeScript + Vite
- Google Generative AI SDK (`@google/genai`)
- `pptxgenjs` · `jspdf` · `docx` for export
- Tailwind CSS v4

## Getting Started

**Prerequisites:** Node.js

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set your Gemini API key in `.env.local`:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Run the app:

   ```bash
   npm run dev
   ```

   The dev server runs on `http://localhost:3000`.

### Production

```bash
npm run build
npm run preview
```

## Scripts

| Command           | Description                            |
| ----------------- | -------------------------------------- |
| `npm run dev`     | Start the Vite dev server (port 3000) |
| `npm run build`   | Build the production bundle            |
| `npm run preview` | Preview the production build           |
| `npm run lint`    | Type-check with `tsc --noEmit`         |
