// =============================================================================
// NumCheck — Curated Sources Registry
// =============================================================================

export const CURATED_SOURCES = {
  india_govt: {
    label: "India — Government & Official",
    domains: [
      "mospi.gov.in", "censusindia.gov.in", "rbi.org.in", "finmin.nic.in",
      "niti.gov.in", "electioncommission.gov.in", "cbici.gov.in", "ncrb.gov.in",
      "mhrd.gov.in", "pib.gov.in", "data.gov.in", "uidai.gov.in", "gst.gov.in",
    ],
  },
  india_independent: {
    label: "India — Independent Data & Fact-check",
    domains: [
      "factchecker.in", "altnews.in", "boomlive.in", "factly.in",
      "indiaspend.com", "prsindia.org",
    ],
  },
  international: {
    label: "International Organisations",
    domains: [
      "worldbank.org", "imf.org", "un.org", "who.int", "oecd.org",
      "data.unicef.org", "ourworldindata.org", "gapminder.org", "ilo.org",
      "fao.org", "unctad.org",
    ],
  },
  fact_check_global: {
    label: "Global Fact-checkers",
    domains: [
      "reuters.com/fact-check", "apnews.com/hub/fact-check", "snopes.com",
      "politifact.com", "fullfact.org", "factcheck.org", "africacheck.org",
    ],
  },
  market_data: {
    label: "Financial & Market Data",
    domains: [
      "sebi.gov.in", "nseindia.com", "bseindia.com", "amfiindia.com",
      "tradingeconomics.com", "statista.com",
    ],
  },
};

export const DOMAIN_INDEX = {};
for (const [key, entry] of Object.entries(CURATED_SOURCES)) {
  for (const domain of entry.domains) {
    DOMAIN_INDEX[domain] = key;
  }
}

export function curatedSiteQuery() {
  const allDomains = Object.values(CURATED_SOURCES).flatMap((e) => e.domains);
  return allDomains.map((d) => `site:${d}`).join(" OR ");
}

export function classifySource(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");
    const hostPath = hostname + parsed.pathname;

    for (const domain of Object.keys(DOMAIN_INDEX)) {
      if (domain.includes("/") && hostPath.startsWith(domain)) {
        return DOMAIN_INDEX[domain];
      }
    }
    if (DOMAIN_INDEX[hostname]) return DOMAIN_INDEX[hostname];
    for (const domain of Object.keys(DOMAIN_INDEX)) {
      if (domain.includes("/")) continue;
      if (hostname.endsWith("." + domain) || hostname === domain) {
        return DOMAIN_INDEX[domain];
      }
    }
  } catch {}
  return null;
}
