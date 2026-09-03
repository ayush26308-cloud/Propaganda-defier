// =============================================================================
// NumCheck — Search Layer
// =============================================================================

import { classifySource } from "./sources.js";

const USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

async function googleSearch(query, count = 5) {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;
  if (!apiKey || !cx) return null;
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=${count}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google CSE error: ${res.status}`);
  const data = await res.json();
  return (data.items || []).map((item) => ({
    title: item.title || "",
    url: item.link || "",
    snippet: item.snippet || "",
    sourceType: classifySourceType(item.link || ""),
    publishedDate: item.pagemap?.metatags?.[0]?.["article:published_time"] || null,
  }));
}

async function braveSearch(query, count = 5) {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) return null;
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`;
  const res = await fetch(url, { headers: { "X-Subscription-Token": apiKey, Accept: "application/json" } });
  if (!res.ok) throw new Error(`Brave Search error: ${res.status}`);
  const data = await res.json();
  return (data.web?.results || []).map((r) => ({
    title: r.title, url: r.url, snippet: r.description || "",
    sourceType: classifySourceType(r.url), publishedDate: r.age || null,
  }));
}

async function duckDuckGoSearch(query, count = 5) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "text/html" } });
  if (!res.ok) throw new Error(`DuckDuckGo error: ${res.status}`);
  const html = await res.text();
  const results = [];
  const blocks = html.split(/<div class="result results-links">/).slice(1);
  for (const block of blocks.slice(0, count)) {
    const titleMatch = block.match(/<a[^>]*class="result__a"[^>]*>(.*?)<\/a>/s);
    const urlMatch = block.match(/href="([^"]+)"/);
    const snippetMatch = block.match(/<a[^>]*class="result__snippet"[^>]*>(.*?)<\/a>/s);
    if (!urlMatch) continue;
    let realUrl = urlMatch[1];
    const uddgMatch = realUrl.match(/uddg=([^&]+)/);
    if (uddgMatch) realUrl = decodeURIComponent(uddgMatch[1]);
    results.push({
      title: stripHtml(titleMatch?.[1] || ""),
      url: realUrl,
      snippet: stripHtml(snippetMatch?.[1] || ""),
      sourceType: classifySourceType(realUrl),
      publishedDate: null,
    });
  }
  return results;
}

function classifySourceType(url) {
  const category = classifySource(url);
  if (!category) return "web";
  if (category === "fact_check_global" || category === "india_independent") return "factcheck";
  return "primary";
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, "").replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, '"').replace(/&#39;/g, "'").trim();
}

export async function search(query, count = 5) {
  const providers = [
    { name: "google", fn: () => googleSearch(query, count) },
    { name: "brave", fn: () => braveSearch(query, count) },
    { name: "duckduckgo", fn: () => duckDuckGoSearch(query, count) },
  ];
  for (const provider of providers) {
    try {
      const results = await provider.fn();
      if (results && results.length > 0) return { provider: provider.name, results };
    } catch (err) {
      console.error(`[search] ${provider.name} failed: ${err.message}`);
    }
  }
  return { provider: "none", results: [] };
}
