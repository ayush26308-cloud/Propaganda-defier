# NumCheck — Strip the Narrative

A browser extension that runs **entirely on your device**. It extracts numerical claims from what you're reading or watching — articles, YouTube videos, X posts, Instagram — and shows you the raw data from primary sources. No server. No ads. No tracking. No account. Free and open source.

## Why?

Every platform today — news sites, YouTube, X, Instagram — serves you numbers wrapped in agenda. A YouTuber says "unemployment dropped by 45%." An X post claims "₹2,000 crore allocated for rural jobs." An Instagram reel says "crime rose 30%." Who's right? Where did those numbers come from? By the time you finish reading or watching, the spin has already done its job. You never saw the raw data — you saw someone's interpretation of it.

NumCheck fixes this. It sits in your browser, reads along with you, pulls out every stat and number, and searches for the primary data behind each one.

## How it works

NumCheck runs as a browser extension (Kiwi Browser on Android, Chrome on desktop). **Everything happens locally on your device.** No backend server, no cloud, no data collection.

It works on four types of content:

1. **Articles** — On any news website, NumCheck reads the article text and extracts every numerical claim.
2. **YouTube Videos** — Pulls the video's transcript/captions automatically and extracts claims from what's spoken.
3. **X (Twitter)** — Reads post text and extracts any numbers or stats.
4. **Instagram** — Reads post captions and extracts claims.

For each claim, NumCheck searches 45+ curated primary sources and shows results ranked:

- 🟢 **Primary / Official Data** — Government stats, international orgs (MoSPI, RBI, World Bank, IMF, WHO, OECD, etc.)
- 🟡 **Fact-Check Coverage** — Verified by independent fact-checkers (Alt News, BOOM, Reuters Fact Check, etc.)
- 🔵 **General Web Results** — Everything else

## Install

### Android (Kiwi Browser)

1. Install **Kiwi Browser** from Play Store
2. Download this extension folder to your phone
3. Open `kiwi://extensions` in Kiwi
4. Enable **Developer mode**
5. Click **Load unpacked** → select the extension folder
6. Pin NumCheck to your toolbar

### Desktop (Chrome / Edge / Brave)

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the extension folder

## Use it

- Go to any article, YouTube video, X post, or Instagram page
- Click the NumCheck icon → side panel opens
- Click **Scan This Page**
- See the raw numbers from primary sources

## Project structure

```
numcheck-local/
├── manifest.json        # Chrome MV3 manifest
├── background.js        # Service worker (opens side panel)
├── content.js           # Page text extraction (articles, YouTube, X, Instagram)
├── sidepanel.html       # UI
├── sidepanel.js         # Panel logic (calls search, renders results)
├── lib/
│   ├── sources.js       # Curated source registry (45+ domains)
│   ├── extractor.js     # Claim extraction (regex-based)
│   └── search.js        # DuckDuckGo search (free, no API key)
└── icons/
```

## What NumCheck does NOT do

- Does not tell you "true" or "false" — it shows you the data, you decide
- Does not collect your data — nothing is stored, tracked, or sent to a server
- Does not have ads — ever
- Does not require an account

## Adding sources

Edit `lib/sources.js` and add domains to the relevant category. New sources are automatically prioritized in search results.

## License

MIT — free and open source. Do whatever you want with it.
