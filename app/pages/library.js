/* ==========================================================================
   Library Page - Phase 4 implementation

   All filtering, sorting and facet counting is delegated to services/filters.js.
   This module owns presentation and event wiring only: keeping a second copy of
   the predicate logic here is how the two drift apart.
   ========================================================================== */

import { getGames } from '../services/loader.js';
import {
  emptyFilters, facets, applyFilters, sortGames, bestRating,
  SORT_OPTIONS, activeFilterCount,
} from '../services/filters.js';

let filters = emptyFilters();
let sortKey = 'title-asc';
let view = 'grid';           // grid | list | compact
let facetCache = null;

export async function renderLibrary() {
  const content = document.getElementById('content');
  const games = getGames();
  facetCache = facets(games);

  content.innerHTML = `
    <div class="library-page">
      <div class="library-header">
        <div class="search-box">
          <input type="text" id="search" placeholder="Search title, developer, publisher, franchise…"
                 value="${escapeAttr(filters.search)}" autocomplete="off">
        </div>

        <select id="sort" class="sort-select" aria-label="Sort by">
          ${SORT_OPTIONS.map(o => `
            <option value="${o.value}" ${o.value === sortKey ? 'selected' : ''}>${o.label}</option>
          `).join('')}
        </select>

        <div class="view-switcher" role="group" aria-label="View mode">
          <button class="view-btn ${view === 'grid' ? 'active' : ''}" data-view="grid" title="Grid" aria-label="Grid view">⊞</button>
          <button class="view-btn ${view === 'list' ? 'active' : ''}" data-view="list" title="List" aria-label="List view">☰</button>
          <button class="view-btn ${view === 'compact' ? 'active' : ''}" data-view="compact" title="Compact" aria-label="Compact view">▤</button>
        </div>

        <button class="filter-toggle-btn" id="filter-toggle" aria-expanded="true">
          Filters<span id="filter-count" class="filter-count"></span>
        </button>
      </div>

      <div class="library-body">
        <aside class="filters glass-panel" id="filters">${renderFilterPanel(facetCache)}</aside>
        <div class="library-results">
          <p class="result-count" id="result-count"></p>
          <div class="library-grid" id="library-grid"></div>
        </div>
      </div>
    </div>
  `;

  wireEvents();
  renderResults();
}

/* ---------------------------------------------------------- filter panel */
function renderFilterPanel(fc) {
  const checkboxGroup = (name, items, limit) => `
    <div class="checkbox-list">
      ${items.slice(0, limit).map(({ value, count }) => `
        <label>
          <input type="checkbox" data-filter="${name}" value="${escapeAttr(value)}">
          <span class="cb-label">${escapeHtml(value)}</span>
          <span class="cb-count">${count}</span>
        </label>
      `).join('')}
    </div>
  `;

  return `
    <div class="filters-head">
      <h3>Filters</h3>
      <button class="btn-text" id="clear-filters">Clear all</button>
    </div>

    <div class="filter-group">
      <label class="filter-label">Genre</label>
      ${fc.genres.length ? checkboxGroup('genres', fc.genres, 14) : unknownNote(fc.missing.genres)}
    </div>

    <div class="filter-group">
      <label class="filter-label">Store</label>
      ${checkboxGroup('stores', fc.stores, 10)}
    </div>

    <div class="filter-group">
      <label class="filter-label">Platform</label>
      ${fc.platforms.length ? checkboxGroup('platforms', fc.platforms, 8) : unknownNote(fc.missing.platforms)}
    </div>

    <div class="filter-group">
      <label class="filter-label">Type</label>
      ${checkboxGroup('classifications', fc.classifications, 10)}
    </div>

    ${fc.franchises.length ? `
      <div class="filter-group">
        <label class="filter-label">Franchise</label>
        ${checkboxGroup('franchises', fc.franchises, 12)}
      </div>` : ''}

    <div class="filter-group">
      <label class="filter-label">Extraction confidence</label>
      ${checkboxGroup('confidences', fc.confidences, 5)}
    </div>

    <div class="filter-group">
      <label class="filter-label">Release year</label>
      <div class="range-inputs">
        <input type="number" data-filter="yearMin" placeholder="${fc.yearRange?.min ?? 'Min'}"
               min="1970" max="2030">
        <span>—</span>
        <input type="number" data-filter="yearMax" placeholder="${fc.yearRange?.max ?? 'Max'}"
               min="1970" max="2030">
      </div>
      ${fc.missing.releaseDate ? `<p class="filter-note">${fc.missing.releaseDate} titles have no verified release date and are excluded when this is set.</p>` : ''}
    </div>

    <div class="filter-group">
      <label class="filter-label">Minimum rating</label>
      <input type="number" data-filter="ratingMin" placeholder="0–100" min="0" max="100">
      ${fc.missing.rating ? `<p class="filter-note">${fc.missing.rating} titles are unrated and are excluded when this is set.</p>` : ''}
    </div>

    <div class="filter-group">
      <label class="filter-label">Store value</label>
      <div class="range-inputs">
        <input type="number" data-filter="priceMin" placeholder="${fc.priceRange?.min ?? 'Min'}" min="0">
        <span>—</span>
        <input type="number" data-filter="priceMax" placeholder="${fc.priceRange?.max ?? 'Max'}" min="0">
      </div>
      ${fc.missing.price ? `<p class="filter-note">${fc.missing.price} titles have no known price and are excluded when this is set.</p>` : ''}
    </div>

    <div class="filter-group">
      <label class="filter-label">Features</label>
      <div class="checkbox-list">
        <label><input type="checkbox" data-flag="multiplayerOnly"><span class="cb-label">Multiplayer</span></label>
        <label><input type="checkbox" data-flag="coopOnly"><span class="cb-label">Co-op</span></label>
        <label><input type="checkbox" data-flag="controllerOnly"><span class="cb-label">Controller support</span></label>
        <label><input type="checkbox" data-flag="achievementsOnly"><span class="cb-label">Achievements</span></label>
        <label><input type="checkbox" data-flag="freeOnly"><span class="cb-label">Free to play</span></label>
        <label><input type="checkbox" data-flag="playedOnly"><span class="cb-label">Played</span></label>
        <label><input type="checkbox" data-flag="unplayedOnly"><span class="cb-label">Never played</span></label>
      </div>
    </div>
  `;
}

