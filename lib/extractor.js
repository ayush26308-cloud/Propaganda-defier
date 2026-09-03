// =============================================================================
// NumCheck — Claim Extractor (pure client-side)
// =============================================================================

// Regex for numbers with units — Indian + international
const NUMBER_RE = /(?:₹|Rs\.?|INR|\$|USD|EUR)?\s?[\d,]+(?:\.\d+)?\s?(?:percent|%|crore|lakh|billion|million|trillion|thousand|bn|mn|k|cr)\b/gi;

function extractClaims(text) {
  if (!text || typeof text !== "string") return [];
  const sentences = text.replace(/\s+/g, " ").split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/);
  const claims = [];
  const seen = new Set();

  for (const sentence of sentences) {
    const matches = [...sentence.matchAll(NUMBER_RE)];
    if (matches.length === 0) continue;

    const numbers = matches.map((m) => m[0].trim());
    const topicContext = sentence
      .replace(NUMBER_RE, "")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 200);

    const trimmed = sentence.trim();
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);

    claims.push({
      sentence: trimmed,
      numbers: numbers,
      topicContext: topicContext,
    });
  }
  return claims;
}

function buildQueries(claim, maxQueries) {
  maxQueries = maxQueries || 2;
  const queries = new Set();
  queries.add(claim.sentence.slice(0, 120));
  if (claim.numbers.length > 0) {
    queries.add(claim.numbers[0] + " " + claim.topicContext.slice(0, 80));
  }
  return [...queries].slice(0, maxQueries);
}

self.NumCheckExtractor = { extractClaims, buildQueries };
