# Angloville LP Builder

Landing page generator for Angloville — generates WordPress-ready HTML using Claude API.

## Features

- **Generator** — paste source code or brief, AI builds a full landing page
- **HTML Preview** — live preview with desktop/tablet/mobile switching
- **Code View** — copy-ready HTML output
- **Inline Editor** — edit HTML directly, apply changes to preview
- **Reference LP** — base new pages on existing page layouts
- **Image Replacer** — paste HTML, find all images, swap URLs, export

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import repo
3. Before clicking Deploy, add **Environment Variable**:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your key from [console.anthropic.com](https://console.anthropic.com/settings/keys)
4. Click **Deploy** — done

The API key stays on the server (in `/api/generate.js` serverless function) and is never exposed to the browser.

## Local Development

```bash
cp .env.example .env        # add your ANTHROPIC_API_KEY
npm install
npx vercel dev              # runs both Vite + serverless functions locally
```

## Tech Stack

- React 18 + Vite
- Vercel Serverless Functions (API proxy)
- Claude API (Sonnet 4) for HTML generation
- Zero external UI dependencies
