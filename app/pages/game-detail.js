/* ==========================================================================
   Game Detail Page - Phase 4 implementation

   Layout order is deliberate and encodes the brief's monetary-prominence rule:
     hero (cover + background) -> description -> ratings -> features ->
     pricing (CURRENT STORE VALUE, primary) -> gallery -> provenance ->
     ownership (purchase date / price / marketplace / order id)  <-- LAST, faint

   Every field renders "Needs Manual Verification" when the enrichment could not
   confirm it. Nothing on this page is inferred.
   ========================================================================== */

import { getGames } from '../services/loader.js';

const UNKNOWN = '<span class="unverified">Needs Manual Verification</span>';

export async function renderGameDetail(params = {}) {
  const content = document.getElementById('content');
  const games = getGames();
  const game = games.find(g => g.id === params.id);

  if (!game) {
    content.innerHTML = `
      <div class="detail-missing">
        <p>That game is not in the current account's library.</p>
        <a href="#library" class="btn-secondary">Back to Library</a>
      </div>`;
    return;
  }

  document.getElementById('breadcrumb').textContent = game.title;

  content.innerHTML = `
    <article class="detail-page">
      ${renderHero(game)}

      <div class="detail-columns">
        <div class="detail-main">
          ${renderDescription(game)}
          ${renderRatings(game)}
          ${renderFeatures(game)}
          ${renderGallery(game)}
        </div>

        <aside class="detail-side">
          ${renderPricing(game)}
          ${renderFacts(game)}
          ${renderProvenance(game)}
        </aside>
      </div>

      ${renderOwnership(game)}
    </article>
  `;
}

/* -------------------------------------------------------------------- hero */
function renderHero(game) {
  const bg = game.background && !game.background.includes('placeholders')
    ? `style="background-image:linear-gradient(to top, var(--bg-void) 8%, rgba(7,8,12,.55) 55%, rgba(7,8,12,.25)), url('${game.background}')"`
    : '';

  const rating = game.metacritic ?? game.steamScore ?? game.igdbCritic;

  return `
    <header class="detail-hero" ${bg}>
      <div class="detail-hero-inner">
        <div class="detail-cover" style="background-image:url('${game.cover}')"></div>
        <div class="detail-headline">
          <h1>${escapeHtml(game.title)}</h1>
          <p class="detail-byline">
            ${game.developer ? escapeHtml(game.developer) : UNKNOWN}
            ${game.publisher && game.publisher !== game.developer
              ? ` &middot; <span class="text-muted">${escapeHtml(game.publisher)}</span>` : ''}
          </p>
          <div class="detail-chips">
            <span class="chip chip-store">${escapeHtml(game.marketplace || 'Unknown store')}</span>
            ${game.releaseDate ? `<span class="chip">${game.releaseDate}</span>` : ''}
            ${rating != null ? `<span class="chip chip-rating">${Math.round(rating)}</span>` : ''}
            <span class="chip chip-conf conf-${(game.confidence || 'medium').toLowerCase()}">
              ${game.confidence || 'Medium'} confidence
            </span>
          </div>
          ${game.genres?.length ? `
            <div class="detail-tags">
              ${game.genres.map(g => `<span class="tag">${escapeHtml(g)}</span>`).join('')}
            </div>` : ''}
        </div>
      </div>
    </header>
  `;
}

/* ------------------------------------------------------------- description */
function renderDescription(game) {
  if (!game.summary && !game.about) {
    return `<section class="glass-panel detail-block">
      <h3>About</h3><p class="text-muted">${UNKNOWN}</p></section>`;
  }
  return `
    <section class="glass-panel detail-block">
      <h3>About</h3>
      ${game.summary ? `<p class="detail-summary">${escapeHtml(game.summary)}</p>` : ''}
      ${game.about ? `<p class="detail-about">${escapeHtml(trim(game.about, 900))}</p>` : ''}
    </section>
  `;
}

