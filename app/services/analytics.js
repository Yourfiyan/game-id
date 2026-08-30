/* ==========================================================================
   Analytics Service - Phase 3
   Every function takes ONE account's games array and returns metrics for that
   account only. There is deliberately no function here that accepts two
   accounts or concatenates libraries: the no-merge rule is enforced by the
   shape of the API, not by convention.

   Null discipline: a game missing a value is EXCLUDED from that metric and
   counted in `.unknown`, never coerced to 0. A rating average over 40 of 175
   games says so explicitly.
   ========================================================================== */

const SECONDS_PER_HOUR = 3600;

/* ------------------------------------------------------------------ helpers */
const isGame = g => g.classification === 'game';

function mean(values) {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function median(values) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function tally(items) {
  const counts = new Map();
  for (const item of items) counts.set(item, (counts.get(item) || 0) + 1);
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** Epic exports dates as "Jun 28, 2026". Returns a Date or null - never NaN. */
export function parsePurchaseDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

/* ---------------------------------------------------------------- overview */
export function overview(games) {
  const playable = games.filter(isGame);

  const byClass = {};
  for (const g of games) byClass[g.classification] = (byClass[g.classification] || 0) + 1;

  const free = playable.filter(g => g.isFree === true).length;
  // "paid" = the store listed a non-zero price for it. Note the whole library
  // was acquired at zero cost (giveaways/sales), so this is list value, not spend.
  const paid = playable.filter(g => (g.msrp ?? 0) > 0).length;

  const currentValues = playable.map(g => g.currentPrice).filter(v => v != null);
  const msrpValues = playable.map(g => g.msrp).filter(v => v != null);

  return {
    totalEntitlements: games.length,
    totalGames: playable.length,
    byClassification: byClass,
    freeGames: free,
    paidGames: paid,
    // PRIMARY monetary metric: current store value
    estimatedLibraryValue: currentValues.reduce((a, b) => a + b, 0),
    valueCoverage: { known: currentValues.length, unknown: playable.length - currentValues.length },
    msrp: {
      total: msrpValues.reduce((a, b) => a + b, 0),
      average: mean(msrpValues),
      median: median(msrpValues),
      highest: msrpValues.length ? Math.max(...msrpValues) : null,
      lowest: msrpValues.length ? Math.min(...msrpValues) : null,
      coverage: { known: msrpValues.length, unknown: playable.length - msrpValues.length },
    },
    confidence: {
      high: games.filter(g => g.confidence === 'High').length,
      medium: games.filter(g => g.confidence === 'Medium').length,
      low: games.filter(g => g.confidence === 'Low').length,
    },
    metadataCoverage: {
      developer: playable.filter(g => g.developer).length,
      publisher: playable.filter(g => g.publisher).length,
      releaseDate: playable.filter(g => g.releaseDate).length,
      genres: playable.filter(g => g.genres?.length).length,
      themes: playable.filter(g => g.themes?.length).length,
      franchise: playable.filter(g => g.franchise).length,
      anyRating: playable.filter(g => g.metacritic || g.steamScore || g.igdbCritic).length,
      total: playable.length,
    },
  };
}

/* ------------------------------------------------------------ distributions */
export function genreDistribution(games) {
  const withGenres = games.filter(g => isGame(g) && g.genres?.length);
  return {
    distribution: tally(withGenres.flatMap(g => g.genres)),
    gamesWithGenres: withGenres.length,
    gamesWithoutGenres: games.filter(isGame).length - withGenres.length,
  };
}

export function themeDistribution(games) {
  const withThemes = games.filter(g => isGame(g) && g.themes?.length);
  return {
    distribution: tally(withThemes.flatMap(g => g.themes)),
    gamesWithThemes: withThemes.length,
    gamesWithoutThemes: games.filter(isGame).length - withThemes.length,
  };
}

export function platformDistribution(games) {
  const withPlatforms = games.filter(g => isGame(g) && g.platforms?.length);
  return {
    distribution: tally(withPlatforms.flatMap(g => g.platforms)),
    unknown: games.filter(isGame).length - withPlatforms.length,
  };
}

export function storeDistribution(games) {
  return { distribution: tally(games.map(g => g.marketplace || 'Unknown')) };
}

export function classificationDistribution(games) {
  return { distribution: tally(games.map(g => g.classification)) };
}

/** Gameplay categories derived from verified Steam feature flags. */
export function gameplayCategories(games) {
  const playable = games.filter(isGame);
  const withFeatures = playable.filter(g => g.features && Object.keys(g.features).length);
  const flags = ['singlePlayer', 'multiplayer', 'coop', 'onlineCoop', 'pvp', 'onlinePvp',
    'splitScreen', 'achievements', 'cloudSaves', 'controllerSupport', 'tradingCards'];

  const distribution = flags.map(flag => ({
    label: flag,
    count: withFeatures.filter(g => g.features[flag] === true).length,
  })).filter(d => d.count > 0).sort((a, b) => b.count - a.count);

  return { distribution, gamesWithFeatureData: withFeatures.length, unknown: playable.length - withFeatures.length };
}

/* -------------------------------------------------------------- timeline */
export function releaseTimeline(games) {
  const dated = games.filter(g => isGame(g) && g.releaseDate);
  const years = dated.map(g => new Date(g.releaseDate).getFullYear()).filter(y => !Number.isNaN(y));

  const byYear = tally(years.map(String)).sort((a, b) => a.label.localeCompare(b.label));
  const byDecade = tally(years.map(y => `${Math.floor(y / 10) * 10}s`))
    .sort((a, b) => a.label.localeCompare(b.label));

  return {
    byYear, byDecade,
    oldest: years.length ? Math.min(...years) : null,
    newest: years.length ? Math.max(...years) : null,
    gamesWithReleaseDate: dated.length,
    gamesWithoutReleaseDate: games.filter(isGame).length - dated.length,
  };
}

export function acquisitionTimeline(games) {
  const rows = games
    .map(g => ({ g, d: parsePurchaseDate(g.purchaseDate) }))
    .filter(r => r.d);

  const byMonth = new Map();
  const byYear = new Map();
  for (const { d } of rows) {
    const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    byMonth.set(mk, (byMonth.get(mk) || 0) + 1);
    byYear.set(String(d.getFullYear()), (byYear.get(String(d.getFullYear())) || 0) + 1);
  }

  const sortedMonths = [...byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  let running = 0;
  const cumulative = sortedMonths.map(([label, count]) => ({ label, count, total: (running += count) }));

  return {
    byMonth: sortedMonths.map(([label, count]) => ({ label, count })),
    byYear: [...byYear.entries()].map(([label, count]) => ({ label, count }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    cumulative,
    firstAcquisition: rows.length ? new Date(Math.min(...rows.map(r => r.d))).toISOString().slice(0, 10) : null,
    lastAcquisition: rows.length ? new Date(Math.max(...rows.map(r => r.d))).toISOString().slice(0, 10) : null,
    undatedCount: games.length - rows.length,
  };
}

/* --------------------------------------------------------------- ratings */
export function ratingAnalysis(games, { topN = 10 } = {}) {
  const playable = games.filter(isGame);
  const mc = playable.filter(g => g.metacritic != null);
  const steam = playable.filter(g => g.steamScore != null);
  const igdb = playable.filter(g => g.igdbCritic != null);

  const buckets = [
    { label: '90-100', min: 90, max: 100 },
    { label: '80-89', min: 80, max: 89 },
    { label: '70-79', min: 70, max: 79 },
    { label: '60-69', min: 60, max: 69 },
    { label: '< 60', min: 0, max: 59 },
  ].map(b => ({
    label: b.label,
    count: mc.filter(g => g.metacritic >= b.min && g.metacritic <= b.max).length,
  }));

  // Hidden gem: highly rated by players but thinly reviewed.
  const reviewCounts = steam.map(g => g.steamReviewCount).filter(v => v != null);
  const medianReviews = median(reviewCounts) ?? 0;
  const hiddenGems = steam
    .filter(g => g.steamScore >= 80 && (g.steamReviewCount ?? 0) < medianReviews)
    .sort((a, b) => b.steamScore - a.steamScore)
    .slice(0, topN);

  return {
    metacritic: {
      average: mean(mc.map(g => g.metacritic)),
      median: median(mc.map(g => g.metacritic)),
      coverage: { known: mc.length, unknown: playable.length - mc.length },
      distribution: buckets,
    },
    steam: {
      average: mean(steam.map(g => g.steamScore)),
      coverage: { known: steam.length, unknown: playable.length - steam.length },
    },
    igdb: {
      average: mean(igdb.map(g => g.igdbCritic)),
      coverage: { known: igdb.length, unknown: playable.length - igdb.length },
    },
    topRated: [...mc].sort((a, b) => b.metacritic - a.metacritic).slice(0, topN)
      .map(g => ({ title: g.title, metacritic: g.metacritic, steamScore: g.steamScore })),
    // "Underrated" = strong player sentiment, weak or absent critic score.
    underrated: steam.filter(g => g.steamScore >= 85 && (g.metacritic == null || g.metacritic < 75))
      .sort((a, b) => b.steamScore - a.steamScore).slice(0, topN)
      .map(g => ({ title: g.title, steamScore: g.steamScore, metacritic: g.metacritic })),
    hiddenGems: hiddenGems.map(g => ({
      title: g.title, steamScore: g.steamScore, reviewCount: g.steamReviewCount,
    })),
    medianSteamReviewCount: medianReviews,
  };
}

/* ------------------------------------------------------------ completion */
export function completionAnalysis(games) {
  const playable = games.filter(isGame);
  const played = playable.filter(g => (g.playtime ?? 0) > 0);
  const hours = played.map(g => g.playtime / SECONDS_PER_HOUR);

  const sorted = [...played].sort((a, b) => b.playtime - a.playtime);

  return {
    // Recorded playtime, from the transaction export. NOT an estimate.
    totalHours: hours.reduce((a, b) => a + b, 0),
    averageHoursAcrossPlayed: mean(hours),
    longest: sorted[0] ? { title: sorted[0].title, hours: sorted[0].playtime / SECONDS_PER_HOUR } : null,
    shortest: sorted.length
      ? { title: sorted[sorted.length - 1].title, hours: sorted[sorted.length - 1].playtime / SECONDS_PER_HOUR }
      : null,
    playedCount: played.length,
    neverPlayedCount: playable.length - played.length,
    backlogPercent: playable.length ? ((playable.length - played.length) / playable.length) * 100 : null,
    // HowLongToBeat-style "estimated hours to complete" needs an external API
    // that is not available here, so it is explicitly unavailable rather than guessed.
    estimatedCompletionHours: null,
    estimatedCompletionNote: 'Requires HowLongToBeat API - Needs Manual Verification',
  };
}

/* ---------------------------------------------------------------- value */
export function valueAnalysis(games) {
  const playable = games.filter(isGame);
  const current = playable.map(g => g.currentPrice).filter(v => v != null);
  const msrp = playable.map(g => g.msrp).filter(v => v != null);
  const lowest = playable.map(g => g.historicalLowest).filter(v => v != null);

  const totalCurrent = current.reduce((a, b) => a + b, 0);
  const totalPlayHours = playable.reduce((s, g) => s + (g.playtime ?? 0), 0) / SECONDS_PER_HOUR;

  // Ownership metadata, kept deliberately separate from the value headline.
  const totalPaid = playable.map(g => g.amountPaid).filter(v => v != null).reduce((a, b) => a + b, 0);

  const byFranchise = new Map();
  for (const g of playable) {
    if (!g.franchise || g.currentPrice == null) continue;
    const e = byFranchise.get(g.franchise) || { franchise: g.franchise, value: 0, count: 0 };
    e.value += g.currentPrice; e.count += 1;
    byFranchise.set(g.franchise, e);
  }

  const currencies = [...new Set(playable.map(g => g.currency).filter(Boolean))];

  return {
    currency: currencies.length === 1 ? currencies[0] : 'MIXED',
    currenciesPresent: currencies,
    totalCurrentValue: totalCurrent,
    totalMsrp: msrp.reduce((a, b) => a + b, 0),
    totalHistoricalLowest: lowest.length ? lowest.reduce((a, b) => a + b, 0) : null,
    historicalLowestCoverage: { known: lowest.length, unknown: playable.length - lowest.length },
    // Ownership-only figure. UI must render this at low prominence.
    totalAmountPaid: totalPaid,
    savingsVsCurrentValue: totalCurrent - totalPaid,
    costPerHour: totalPlayHours > 0 ? totalPaid / totalPlayHours : null,
    costPerHourNote: totalPaid === 0
      ? 'Entire library acquired at zero cost, so cost-per-hour is 0 by definition.'
      : null,
    valuePerGame: current.length ? totalCurrent / current.length : null,
    mostValuable: [...playable].filter(g => g.currentPrice != null)
      .sort((a, b) => b.currentPrice - a.currentPrice).slice(0, 10)
      .map(g => ({ title: g.title, currentPrice: g.currentPrice, currency: g.currency })),
    mostValuableFranchise: [...byFranchise.values()].sort((a, b) => b.value - a.value)[0] || null,
    franchiseValues: [...byFranchise.values()].sort((a, b) => b.value - a.value),
  };
}

/* ------------------------------------------------------------ collection */
export function collectionHealth(games) {
  const o = overview(games);
  const cov = o.metadataCoverage;
  const fields = ['developer', 'publisher', 'releaseDate', 'genres', 'anyRating'];
  const score = fields.reduce((s, f) => s + (cov.total ? cov[f] / cov.total : 0), 0) / fields.length;

  return {
    metadataCompletenessPercent: score * 100,
    fieldCoverage: cov,
    needsManualVerification: games.filter(g => g.confidence === 'Low').length,
    unresolvedMetadata: games.filter(g => isGame(g) && !g.developer && !g.publisher).length,
  };
}

/* ---------------------------------------------------------------- confidence */
export function confidenceDistribution(games) {
  const playable = games.filter(isGame);
  const buckets = [
    { label: 'High',   count: playable.filter(g => g.confidence === 'High').length },
    { label: 'Medium', count: playable.filter(g => g.confidence === 'Medium').length },
    { label: 'Low',    count: playable.filter(g => g.confidence === 'Low').length },
  ];
  return { items: buckets };
}

/* ---------------------------------------------------------------- price */
export function priceDistribution(games) {
  const playable = games.filter(isGame);
  const buckets = [
    { label: 'Free',       count: playable.filter(g => g.isFree || (g.currentPrice ?? 0) === 0).length },
    { label: '< $5',       count: playable.filter(g => (g.currentPrice ?? 0) > 0 && g.currentPrice < 5).length },
    { label: '$5–$14',     count: playable.filter(g => (g.currentPrice ?? 0) >= 5 && g.currentPrice < 15).length },
    { label: '$15–$29',    count: playable.filter(g => (g.currentPrice ?? 0) >= 15 && g.currentPrice < 30).length },
    { label: '$30–$59',    count: playable.filter(g => (g.currentPrice ?? 0) >= 30 && g.currentPrice < 60).length },
    { label: '$60+',       count: playable.filter(g => (g.currentPrice ?? 0) >= 60).length },
  ];
  const known = playable.filter(g => g.currentPrice != null);
  return {
    items: buckets,
    unknown: playable.length - known.length,
    currency: known.length ? known[0].currency : 'USD',
  };
}

/* ------------------------------------------------------------ playtime */
export function playtimeDistribution(games) {
  const playable = games.filter(isGame);
  const hours = playable.map(g => ({
    title: g.title,
    price: g.currentPrice ?? 0,
    playtime: (g.playtime ?? 0) / SECONDS_PER_HOUR,
    currency: g.currency,
  }));
  const played = hours.filter(h => h.playtime > 0);
  const buckets = [
    { label: '0 h',      count: hours.filter(h => h.playtime === 0).length },
    { label: '0.1–1 h',  count: played.filter(h => h.playtime > 0 && h.playtime < 1).length },
    { label: '1–5 h',    count: played.filter(h => h.playtime >= 1 && h.playtime < 5).length },
    { label: '5–20 h',   count: played.filter(h => h.playtime >= 5 && h.playtime < 20).length },
    { label: '20–100 h', count: played.filter(h => h.playtime >= 20 && h.playtime < 100).length },
    { label: '100+ h',   count: played.filter(h => h.playtime >= 100).length },
  ];
  return { items: buckets, scatter: hours, totalPlayable: playable.length };
}

/* ------------------------------------------------------------------ facade */
export function computeAll(games, accountLabel) {
  return {
    account: accountLabel,
    generatedAt: new Date().toISOString(),
    overview: overview(games),
    genres: genreDistribution(games),
    themes: themeDistribution(games),
    platforms: platformDistribution(games),
    stores: storeDistribution(games),
    classifications: classificationDistribution(games),
    gameplay: gameplayCategories(games),
    releaseTimeline: releaseTimeline(games),
    acquisitionTimeline: acquisitionTimeline(games),
    ratings: ratingAnalysis(games),
    completion: completionAnalysis(games),
    value: valueAnalysis(games),
    health: collectionHealth(games),
  };
}
