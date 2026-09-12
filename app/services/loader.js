/* ==========================================================================
   Data Loader Service — Clean Zero-Account Architecture

   Handles:
     - Reading imported account data from localStorage (ZIP / PDF sync)
     - Empty/guest state on fresh launch (no default hardcoded account)
     - Account removal & data purging
     - Runtime schema flattening
   ========================================================================== */

const STORAGE_KEY_DATA = 'gameid-account-data';
const STORAGE_KEY_PROFILE = 'gameid-synced-profile';
const STORAGE_KEY_LAST_SYNC = 'gameid-last-sync';

const DEFAULT_CONFIG = {
  app: {
    name: 'Game Library',
    defaultView: 'grid',
    defaultSort: 'title-asc',
  },
  assets: {
    priority: [
      'IGDB',
      'Official store artwork',
      'Steam capsule',
      'Local placeholder',
    ],
    placeholders: {
      cover: 'assets/placeholders/cover.svg',
      background: 'assets/placeholders/background.svg',
    },
  },
  monetary: {
    primaryMetric: 'pricing.current',
    primaryMetricLabel: 'Current store value',
    lowProminenceMetric: 'ownership.purchasePrice',
    note: 'Purchase price is ownership metadata and renders de-emphasised.',
  },
  unavailableSources: {
    igdb: 'IGDB API not configured',
    opencritic: 'OpenCritic API not configured',
    isthereanydeal: 'IsThereAnyDeal not configured',
    howlongtobeat: 'HowLongToBeat not configured',
  },
};

const DEFAULT_GENRES = {
  source: 'Dynamic library taxonomy',
  genres: [],
};

const state = {
  config: DEFAULT_CONFIG,
  genres: DEFAULT_GENRES,
  profile: null,
  games: [],         // Active account games array
  isImported: false,
  loading: false,
  error: null,
};

/* ------------------------------------------------------------------ config */
export async function loadConfig() {
  state.config = DEFAULT_CONFIG;
  return state.config;
}

/* ------------------------------------------------------------------ flatten */
/**
 * Runtime schema -> flat view model.
 *
 * Null discipline: missing values stay null so analytics and UI can handle
 * them faithfully rather than assuming zeros.
 */
export function flatten(game) {
  const r = game.ratings || {};
  const p = game.pricing || {};
  const o = game.ownership || {};
  const v = game.provenance || {};

  return {
    id: game.id,
    title: game.title,
    rawTitle: game.rawTitle ?? game.title ?? null,
    classification: game.classification ?? 'game',

    developer: game.developer ?? null,
    publisher: game.publisher ?? null,
    franchise: game.franchise ?? null,
    releaseDate: game.releaseDate ?? null,

    genres: game.genres || [],
    themes: game.themes || [],
    tags: game.tags || [],
    platforms: game.platforms || ['windows'],

    summary: game.summary ?? null,
    about: game.about ?? null,

    cover: game.cover || 'assets/placeholders/cover.svg',
    background: game.background || 'assets/placeholders/background.svg',
    screenshots: game.screenshots || [],

    // ratings, flattened for analytics/filters
    metacritic: r.metacritic ?? game.metacritic ?? null,
    steamScore: r.steam ?? game.steamScore ?? null,
    steamReviewCount: r.steamReviewCount ?? game.steamReviewCount ?? null,
    igdbCritic: r.igdbCritic ?? game.igdbCritic ?? null,
    igdbUser: r.igdbUser ?? game.igdbUser ?? null,
    opencritic: r.opencritic ?? game.opencritic ?? null,

    // pricing - `current` is the PRIMARY monetary metric
    currency: p.currency || game.currency || 'USD',
    msrp: p.msrp ?? game.msrp ?? null,
    currentPrice: p.current ?? game.currentPrice ?? null,
    discountPercent: p.discountPercent ?? game.discountPercent ?? null,
    historicalLowest: p.historicalLowest ?? game.historicalLowest ?? null,
    isFree: game.isFree === true || p.current === 0 || o.purchasePrice === 0,

    features: game.features || {},
    steamDeck: game.steamDeck ?? null,

    // ownership metadata
    purchaseDate: o.purchaseDate ?? game.purchaseDate ?? null,
    amountPaid: o.purchasePrice ?? game.amountPaid ?? null,
    marketplace: o.marketplace ?? game.store ?? game.marketplace ?? 'Epic Games Store',
    orderId: o.transactionId ?? game.orderId ?? null,
    playtime: o.playtimeSeconds ?? game.playtime ?? 0,
    playtimeRaw: o.playtimeRaw ?? game.playtimeRaw ?? '0',

    // provenance
    confidence: v.confidence ?? game.confidence ?? (game.publisher ? 'High' : 'Medium'),
    sources: v.sources || game.sources || ['Epic Games Account Export'],
    issues: v.issues || game.issues || [],
    steamAppId: v.steamAppId ?? game.steamAppId ?? null,
    igdbId: v.igdbId ?? game.igdbId ?? null,
    enrichmentStatus: {
      steam: v.steamStatus || 'not_attempted',
      igdb: v.igdbStatus || 'not_attempted',
    },
  };
}

