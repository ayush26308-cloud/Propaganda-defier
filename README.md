# NumCheck — Strip the Narrative

A Chrome extension + Node backend that extracts numerical claims from articles you're reading and shows you the raw numbers from primary sources. No spin, no narrative — just data.

## Why?

Every topic today comes pre-loaded with spun numbers, cherry-picked stats, and narrative framing from all sides. NumCheck cuts through that: when you're reading an article, it pulls out every stat and percentage mentioned, searches for the underlying primary data (government statistics, international organisations, fact-checkers), and surfaces those sources directly — ranked **Primary/Official → Fact-Check → General Web**.

## How it works

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Chrome Ext     │     │  Node Backend    │     │  Search Layer   │
│                 │     │                  │     │                 │
│  Content script│────▶│  /api/analyze    │────▶│  Google CSE     │
│  extracts text  │     │  extracts claims │     │  Brave Search   │
│                 │     │  builds queries  │     │  DuckDuckGo     │
│  Side panel    │◀────│  groups results  │◀────│  (fallback)     │
│  shows results  │     │  by source type  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Quick Start

### 1. Start the backend

```bash
cd server
npm install
npm start
```

Server runs on `http://localhost:4567`. No API keys needed — it falls back to DuckDuckGo by default. For better results, add a Google CSE or Brave Search API key in `.env` (see `server/.env.example`).

### 2. Load the extension

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `extension/` folder
5. Pin the NumCheck icon to your toolbar

### 3. Use it

- Navigate to any article or news page
- Click the NumCheck icon → side panel opens
- Click **Scan This Page** — it extracts all numerical claims and shows matching primary sources
- Or paste a claim manually in the verify box

## What you see

Each claim is shown as a card with:
- The original sentence (with numbers highlighted in green)
- **Primary/Official Data** sources (green dot) — govt stats, international orgs
- **Fact-Check Coverage** sources (yellow dot) — verified by fact-checkers
- **General Web Results** (blue dot) — everything else

Sources are ranked so you see the raw data before the commentary.

## Project Structure

```
numcheck/
├── extension/
│   ├── manifest.json        # Chrome MV3 manifest
│   ├── background.js         # Service worker (opens side panel)
│   ├── content.js            # Extracts article text from the page
│   ├── sidepanel.html        # UI
│   ├── sidepanel.js           # Panel logic — calls backend, renders results
│   └── icons/                # Extension icons
├── server/
│   ├── src/
│   │   ├── server.js          # Express API (/api/analyze, /api/verify)
│   │   ├── extractor.js       # Claim extraction + query building
│   │   ├── search.js          # Multi-provider search (Google/Brave/DDG)
│   │   └── sources.js         # Curated source registry
│   ├── package.json
│   ├── .env.example
│   └── README.md
└── README.md (this file)
```

## Customizing

### Add trusted sources

Edit `server/src/sources.js` and add domains to the relevant category. New sources are automatically prioritized in search results.

### Change search provider priority

Edit the `providers` array in `server/src/search.js`.

### Change backend URL

Click **⚙ Server settings** in the side panel and enter your backend URL.

## Limitations (honest)

- **Claim extraction is regex-based.** It catches percentages, currency, and large numbers well, but won't catch qualitative claims ("the biggest ever", "unprecedented"). A future version could use an LLM for smarter extraction.
- **Search quality depends on the provider.** DuckDuckGo HTML scraping works but is rate-limited. For production use, add a Google CSE or Brave Search key.
- **No automated verdict.** NumCheck shows you the sources side-by-side but doesn't tell you "true" or "false" — that judgment is yours. This is intentional: the tool surfaces data, it doesn't replace your thinking.
- **Curated sources are India-leaning.** The registry includes international orgs but the independent fact-checkers are Indian. Add more for your region in `sources.js`.

## License

MIT — do whatever you want with it.