function unknownNote(n) {
  return `<p class="filter-note">No verified values. ${n} titles unresolved.</p>`;
}

/* --------------------------------------------------------------- events */
function wireEvents() {
  document.getElementById('search').addEventListener('input', e => {
    filters.search = e.target.value;
    renderResults();
  });

  document.getElementById('sort').addEventListener('change', e => {
    sortKey = e.target.value;
    renderResults();
  });

  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      view = btn.dataset.view;
      document.querySelectorAll('.view-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.view === view));
      renderResults();
    });
  });

  const panel = document.getElementById('filters');
  document.getElementById('filter-toggle').addEventListener('click', e => {
    const collapsed = panel.classList.toggle('collapsed');
    e.currentTarget.setAttribute('aria-expanded', String(!collapsed));
  });

  // Multi-select facets
  panel.addEventListener('change', e => {
    const el = e.target;

    if (el.dataset.filter && el.type === 'checkbox') {
      const key = el.dataset.filter;
      const set = new Set(filters[key]);
      el.checked ? set.add(el.value) : set.delete(el.value);
      filters[key] = [...set];
      renderResults();
      return;
    }

    if (el.dataset.flag) {
      filters[el.dataset.flag] = el.checked;
      renderResults();
    }
  });

  // Numeric ranges
  panel.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.filter && el.type === 'number') {
      const raw = el.value.trim();
      filters[el.dataset.filter] = raw === '' ? null : Number(raw);
      renderResults();
    }
  });

  document.getElementById('clear-filters').addEventListener('click', () => {
    filters = emptyFilters();
    document.getElementById('search').value = '';
    panel.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });
    panel.querySelectorAll('input[type="number"]').forEach(i => { i.value = ''; });
    renderResults();
  });
}

/* -------------------------------------------------------------- results */
function renderResults() {
  const all = getGames();
  const shown = sortGames(applyFilters(all, filters), sortKey);

  const n = activeFilterCount(filters);
  const badge = document.getElementById('filter-count');
  if (badge) badge.textContent = n ? ` (${n})` : '';

  const count = document.getElementById('result-count');
  if (count) {
    count.textContent = shown.length === all.length
      ? `${all.length} titles`
      : `${shown.length} of ${all.length} titles`;
  }

  const grid = document.getElementById('library-grid');
  grid.className = `library-grid view-${view}`;

  if (!shown.length) {
    grid.innerHTML = `
      <div class="no-results">
        <p>Nothing matches these filters.</p>
        <p class="text-muted">Filters exclude titles whose value could not be verified rather than guessing at one.</p>
      </div>`;
    return;
  }

  grid.innerHTML = shown.map(card).join('');

  grid.querySelectorAll('.game-card').forEach(el => {
    el.addEventListener('click', () => {
      window.location.hash = `#game/${encodeURIComponent(el.dataset.id)}`;
    });
    el.addEventListener('keydown', ev => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        window.location.hash = `#game/${encodeURIComponent(el.dataset.id)}`;
      }
    });
  });
}

function card(game) {
  const rating = bestRating(game);
  const sym = game.currency === 'USD' ? '$' : '₹';

  const price = game.isFree
    ? '<span class="price price-free">Free</span>'
    : game.currentPrice != null
      ? `<span class="price">${sym}${Math.round(game.currentPrice).toLocaleString()}</span>`
      : '<span class="price price-unknown">—</span>';

  const genres = game.genres?.length ? game.genres.slice(0, 3).join(' · ') : 'Genre unverified';

  return `
    <article class="game-card card" data-id="${escapeAttr(game.id)}" tabindex="0" role="button">
      <div class="game-cover" style="background-image:url('${escapeAttr(game.cover)}')">
        ${rating != null ? `<span class="rating-badge">${Math.round(rating)}</span>` : ''}
        <span class="conf-dot conf-${String(game.confidence || 'medium').toLowerCase()}"
              title="${escapeAttr(game.confidence || 'Medium')} extraction confidence"></span>
      </div>
      <div class="game-info">
        <h4 class="game-title">${escapeHtml(game.title)}</h4>
        <p class="game-meta">${escapeHtml(genres)}</p>
        <div class="game-footer">
          <span class="game-platform">${escapeHtml(game.platforms?.[0] || game.marketplace || 'PC')}</span>
          ${price}
        </div>
      </div>
    </article>
  `;
}

/* -------------------------------------------------------------- helpers */
function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, '&#39;');
}
