// =============================================================================
// NumCheck — Claim Extraction & Source Matching
// =============================================================================

const NUMBER_RE = /(?:₹|Rs\.?|INR|\$|USD|EUR)?\s?[\d,]+(?:\.\d+)?\s?(?:percent|%|crore|lakh|billion|million|trillion|thousand|bn|mn|k|cr)\b/gi;

export function extractClaims(text) {
  if (!text || typeof text !== "string") return [];
  const sentences = text.replace(/\s+/g, " ").split(/(?<=[.!?])\s+(?=[A-Z0-9])/);
  const claims = [];
  for (const sentence of sentences) {
    const matches = [...sentence.matchAll(NUMBER_RE)];
    if (matches.length === 0) continue;
    const numbers = matches.map((m) => m[0].trim());
    const topicContext = sentence.replace(NUMBER_RE, "").replace(/\s{2,}/g, " ").trim().slice(0, 200);
    claims.push({ sentence: sentence.trim(), numbers, topicContext });
  }
  const seen = new Set();
  return claims.filter((c) => {
    if (seen.has(c.sentence)) return false;
    seen.add(c.sentence);
    return true;
  });
}

export function buildQueries(claim, maxQueries = 2) {
  const queries = new Set();
  queries.add(claim.sentence.slice(0, 120));
  if (claim.numbers.length > 0) {
    queries.add(`${claim.numbers[0]} ${claim.topicContext.slice(0, 80)}`);
  }
  return [...queries].slice(0, maxQueries);
}