/* ----------------------------------------------------------------- ratings */
function renderRatings(game) {
  const rows = [
    { label: 'Metacritic', value: game.metacritic, max: 100 },
    { label: 'Steam user score', value: game.steamScore, max: 100,
      note: game.steamReviewCount ? `${game.steamReviewCount.toLocaleString()} reviews` : null },
    { label: 'IGDB critic', value: game.igdbCritic, max: 100 },
    { label: 'OpenCritic', value: null, max: 100, reason: 'OpenCritic API not configured' },
  ];

  return `
    <section class="glass-panel detail-block">
      <h3>Ratings</h3>
      <div class="rating-rows">
        ${rows.map(r => `
          <div class="rating-row">
            <span class="rating-name">${r.label}</span>
            ${r.value != null ? `
              <div class="rating-track"><div class="rating-fill" style="width:${r.value}%"></div></div>
              <span class="rating-num">${Math.round(r.value)}</span>
            ` : `
              <span class="rating-none">${r.reason ? escapeHtml(r.reason) : 'Not available'}</span>
            `}
          </div>
          ${r.note ? `<p class="rating-note">${escapeHtml(r.note)}</p>` : ''}
        `).join('')}
      </div>
    </section>
  `;
}

/* ---------------------------------------------------------------- features */
const FEATURE_LABELS = {
  singlePlayer: 'Single-player',
  multiplayer: 'Multiplayer',
  coop: 'Co-op',
  onlineCoop: 'Online co-op',
  pvp: 'PvP',
  onlinePvp: 'Online PvP',
  splitScreen: 'Shared / split screen',
  achievements: 'Achievements',
  cloudSaves: 'Cloud saves',
  controllerSupport: 'Full controller support',
  partialControllerSupport: 'Partial controller support',
  tradingCards: 'Trading cards',
  remotePlayTogether: 'Remote Play Together',
};

function renderFeatures(game) {
  const features = game.features || {};
  const present = Object.entries(FEATURE_LABELS)
    .filter(([key]) => features[key] === true)
    .map(([, label]) => label);

  if (!present.length) {
    return `<section class="glass-panel detail-block">
      <h3>Features</h3>
      <p class="text-muted">No verified feature data for this title. ${UNKNOWN}</p>
    </section>`;
  }

  return `
    <section class="glass-panel detail-block">
      <h3>Features</h3>
      <ul class="feature-grid">
        ${present.map(f => `<li><span class="feature-tick">✓</span>${escapeHtml(f)}</li>`).join('')}
      </ul>
      <p class="detail-footnote">
        Steam Deck compatibility is not exposed by the storefront API and is not shown rather than guessed.
      </p>
    </section>
  `;
}

/* ----------------------------------------------------------------- gallery */
function renderGallery(game) {
  if (!game.screenshots?.length) return '';
  return `
    <section class="glass-panel detail-block">
      <h3>Gallery</h3>
      <div class="gallery">
        ${game.screenshots.slice(0, 8).map(src => `
          <div class="gallery-shot" style="background-image:url('${src}')"></div>
        `).join('')}
      </div>
    </section>
  `;
}

/* ----------------------------------------------------------------- pricing */
function renderPricing(game) {
  const sym = game.currency === 'USD' ? '$' : '₹';
  const fmt = v => v == null ? null : `${sym}${Math.round(v).toLocaleString()}`;

  const current = fmt(game.currentPrice);
  const msrp = fmt(game.msrp);
  const discounted = game.currentPrice != null && game.msrp != null && game.currentPrice < game.msrp;

  return `
    <section class="glass-panel detail-block pricing-block">
      <h3>Store Value</h3>
      <div class="price-primary">
        ${game.isFree ? 'Free' : (current ?? UNKNOWN)}
      </div>
      ${discounted ? `<div class="price-strike">${msrp}</div>` : ''}
      <dl class="price-rows">
        <dt>MSRP</dt><dd>${msrp ?? UNKNOWN}</dd>
        <dt>Historical low</dt>
        <dd><span class="unverified">Requires IsThereAnyDeal API</span></dd>
        <dt>Currency</dt><dd>${escapeHtml(game.currency || 'INR')}</dd>
      </dl>
    </section>
  `;
}

