// =============================================================================
// NumCheck — Search (DuckDuckGo direct from browser, no server)
// =============================================================================
// Runs entirely in the browser. Uses DuckDuckGo HTML endpoint (free, no API
// key). Fetches and parses results client-side.

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

async function searchDuckDuckGo(query, count) {
  count = count || 5;
  const url = "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(query);

  const res = await fetch(url, {
    headers: { Accept: "text/html" },
  });

  if (!res.ok) throw new Error("DuckDuckGo error: " + res.status);
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
      title: stripHtml(titleMatch ? titleMatch[1] : ""),
      url: realUrl,
      snippet: stripHtml(snippetMatch ? snippetMatch[1] : ""),
      sourceType: self.NumCheckSources.classifySourceType(realUrl),
    });
  }
  return results;
}

async function search(query, count) {
  try {
    const results = await searchDuckDuckGo(query, count);
    return { provider: "duckduckgo", results: results };
  } catch (err) {
    console.error("[NumCheck] search error:", err);
    return { provider: "none", results: [] };
  }
}

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
    .sort(function (a, b) {
      return (order[a[0]] || 3) - (order[b[0]] || 3);
    })
    .map(function (entry) {
      return { type: entry[0], label: typeLabel(entry[0]), items: entry[1] };
    });
}

function typeLabel(type) {
  const labels = {
    primary: "Primary / Official Data",
    factcheck: "Fact-Check Coverage",
    web: "General Web Results",
  };
  return labels[type] || type;
}

self.NumCheckSearch = { search, groupResults };
