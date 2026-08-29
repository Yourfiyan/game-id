/* ==========================================================================
   Filters Service - Phase 4/5 filtering, sorting and facet extraction

   Pure functions over ONE account's games array. Like analytics.js, nothing
   here accepts two accounts, so the no-merge rule cannot be violated by
   calling a filter helper.

   Null discipline: a game missing the field being filtered on is EXCLUDED from
   a positive filter (you asked for "rating >= 80", an unrated game is not a
   match) but is never silently treated as 0. Sorting pushes unknowns last in
   both directions so "worst rated" never means "unrated".
   ========================================================================== */

/* ------------------------------------------------------------ empty filter */
export function emptyFilters() {
  return {
    search: '',
    genres: [],
    themes: [],
    tags: [],
    stores: [],
    platforms: [],
    franchises: [],
    classifications: [],
    confidences: [],
    yearMin: null,
    yearMax: null,
    ratingMin: null,
    priceMin: null,
    priceMax: null,
    multiplayerOnly: false,
    coopOnly: false,
    controllerOnly: false,
    achievementsOnly: false,
    freeOnly: false,
    playedOnly: false,
    unplayedOnly: false,
  };
}

/* ---------------------------------------------------------------- facets */
/** Every selectable filter value present in this account, with counts. */
export function facets(games) {
  const count = (list) => {
    const m = new Map();
    for (const v of list) m.set(v, (m.get(v) || 0) + 1);
    return [...m.entries()]
      .map(([value, n]) => ({ value, count: n }))
      .sort((a, b) => b.count - a.count || String(a.value).localeCompare(String(b.value)));
  };

  const years = games
    .map(g => g.releaseDate ? new Date(g.releaseDate).getFullYear() : null)
    .filter(y => y && !Number.isNaN(y));

  const prices = games.map(g => g.currentPrice).filter(v => v != null);

  return {
    genres: count(games.flatMap(g => g.genres || [])),
    themes: count(games.flatMap(g => g.themes || [])),
    tags: count(games.flatMap(g => g.tags || [])),
    stores: count(games.map(g => g.marketplace || 'Unknown')),
    platforms: count(games.flatMap(g => g.platforms || [])),
    franchises: count(games.map(g => g.franchise).filter(Boolean)),
    classifications: count(games.map(g => g.classification)),
    confidences: count(games.map(g => g.confidence)),
    yearRange: years.length ? { min: Math.min(...years), max: Math.max(...years) } : null,
    priceRange: prices.length
      ? { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) }
      : null,
    // How many titles a facet can never describe, so the UI can be honest
    // about what filtering excludes.
    missing: {
      genres: games.filter(g => !g.genres?.length).length,
      platforms: games.filter(g => !g.platforms?.length).length,
      releaseDate: games.filter(g => !g.releaseDate).length,
      rating: games.filter(g => g.metacritic == null && g.steamScore == null && g.igdbCritic == null).length,
      price: games.filter(g => g.currentPrice == null).length,
    },
  };
}

/* --------------------------------------------------------------- matching */
function normalize(s) {
  return String(s).normalize('NFKC').toLowerCase();
}

/** Searchable text for a game: title, people, franchise, genres, tags. */
function haystack(game) {
  return normalize([
    game.title, game.rawTitle, game.developer, game.publisher, game.franchise,
    ...(game.genres || []), ...(game.themes || []), ...(game.tags || []),
  ].filter(Boolean).join(' '));
}

function anyOverlap(selected, values) {
  if (!selected?.length) return true;          // filter inactive
  if (!values?.length) return false;           // unknown never matches a positive filter
  return selected.some(s => values.includes(s));
}

export function matches(game, f) {
  if (f.search) {
    const terms = normalize(f.search).split(/\s+/).filter(Boolean);
    const hay = haystack(game);
    if (!terms.every(t => hay.includes(t))) return false;
  }

  if (!anyOverlap(f.genres, game.genres)) return false;
  if (!anyOverlap(f.themes, game.themes)) return false;
  if (!anyOverlap(f.tags, game.tags)) return false;
  if (!anyOverlap(f.platforms, game.platforms)) return false;

  if (f.stores?.length && !f.stores.includes(game.marketplace || 'Unknown')) return false;
  if (f.franchises?.length && !f.franchises.includes(game.franchise)) return false;
  if (f.classifications?.length && !f.classifications.includes(game.classification)) return false;
  if (f.confidences?.length && !f.confidences.includes(game.confidence)) return false;

  if (f.yearMin != null || f.yearMax != null) {
    if (!game.releaseDate) return false;
    const y = new Date(game.releaseDate).getFullYear();
    if (Number.isNaN(y)) return false;
    if (f.yearMin != null && y < f.yearMin) return false;
    if (f.yearMax != null && y > f.yearMax) return false;
  }

  if (f.ratingMin != null) {
    const r = bestRating(game);
    if (r == null || r < f.ratingMin) return false;
  }

  if (f.priceMin != null || f.priceMax != null) {
    if (game.currentPrice == null) return false;
    if (f.priceMin != null && game.currentPrice < f.priceMin) return false;
    if (f.priceMax != null && game.currentPrice > f.priceMax) return false;
  }

  if (f.multiplayerOnly && game.features?.multiplayer !== true) return false;
  if (f.coopOnly && game.features?.coop !== true && game.features?.onlineCoop !== true) return false;
  if (f.controllerOnly && game.features?.controllerSupport !== true) return false;
  if (f.achievementsOnly && game.features?.achievements !== true) return false;
  if (f.freeOnly && game.isFree !== true) return false;
  if (f.playedOnly && !(game.playtime > 0)) return false;
  if (f.unplayedOnly && game.playtime > 0) return false;

  return true;
}