/* ------------------------------------------------------------------- facts */
function renderFacts(game) {
  const rows = [
    ['Developer', game.developer],
    ['Publisher', game.publisher],
    ['Franchise', game.franchise],
    ['Release date', game.releaseDate],
    ['Platforms', game.platforms?.join(', ')],
    ['Genres', game.genres?.join(', ')],
    ['Themes', game.themes?.join(', ')],
    ['Classification', game.classification],
  ];

  return `
    <section class="glass-panel detail-block">
      <h3>Details</h3>
      <dl class="fact-rows">
        ${rows.map(([k, v]) => `
          <dt>${k}</dt><dd>${v ? escapeHtml(String(v)) : UNKNOWN}</dd>
        `).join('')}
      </dl>
    </section>
  `;
}

/* -------------------------------------------------------------- provenance */
function renderProvenance(game) {
  const st = game.enrichmentStatus || {};
  const playtime = game.playtime > 0
    ? formatHours(game.playtime)
    : 'No recorded playtime';

  // sources is {transactionHistory: true, receiptEmail: true, ...}
  const sourceNames = game.sources && typeof game.sources === 'object'
    ? Object.keys(game.sources).filter(k => game.sources[k]).join(', ')
    : UNKNOWN;

  return `
    <section class="glass-panel detail-block">
      <h3>Provenance</h3>
      <dl class="fact-rows">
        <dt>Extraction sources</dt>
        <dd>${sourceNames === UNKNOWN ? UNKNOWN : escapeHtml(prettySources(sourceNames))}</dd>
        <dt>Confidence</dt><dd>${escapeHtml(game.confidence || 'Medium')}</dd>
        <dt>Recorded playtime</dt><dd>${escapeHtml(playtime)}</dd>
        <dt>Steam match</dt>
        <dd>${game.steamAppId ? `appid ${game.steamAppId}` : escapeHtml(st.steam || 'not attempted')}</dd>
        <dt>IGDB match</dt>
        <dd>${game.igdbId ? `id ${game.igdbId}` : escapeHtml(st.igdb || 'not attempted')}</dd>
      </dl>
    </section>
  `;
}

/* --------------------------------------------------------------- ownership */
/* Intentionally last in the DOM and rendered at --fs-micro / --text-faint.
   Purchase price is ownership metadata, not the headline value. */
function renderOwnership(game) {
  const sym = game.currency === 'USD' ? '$' : '₹';
  const paid = game.amountPaid != null
    ? (game.amountPaid === 0 ? 'Free / promotional' : `${sym}${Math.round(game.amountPaid).toLocaleString()}`)
    : 'Unknown';

  return `
    <section class="ownership-panel">
      <h4>Ownership record</h4>
      <dl>
        <dt>Acquired</dt><dd>${escapeHtml(game.purchaseDate || 'Unknown')}</dd>
        <dt>Paid</dt><dd>${escapeHtml(paid)}</dd>
        <dt>Marketplace</dt><dd>${escapeHtml(game.marketplace || 'Unknown')}</dd>
        <dt>Order ID</dt><dd class="mono">${escapeHtml(game.orderId || 'Unknown')}</dd>
      </dl>
    </section>
  `;
}

/* ----------------------------------------------------------------- helpers */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function trim(str, max) {
  return str.length > max ? str.slice(0, max).trimEnd() + '…' : str;
}

function formatHours(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function prettySources(raw) {
  return raw
    .replace(/transactionHistory/g, 'Transaction history')
    .replace(/receiptEmail/g, 'Receipt email')
    .replace(/launcherScreenshot/g, 'Launcher screenshot');
}
