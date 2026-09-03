// =============================================================================
// NumCheck — Express API Server
// =============================================================================

import express from "express";
import cors from "cors";
import { extractClaims, buildQueries } from "./extractor.js";
import { search } from "./search.js";
import { CURATED_SOURCES } from "./sources.js";

const app = express();
const PORT = process.env.PORT || 4567;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", version: "0.1.0" });
});

app.get("/api/sources", (req, res) => {
  res.json(CURATED_SOURCES);
});

app.post("/api/verify", async (req, res) => {
  const { claim } = req.body;
  if (!claim || typeof claim !== "string") {
    return res.status(400).json({ error: "Missing 'claim' in body" });
  }
  try {
    const { provider, results } = await search(claim, 6);
    const grouped = groupResults(results);
    res.json({ claim, provider, count: results.length, results: grouped });
  } catch (err) {
    console.error("[/api/verify] error:", err);
    res.status(500).json({ error: "Search failed", detail: err.message });
  }
});

app.post("/api/analyze", async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing 'text' in body" });
  }
  try {
    const claims = extractClaims(text);
    const claimsToVerify = claims.slice(0, 8);
    const verified = [];
    for (const claim of claimsToVerify) {
      const queries = buildQueries(claim, 2);
      for (const q of queries) {
        const { provider, results } = await search(q, 4);
        const grouped = groupResults(results);
        verified.push({
          claim: claim.sentence,
          numbers: claim.numbers,
          query: q,
          provider,
          results: grouped,
        });
      }
    }
    res.json({
      totalClaimsFound: claims.length,
      claimsVerified: verified.length,
      claims: verified,
    });
  } catch (err) {
    console.error("[/api/analyze] error:", err);
    res.status(500).json({ error: "Analysis failed", detail: err.message });
  }
});

function groupResults(results) {
  const groups = { primary: [], factcheck: [], web: [] };
  const seen = new Set();
  for (const r of results) {
    if (seen.has(r.url)) continue;
    seen.add(r.url);
    const type = r.sourceType || "web";
    if (!groups[type]) groups[type] = [];
    groups[type].push(r);
  }
  const order = { primary: 0, factcheck: 1, web: 2 };
  return Object.entries(groups)
    .sort(([a], [b]) => (order[a] || 3) - (order[b] || 3))
    .map(([type, items]) => ({ type, label: typeLabel(type), items }));
}

function typeLabel(type) {
  const labels = {
    primary: "Primary / Official Data",
    factcheck: "Fact-Check Coverage",
    web: "General Web Results",
  };
  return labels[type] || type;
}

app.listen(PORT, () => {
  console.log(`NumCheck server running on port ${PORT}`);
});
