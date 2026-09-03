# NumCheck — Strip the Narrative

A Chrome/Kiwi extension + Node backend that extracts numerical claims from articles you're reading and shows you the raw numbers from primary sources. No spin, no narrative — just data.

## What it does

When you're reading an article, NumCheck pulls out every stat and percentage mentioned, searches for the underlying primary data (government statistics, international organisations, fact-checkers), and surfaces those sources directly — ranked **Primary/Official → Fact-Check → General Web**.

## Quick Start (Desktop)

```bash
cd server
npm install
npm start
```
Server runs on `http://localhost:4567`.

Then load the `extension/` folder in Chrome (`chrome://extensions` → Developer mode → Load unpacked).

## Deploy to the Cloud (for Android access)

See **[DEPLOY.md](DEPLOY.md)** for a complete beginner-friendly, step-by-step guide. No coding experience needed — just follow the instructions.

## Project Structure

```
numcheck/
├── extension/          # Chrome MV3 extension
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── sidepanel.html
│   ├── sidepanel.js
│   └── icons/
├── server/             # Node/Express backend
│   ├── src/
│   │   ├── server.js
│   │   ├── extractor.js
│   │   ├── search.js
│   │   └── sources.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── render.yaml         # Render.com deployment config
├── DEPLOY.md           # Step-by-step deploy guide for beginners
└── README.md
```

## License

MIT
