// =============================================================================
// NumCheck — Content Extractors (articles, YouTube, X, Instagram)
// =============================================================================
// Runs as a content script on every page. Detects what type of page you're on
// and extracts text accordingly.

// --- Detect page type ---
function detectPageType() {
  const url = window.location.href;
  const host = window.location.hostname.replace(/^www\./, "");

  if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
  if (host.includes("twitter.com") || host.includes("x.com")) return "x";
  if (host.includes("instagram.com")) return "instagram";
  return "article";
}

// --- Article extraction ---
function getArticleText() {
  const selectors = [
    "article", "main", '[role="main"]', "#content", "#article-body",
    ".article-body", ".story-content", ".post-content", "#story-content",
  ];

  let container = null;
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText.length > 200) {
      container = el;
      break;
    }
  }

  if (!container) {
    const paragraphs = document.querySelectorAll("p");
    if (paragraphs.length > 2) {
      return [...paragraphs].map(function (p) { return p.innerText; }).join(" ");
    }
    return document.body.innerText;
  }

  const clone = container.cloneNode(true);
  clone.querySelectorAll(
    "script, style, nav, footer, header, aside, .ad, .ads, .advertisement, .social-share, .comments, .related, .recommendations"
  ).forEach(function (el) { el.remove(); });

  return clone.innerText || container.innerText;
}

// --- YouTube transcript extraction ---
// YouTube embeds caption data in the page. We try multiple methods.
function getYouTubeText() {
  // Method 1: Try to find transcript/caption data in ytInitialPlayerResponse
  try {
    const scripts = document.querySelectorAll("script");
    for (const script of scripts) {
      const text = script.textContent;
      if (text && text.includes("captionTracks")) {
        // Extract caption track URL
        const match = text.match(/"captionTracks":(\[.*?\])/);
        if (match) {
          const tracks = JSON.parse(match[1]);
          if (tracks.length > 0) {
            // Return the caption track URL — we'll fetch it async
            // For now, mark that captions are available
            return { type: "caption_url", captionUrl: tracks[0].baseUrl };
          }
        }
      }
    }
  } catch (e) {
    console.log("[NumCheck] YouTube caption parse error:", e);
  }

  // Method 2: Try visible transcript if already open
  const transcriptSegments = document.querySelectorAll(
    ".ytd-transcript-segment-listing .segment-text, .cue-group .cue"
  );
  if (transcriptSegments.length > 0) {
    return {
      type: "text",
      text: [...transcriptSegments].map(function (el) { return el.innerText; }).join(" "),
    };
  }

  // Method 3: Fallback — use video description + title
  const title = document.querySelector("h1.ytd-watch-metadata") ||
                document.querySelector("h1.title");
  const desc = document.querySelector("#description-inner, #description-text, ytd-text-inline-expander");
  const text = (title ? title.innerText : "") + " " + (desc ? desc.innerText : "");
  return { type: "fallback", text: text.trim() };
}

// Fetch YouTube captions async
async function fetchYouTubeCaptions(captionUrl) {
  try {
    const res = await fetch(captionUrl);
    if (!res.ok) return null;
    const xml = await res.text();
    // Parse XML caption track
    const matches = [...xml.matchAll(/<text[^>]*>(.*?)<\/text>/g)];
    const text = matches.map(function (m) {
      return decodeHtmlEntities(m[1]);
    }).join(" ");
    return text;
  } catch (e) {
    console.error("[NumCheck] caption fetch error:", e);
    return null;
  }
}

function decodeHtmlEntities(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

// --- X (Twitter) extraction ---
function getXText() {
  // Get the main tweet text from the page
  // Works on individual tweet pages and in the timeline
  const tweets = document.querySelectorAll(
    '[data-testid="tweetText"], .tweet-text, .js-tweet-text'
  );
  if (tweets.length === 0) return "";
  return [...tweets].map(function (el) { return el.innerText; }).join("\n\n");
}

// --- Instagram extraction ---
function getInstagramText() {
  // Instagram post captions
  const captions = document.querySelectorAll(
    '[data-testid="post-caption"], .C4VMK span, .caption'
  );
  if (captions.length === 0) {
    // Fallback: meta description
    const meta = document.querySelector('meta[property="og:description"]');
    if (meta) return meta.content;
  }
  return [...captions].map(function (el) { return el.innerText; }).join("\n\n");
}

// --- Main extraction dispatcher ---
async function extractPageContent() {
  const pageType = detectPageType();
  const meta = {
    url: window.location.href,
    title: document.title,
    domain: window.location.hostname.replace(/^www\./, ""),
    pageType: pageType,
  };

  let text = "";

  if (pageType === "youtube") {
    const result = getYouTubeText();
    if (result.type === "caption_url" && result.captionUrl) {
      text = await fetchYouTubeCaptions(result.captionUrl) || result.text || "";
    } else {
      text = result.text || "";
    }
    meta.pageType = "youtube";
    meta.videoTitle = meta.title;
  } else if (pageType === "x") {
    text = getXText();
  } else if (pageType === "instagram") {
    text = getInstagramText();
  } else {
    text = getArticleText();
  }

  meta.wordCount = text ? text.split(/\s+/).length : 0;
  return { text: text, meta: meta };
}
