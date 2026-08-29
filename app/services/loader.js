/* ==========================================================================
   Data Loader Service - Phase 6

   Reads the runtime files emitted by tools/build_app_data.py:
     data/config.json     - app config, account registry, unavailable sources
     data/accountA.json   - Account A entitlements
     data/accountB.json   - Account B entitlements
     data/genres.json     - canonical genre taxonomy with per-account counts

   Nothing is hardcoded here. Adding a game means editing the JSON and
   reloading; adding an account means adding a file and a config entry.

   Account isolation: `state.games` is keyed by account and only ever holds one
   account's array per key. There is no code path in this module that returns
   games from more than one account, so no page can accidentally merge them.

   The loader FLATTENS the nested runtime schema (ratings.*, pricing.*,
   ownership.*, provenance.*) into the flat shape analytics.js and filters.js
   consume. That mapping lives here, in one place, on purpose.
   ========================================================================== */

const BASE = '../data';

const state = {
  config: null,
  genres: null,
  currentAccount: null,
  games: {},        // { A: [...], B: [...] } - never a combined list
  loading: false,
  error: null,
};

async function fetchJSON(path) {
  const resp = await fetch(path);
  if (!resp.ok) throw new Error(`${path} -> HTTP ${resp.status}`);
  return resp.json();
}

/* ------------------------------------------------------------------ config */
export async function loadConfig() {
  if (state.config) return state.config;
  state.config = await fetchJSON(`${BASE}/config.json`);
  // genres.json is presentation sugar; a failure must not break the library.
  state.genres = await fetchJSON(`${BASE}/genres.json`).catch(() => null);
  return state.config;
}

/* ------------------------------------------------------------------ flatten */
/**
 * Runtime schema -> flat view model.
 *
 * Null discipline: every `?? null` here is deliberate. A missing rating must
 * stay null so analytics can exclude it and the UI can say "Needs Manual
 * Verification" instead of rendering a confident zero.
 */
function flatten(game) {
  const r = game.ratings || {};
  const p = game.pricing || {};
  const o = game.ownership || {};
  const v = game.provenance || {};

  return {
    id: game.id,
    title: game.title,
    rawTitle: game.rawTitle ?? null,
    classification: game.classification ?? null,

    developer: game.developer ?? null,
    publisher: game.publisher ?? null,
    franchise: game.franchise ?? null,
    releaseDate: game.releaseDate ?? null,

    genres: game.genres || [],
    themes: game.themes || [],
    tags: game.tags || [],
    platforms: game.platforms || [],

    summary: game.summary ?? null,
    about: game.about ?? null,

    cover: game.cover,
    background: game.background,
    screenshots: game.screenshots || [],

    // ratings, flattened for analytics/filters
    metacritic: r.metacritic ?? null,
    steamScore: r.steam ?? null,
    steamReviewCount: r.steamReviewCount ?? null,
    igdbCritic: r.igdbCritic ?? null,
    igdbUser: r.igdbUser ?? null,
    opencritic: r.opencritic ?? null,

    // pricing - `current` is the PRIMARY monetary metric
    currency: p.currency || 'INR',
    msrp: p.msrp ?? null,
    currentPrice: p.current ?? null,
    discountPercent: p.discountPercent ?? null,
    historicalLowest: p.historicalLowest ?? null,
    isFree: game.isFree === true,

    features: game.features || {},
    steamDeck: game.steamDeck ?? null,

    // ownership metadata - rendered at low prominence, never as a headline
    purchaseDate: o.purchaseDate ?? null,
    amountPaid: o.purchasePrice ?? null,
    marketplace: o.marketplace ?? game.store ?? null,
    orderId: o.transactionId ?? null,
    playtime: o.playtimeSeconds ?? 0,
    playtimeRaw: o.playtimeRaw ?? null,

    // provenance
    confidence: v.confidence ?? null,
    sources: v.sources || [],
    issues: v.issues || [],
    steamAppId: v.steamAppId ?? null,
    igdbId: v.igdbId ?? null,
    enrichmentStatus: {
      steam: v.steamStatus || 'not_attempted',
      igdb: v.igdbStatus || 'not_attempted',
    },
  };
}

/* ------------------------------------------------------------------- load */
export async function loadAccount(account) {
  const cfg = await loadConfig();

  const entry = cfg.accounts.find(a => a.id === account);
  if (!entry) throw new Error(`Unknown account "${account}" - not listed in config.json`);

  if (state.games[account]) {          // already in memory, just switch
    state.currentAccount = account;
    return state.games[account];
  }

  state.loading = true;
  state.error = null;

  try {
    const payload = await fetchJSON(`${BASE}/${entry.dataFile}`);
    const games = (payload.games || []).map(flatten);

    state.games[account] = games;
    state.currentAccount = account;

    if (payload.entitlementCount != null && payload.entitlementCount !== games.length) {
      console.warn(`[Loader] Account ${account}: file declares ` +
        `${payload.entitlementCount} entitlements but ${games.length} parsed.`);
    }

    console.log(`[Loader] Account ${account}: ${games.length} entitlements`);
    return games;
  } catch (err) {
    state.error = err.message;
    console.error('[Loader] Load failed:', err);
    throw err;
  } finally {
    state.loading = false;
  }
}

/* -------------------------------------------------------------- accessors */
export function getGames(account = state.currentAccount) {
  return state.games[account] || [];
}

export function getGame(id, account = state.currentAccount) {
  return getGames(account).find(g => g.id === id) || null;
}

export function getCurrentAccount() {
  return state.currentAccount;
}

export function getAccounts() {
  return state.config?.accounts || [];
}

export function getConfig() {
  return state.config;
}

export function getGenreTaxonomy() {
  return state.genres;
}

/** Which external sources were unavailable, so the UI can explain nulls. */
export function getUnavailableSources() {
  return state.config?.unavailableSources || {};
}

export function isLoading() {
  return state.loading;
}

export function getError() {
  return state.error;
}
