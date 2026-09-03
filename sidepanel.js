// =============================================================================
// NumCheck — Side Panel Logic (fully local, no server)
// =============================================================================

var el = {
  scanBtn: document.getElementById("scanBtn"),
  manualBtn: document.getElementById("manualBtn"),
  manualInput: document.getElementById("manualInput"),
  status: document.getElementById("status"),
  pageInfo: document.getElementById("pageInfo"),
  results: document.getElementById("results"),
};

function setStatus(html) { el.status.innerHTML = html; }
function escapeHtml(str) { var d = document.createElement("div"); d.textContent = str; return d.innerHTML; }
function getDomain(url) { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } }

function highlightNumbers(text) {
  return escapeHtml(text).replace(
    /(\d[\d,]*(?:\.\d+)?\s?(?:percent|%|crore|lakh|billion|million|trillion|thousand|bn|mn|k|cr)?|₹\s?[\d,]+(?:\.\d+)?(?:\s?(?:crore|lakh|billion|million))?)/gi,
    '<span class="num">$1</span>'
  );
}

// --- Render results ---
function renderResults(data) {
  if (data.claim && data.results) {
    renderSingleClaim(data.claim, [], data.results);
    return;
  }
  if (data.claims && Array.isArray(data.claims)) {
    if (data.claims.length === 0) {
      el.results.innerHTML = '<div class="empty-state">No numerical claims found on this page.</div>';
      return;
    }
    el.results.innerHTML = '<div style="font-size:12px;color:var(--text-dim);margin-bottom:10px;">Found ' + data.totalClaimsFound + ' claims. Verified ' + data.claimsVerified + '.</div>';
    data.claims.forEach(function (c) { renderSingleClaim(c.claim, c.numbers, c.results); });
  }
}

function renderSingleClaim(claimText, numbers, results) {
  var card = document.createElement("div");
  card.className = "claim-card";
  var html = '<div class="claim-text">' + highlightNumbers(claimText || "") + '</div>';
  var sourcesHtml = "";

  if (results && Array.isArray(results)) {
    for (var i = 0; i < results.length; i++) {
      var group = results[i];
      if (!group.items || group.items.length === 0) continue;
      var itemsHtml = group.items.map(function (item) {
        return '<div class="source-item">' +
          '<a href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener">' +
            escapeHtml(item.title || "Untitled") +
          '</a>' +
          '<div class="snippet">' + escapeHtml((item.snippet || "").slice(0, 200)) + '</div>' +
          '<div class="domain"><a href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener">' +
            escapeHtml(getDomain(item.url)) + '</a></div>' +
        '</div>';
      }).join("");
      sourcesHtml += '<div class="source-group">' +
        '<div class="source-group-label">' +
          '<span class="tag ' + escapeHtml(group.type) + '"></span>' +
          escapeHtml(group.label || group.type) +
        '</div>' +
        itemsHtml +
      '</div>';
    }
  }
  if (!sourcesHtml) {
    sourcesHtml = '<div style="font-size:12px;color:var(--text-dim);padding:6px 0;">No sources found for this claim.</div>';
  }
  card.innerHTML = html + sourcesHtml;
  el.results.appendChild(card);
}

// --- Show page info ---
function showPageInfo(meta) {
  el.pageInfo.style.display = "block";
  var typeLabel = meta.pageType;
  if (typeLabel === "youtube") typeLabel = "YouTube Video";
  else if (typeLabel === "x") typeLabel = "X / Twitter";
  else if (typeLabel === "instagram") typeLabel = "Instagram";
  else typeLabel = "Article";
  el.pageInfo.innerHTML = '<span class="ptype ' + meta.pageType + '">' + typeLabel + '</span><br/>' +
    '<strong>' + escapeHtml(meta.title.slice(0, 80)) + '</strong><br/>' +
    escapeHtml(meta.domain) + ' · ' + meta.wordCount + ' words';
}

// --- Scan current page ---
el.scanBtn.addEventListener("click", async function () {
  el.scanBtn.disabled = true;
  el.results.innerHTML = "";
  setStatus('<span class="spinner"></span>Reading page...');

  try {
    var [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) { setStatus("No active tab found."); return; }

    chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_CONTENT" }, async function (response) {
      if (chrome.runtime.lastError || !response) {
        setStatus("⚠ Could not read this page. Try refreshing and scan again.");
        el.scanBtn.disabled = false;
        return;
      }

      var text = response.text;
      var meta = response.meta;
      showPageInfo(meta);

      if (!text || text.length < 50) {
        setStatus("⚠ Not enough text found on this page.");
        el.scanBtn.disabled = false;
        return;
      }

      setStatus('<span class="spinner"></span>Extracting claims...');

      var claims = self.NumCheckExtractor.extractClaims(text);
      if (claims.length === 0) {
        setStatus("✓ Page scanned. No numerical claims found.");
        el.results.innerHTML = '<div class="empty-state">No stats or numbers detected in this content.</div>';
        el.scanBtn.disabled = false;
        return;
      }

      var claimsToVerify = claims.slice(0, 8);
      setStatus('<span class="spinner"></span>Verifying ' + claimsToVerify.length + ' claims...');

      var verified = [];
      for (var i = 0; i < claimsToVerify.length; i++) {
        var claim = claimsToVerify[i];
        var queries = self.NumCheckExtractor.buildQueries(claim, 2);
        for (var j = 0; j < queries.length; j++) {
          var q = queries[j];
          var searchResult = await self.NumCheckSearch.search(q, 4);
          var grouped = self.NumCheckSearch.groupResults(searchResult.results);
          verified.push({
            claim: claim.sentence,
            numbers: claim.numbers,
            query: q,
            provider: searchResult.provider,
            results: grouped,
          });
        }
        setStatus('<span class="spinner"></span>Verified ' + (i + 1) + ' of ' + claimsToVerify.length + '...');
      }

      setStatus("✓ Found " + claims.length + " claims, verified " + verified.length + ".");
      renderResults({ totalClaimsFound: claims.length, claimsVerified: verified.length, claims: verified });
      el.scanBtn.disabled = false;
    });
  } catch (err) {
    setStatus("⚠ Error: " + err.message);
    el.scanBtn.disabled = false;
  }
});

// --- Manual verify ---
el.manualBtn.addEventListener("click", async function () {
  var claim = el.manualInput.value.trim();
  if (!claim) return;
  el.results.innerHTML = "";
  setStatus('<span class="spinner"></span>Searching...');

  try {
    var result = await self.NumCheckSearch.search(claim, 6);
    var grouped = self.NumCheckSearch.groupResults(result.results);
    setStatus("✓ Found " + result.results.length + " sources via " + result.provider + ".");
    renderResults({ claim: claim, results: grouped });
  } catch (err) {
    setStatus("⚠ " + err.message);
  }
});

el.manualInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") el.manualBtn.click();
});