function deriveGenreTaxonomy(games) {
  const counts = {};
  for (const g of games) {
    for (const genre of (g.genres || [])) {
      counts[genre] = (counts[genre] || 0) + 1;
    }
  }
  const genresList = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      slug: name.toLowerCase().replace(/\W+/g, '_'),
      counts: { default: count }
    }));
  return {
    source: 'Dynamic library genres',
    genres: genresList
  };
}

/* ------------------------------------------------------------------- load */
export async function loadAccount() {
  state.loading = true;
  state.error = null;

  // 1. Check if user has imported account data in localStorage
  const savedAccountData = localStorage.getItem(STORAGE_KEY_DATA);
  if (savedAccountData) {
    try {
      const parsed = JSON.parse(savedAccountData);
      if (parsed && Array.isArray(parsed.games) && parsed.games.length > 0) {
        const games = parsed.games.map(flatten);
        state.games = games;
        state.profile = parsed.profile || JSON.parse(localStorage.getItem(STORAGE_KEY_PROFILE) || 'null');
        state.isImported = true;
        state.genres = deriveGenreTaxonomy(games);
        state.loading = false;
        return games;
      }
    } catch (err) {
      console.warn('[Loader] Failed to parse saved account data from localStorage:', err);
    }
  }

  // 2. Check for saved profile only (in case of empty games list)
  const savedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
  if (savedProfile) {
    try {
      state.profile = JSON.parse(savedProfile);
      state.isImported = true;
    } catch (e) {
      state.profile = null;
    }
  } else {
    state.profile = null;
  }

  // 3. Clean fresh state (no default hardcoded account or dummy fallback)
  state.games = [];
  state.genres = DEFAULT_GENRES;
  state.isImported = false;
  state.loading = false;
  return [];
}

/* ----------------------------------------------------------- import handler */
export function setImportedAccountData(extractionResult) {
  if (!extractionResult) return [];

  const rawGames = extractionResult.games || [];
  const profile = extractionResult.profile || {};
  const entitlements = extractionResult.entitlements || [];
  const raw = extractionResult.raw || {};

  // Persist to localStorage
  try {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify({
      profile,
      games: rawGames,
      entitlements,
      raw,
      importedAt: new Date().toISOString()
    }));
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    localStorage.setItem(STORAGE_KEY_LAST_SYNC, new Date().toISOString());
  } catch (err) {
    console.warn('[Loader] Failed to persist imported account data to localStorage:', err);
  }

  // Update in-memory state
  const games = rawGames.map(flatten);
  state.games = games;
  state.profile = profile;
  state.isImported = true;
  state.genres = deriveGenreTaxonomy(games);

  return games;
}

/* ----------------------------------------------------------- remove account */
export async function removeAccount() {
  try {
    localStorage.removeItem(STORAGE_KEY_DATA);
    localStorage.removeItem(STORAGE_KEY_PROFILE);
    localStorage.removeItem(STORAGE_KEY_LAST_SYNC);
  } catch (err) {
    console.warn('[Loader] Failed to clear account data from localStorage:', err);
  }
  state.games = [];
  state.profile = null;
  state.isImported = false;
  state.genres = DEFAULT_GENRES;
  return true;
}

export async function clearImportedAccountData() {
  return removeAccount();
}

/* -------------------------------------------------------------- accessors */
export function getGames() {
  return state.games || [];
}

export function getGame(id) {
  return (state.games || []).find(g => g.id === id) || null;
}

export function getProfile() {
  return state.profile;
}

export function getCurrentAccount() {
  const prof = getProfile();
  return prof?.displayName || null;
}

export function hasImportedData() {
  return state.isImported && (!!state.profile || state.games.length > 0);
}

export function hasAccount() {
  return !!state.profile || state.games.length > 0;
}

export function getLastSyncTime() {
  return localStorage.getItem(STORAGE_KEY_LAST_SYNC) || null;
}

export function getAccounts() {
  const prof = getProfile();
  const games = getGames();
  if (!prof && games.length === 0) return [];
  return [
    {
      id: prof?.id || 'primary',
      label: prof?.displayName || 'Primary Account',
      entitlements: games.length,
    }
  ];
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