export function applyFilters(games, f) {
  return games.filter(g => matches(g, f));
}

/** Highest-authority rating available: Metacritic > Steam > IGDB. Null if none. */
export function bestRating(game) {
  return game.metacritic ?? game.steamScore ?? game.igdbCritic ?? null;
}

/* ---------------------------------------------------------------- sorting */
export const SORT_OPTIONS = [
  { value: 'title-asc', label: 'Title A→Z' },
  { value: 'title-desc', label: 'Title Z→A' },
  { value: 'release-desc', label: 'Release date, newest' },
  { value: 'release-asc', label: 'Release date, oldest' },
  { value: 'rating-desc', label: 'Rating, highest' },
  { value: 'rating-asc', label: 'Rating, lowest' },
  { value: 'price-desc', label: 'Store value, highest' },
  { value: 'price-asc', label: 'Store value, lowest' },
  { value: 'purchase-desc', label: 'Acquired, newest' },
  { value: 'purchase-asc', label: 'Acquired, oldest' },
  { value: 'playtime-desc', label: 'Playtime, most' },
  { value: 'developer-asc', label: 'Developer A→Z' },
  { value: 'publisher-asc', label: 'Publisher A→Z' },
];

const KEYFN = {
  title: g => normalize(g.title),
  developer: g => g.developer ? normalize(g.developer) : null,
  publisher: g => g.publisher ? normalize(g.publisher) : null,
  release: g => g.releaseDate ? new Date(g.releaseDate).getTime() : null,
  purchase: g => g.purchaseDate ? new Date(g.purchaseDate).getTime() : null,
  rating: g => bestRating(g),
  price: g => g.currentPrice ?? null,
  playtime: g => (g.playtime > 0 ? g.playtime : null),
};

/**
 * Unknown values always sort last, regardless of direction. Coercing them to 0
 * would make "lowest rated" a list of games that simply have no rating.
 */
export function sortGames(games, sortKey = 'title-asc') {
  const [field, dir] = String(sortKey).split('-');
  const keyOf = KEYFN[field] || KEYFN.title;
  const sign = dir === 'desc' ? -1 : 1;

  return [...games].sort((a, b) => {
    const ka = keyOf(a);
    const kb = keyOf(b);

    const aNull = ka == null || ka === '';
    const bNull = kb == null || kb === '';
    if (aNull && bNull) return normalize(a.title).localeCompare(normalize(b.title));
    if (aNull) return 1;
    if (bNull) return -1;

    if (ka < kb) return -1 * sign;
    if (ka > kb) return 1 * sign;
    return normalize(a.title).localeCompare(normalize(b.title));
  });
}

/* ------------------------------------------------------------------ state */
/** Serialise filters to a URL query string so a view can be shared/restored. */
export function toQueryString(f) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) {
    if (v == null || v === '' || v === false) continue;
    if (Array.isArray(v)) { if (v.length) p.set(k, v.join('|')); }
    else p.set(k, String(v));
  }
  return p.toString();
}

export function fromQueryString(qs) {
  const p = new URLSearchParams(qs);
  const f = emptyFilters();
  for (const [k, v] of p.entries()) {
    if (!(k in f)) continue;
    if (Array.isArray(f[k])) f[k] = v.split('|').filter(Boolean);
    else if (typeof f[k] === 'boolean') f[k] = v === 'true';
    else if (f[k] === null && /Min$|Max$/.test(k)) f[k] = Number(v);
    else f[k] = v;
  }
  return f;
}

export function activeFilterCount(f) {
  const base = emptyFilters();
  let n = 0;
  for (const [k, v] of Object.entries(f)) {
    const d = base[k];
    if (Array.isArray(v) ? v.length : v !== d && v !== null && v !== '' && v !== false) n += 1;
  }
  return n;
}
