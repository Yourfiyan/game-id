/* ==========================================================================
   Game ID — Library Page
   Matches Figma wireframe: horizontal filter chips, 240px cards, flat hover
   ========================================================================== */

import { getGames } from '../services/loader.js';
import {
  emptyFilters, facets, applyFilters, sortGames, bestRating,
  SORT_OPTIONS, activeFilterCount,
} from '../services/filters.js';

let filters = emptyFilters();
let sortKey = 'title-asc';
let view = 'grid';
let page = 1;
const PAGE_SIZE = 50;

export function formatPrice(val) {
  if (val == null || val === 0 || val === '0' || val === 'free') return 'Free';
  if (typeof val === 'string') return val;
  return `$${Math.round(val)}`;
}

export async function renderLibrary() {
  const content = document.getElementById('content');
  const games = getGames();
  const fc = facets(games);

  content.innerHTML = `
    <div class="library-page">
      <!-- Filter bar (horizontal chip dropdowns per Figma) -->
      <div class="filter-bar">
        <select class="filter-chip" id="flt-account" aria-label="Account">
          <option value="all">Account: All</option>
          <option value="A">Account A</option>
          <option value="B">Account B</option>
        </select>
        <select class="filter-chip" id="flt-confidence" aria-label="Confidence">
          <option value="all">Confidence: All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select class="filter-chip" id="flt-store" aria-label="Store">
          <option value="all">Store: All</option>
          ${fc.stores.map(s => `<option value="${escAttr(s.value)}">${escHtml(s.value)} (${s.count})</option>`).join('')}
        </select>
        <select class="filter-chip" id="flt-type" aria-label="Type">
          <option value="all">Type: All</option>
          ${fc.classifications.map(c => `<option value="${escAttr(c.value)}">${escHtml(c.value)} (${c.count})</option>`).join('')}
        </select>
        <span class="filter-spacer"></span>
        <select class="sort-chip" id="sort" aria-label="Sort">
          ${SORT_OPTIONS.map(o => `<option value="${o.value}" ${o.value === sortKey ? 'selected' : ''}>${o.label}</option>`).join('')}
        </select>
        <div class="view-toggle" role="group" aria-label="View mode">
          <button class="view-btn ${view === 'grid' ? 'active' : ''}" data-view="grid" title="Grid">&#x229E;</button>
          <button class="view-btn ${view === 'list' ? 'active' : ''}" data-view="list" title="List">&#x2630;</button>
          <button class="view-btn ${view === 'compact' ? 'active' : ''}" data-view="compact" title="Compact">&#x25A6;</button>
        </div>
      </div>

      <!-- Body: sidebar filters + results -->
      <div class="library-body">
        <aside class="filters-sidebar" id="filters-sidebar">
          <div class="filters-header">
            <span class="filters-title">Filters</span>
            <button class="clear-btn" id="clear-filters">Clear all</button>
          </div>
          ${renderFilterPanel(fc)}
        </aside>

        <div class="library-results" id="library-results">
          <p class="result-count" id="result-count"></p>
          <div class="library-grid" id="library-grid"></div>
          <div id="pagination-area"></div>
        </div>
      </div>
    </div>
  `;

  wireEvents(games, fc);
  renderResults(games, fc);
}

/* -------------------------------------------------------- filter panel */
function renderFilterPanel(fc) {
  const group = (label, items, filterKey) => `
    <div class="filter-group">
      <span class="filter-group-label">${label}</span>
      <div class="checkbox-list">
        ${items.map(({ value, count }) => `
          <label>
            <input type="checkbox" data-filter="${filterKey}" value="${escAttr(value)}">
            <span class="cb-label">${escHtml(value)}</span>
            <span class="cb-count">${count}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `;

  return `
    ${group('Genre', fc.genres.slice(0, 14), 'genres')}
    ${group('Store', fc.stores.slice(0, 10), 'stores')}
    ${group('Platform', fc.platforms.slice(0, 8), 'platforms')}
    ${group('Type', fc.classifications, 'classifications')}
    ${group('Extraction confidence', fc.confidences, 'confidences')}
    ${fc.franchises.length ? group('Franchise', fc.franchises.slice(0, 12), 'franchises') : ''}
    <div class="filter-group">
      <span class="filter-group-label">Release year</span>
      <div class="range-inputs">
        <input type="number" data-filter="yearMin" placeholder="${fc.yearRange?.min ?? 'Min'}" min="1970" max="2030">
        <span class="range-sep">&ndash;</span>
        <input type="number" data-filter="yearMax" placeholder="${fc.yearRange?.max ?? 'Max'}" min="1970" max="2030">
      </div>
      ${fc.missing.releaseDate ? `<p class="filter-note">${fc.missing.releaseDate} titles have no verified release date.</p>` : ''}
    </div>
    <div class="filter-group">
      <span class="filter-group-label">Minimum rating</span>
      <input type="number" data-filter="ratingMin" placeholder="0&ndash;100" min="0" max="100" style="width:100%;height:32px;padding:0 10px;font-family:var(--font-sans);font-size:12px;color:var(--fg-primary);background:var(--bg-subtle);border:1px solid var(--stroke-divider);border-radius:var(--r-sm);outline:none">
      ${fc.missing.rating ? `<p class="filter-note">${fc.missing.rating} titles unrated.</p>` : ''}
    </div>
    <div class="filter-group">
      <span class="filter-group-label">Store value</span>
      <div class="range-inputs">
        <input type="number" data-filter="priceMin" placeholder="${fc.priceRange?.min ?? 'Min'}" min="0">
        <span class="range-sep">&ndash;</span>
        <input type="number" data-filter="priceMax" placeholder="${fc.priceRange?.max ?? 'Max'}" min="0">
      </div>
      ${fc.missing.price ? `<p class="filter-note">${fc.missing.price} titles have no known price.</p>` : ''}
    </div>
    <div class="filter-group">
      <span class="filter-group-label">Features</span>
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

/* --------------------------------------------------------------- events */
function wireEvents(games, fc) {
  // Search (from topbar)
  const searchInput = document.getElementById('topbar-search');
  const doSearch = () => {
    filters.search = searchInput.value;
    page = 1;
    renderResults(games, fc);
  };
  searchInput?.addEventListener('input', doSearch);
  searchInput.value = filters.search;

  // Sort
  document.getElementById('sort')?.addEventListener('change', e => {
    sortKey = e.target.value;
    page = 1;
    renderResults(games, fc);
  });

  // View toggle
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      view = btn.dataset.view;
      document.querySelectorAll('.view-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.view === view));
      renderResults(games, fc);
    });
  });

  // Filter chips
  const chipMap = {
    'flt-account': v => { filters.account = v === 'all' ? null : v; },
    'flt-confidence': v => { filters.confidences = v === 'all' ? [] : [v]; },
    'flt-store': v => { filters.stores = v === 'all' ? [] : [v]; },
    'flt-type': v => { filters.classifications = v === 'all' ? [] : [v]; },
  };
  Object.entries(chipMap).forEach(([id, fn]) => {
    document.getElementById(id)?.addEventListener('change', e => {
      fn(e.target.value);
      page = 1;
      renderResults(games, fc);
    });
  });

  // Filter sidebar checkboxes
  const sidebar = document.getElementById('filters-sidebar');
  sidebar?.addEventListener('change', e => {
    const el = e.target;
    if (el.dataset.filter && el.type === 'checkbox') {
      const key = el.dataset.filter;
      const set = new Set(filters[key]);
      el.checked ? set.add(el.value) : set.delete(el.value);
      filters[key] = [...set];
      page = 1;
      renderResults(games, fc);
    }
    if (el.dataset.flag) {
      filters[el.dataset.flag] = el.checked;
      page = 1;
      renderResults(games, fc);
    }
  });

  // Range inputs
  sidebar?.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.filter && el.type === 'number') {
      const raw = el.value.trim();
      filters[el.dataset.filter] = raw === '' ? null : Number(raw);
      page = 1;
      renderResults(games, fc);
    }
  });

  // Clear
  document.getElementById('clear-filters')?.addEventListener('click', () => {
    filters = emptyFilters();
    sidebar?.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });
    sidebar?.querySelectorAll('input[type="number"]').forEach(i => { i.value = ''; });
    searchInput.value = '';
    document.getElementById('flt-account').value = 'all';
    document.getElementById('flt-confidence').value = 'all';
    document.getElementById('flt-store').value = 'all';
    document.getElementById('flt-type').value = 'all';
    page = 1;
    renderResults(games, fc);
  });
}

/* -------------------------------------------------------------- results */
function renderResults(games, fc) {
  // Apply account filter from chip
  let filtered = games;
  if (filters.account) {
    filtered = filtered.filter(g => g.raw?.account === filters.account || g._account === filters.account);
  }

  filtered = applyFilters(filtered, filters);
  filtered = sortGames(filtered, sortKey);

  const total = filtered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  if (page > totalPages) page = totalPages;
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const countEl = document.getElementById('result-count');
  if (countEl) {
    countEl.textContent = `${total} title${total !== 1 ? 's' : ''}`;
  }

  const grid = document.getElementById('library-grid');
  if (!grid) return;
  grid.className = `library-grid view-${view}`;

  if (!total) {
    grid.innerHTML = `
      <div class="no-results">
        <p>No titles match your filters.</p>
        <p style="font-size:12px;color:var(--fg-tertiary)">Try adjusting or clearing filters.</p>
      </div>`;
    document.getElementById('pagination-area').innerHTML = '';
    return;
  }

  grid.innerHTML = pageItems.map(card).join('');

  // Pagination
  document.getElementById('pagination-area').innerHTML = renderPagination(total, totalPages, start, PAGE_SIZE);

  // Wire card clicks
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

  // Wire pagination buttons
  document.querySelectorAll('#pagination-area .page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      page = parseInt(btn.dataset.page, 10);
      renderResults(games, fc);
      document.getElementById('library-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* --------------------------------------------------------- card renderer */
function card(game) {
  const rating = bestRating(game);
  const sym = game.currency === 'USD' ? '$' : '₹';
  const price = game.isFree
    ? '<span class="price-tag price-free">Free</span>'
    : game.currentPrice != null
      ? `<span class="price-tag">${sym}${Math.round(game.currentPrice).toLocaleString()}</span>`
      : '<span class="price-tag price-unknown">—</span>';

  const platform = game.platforms?.[0] || game.marketplace || 'PC';
  const genres = game.genres?.length ? game.genres.slice(0, 3).join(' · ') : '—';
  const conf = (game.confidence || 'medium').toLowerCase();

  // catalog icon SVG
  const catalogIcon = `<svg class="game-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`;

  return `
    <article class="game-card card" data-id="${escAttr(game.id)}" tabindex="0" role="button">
      <div class="game-cover">
        ${!game.cover ? `<div class="cover-fallback">${game.title ? game.title[0].toUpperCase() : '?'}</div>` : ''}
        ${game.cover ? `<img class="cover-img" src="${escAttr(game.cover)}" alt="" loading="lazy">` : ''}
        ${rating != null ? `<span class="rating-badge">${Math.round(rating)}</span>` : ''}
        <span class="conf-dot conf-${conf}" title="${conf} extraction confidence"></span>
      </div>
      <div class="game-info">
        <h4 class="game-title">${escHtml(game.title)}</h4>
        <p class="game-meta">
          ${catalogIcon}
          <span>${escHtml(genres)}</span>
        </p>
        <div class="game-footer">
          <span class="game-platform">${escHtml(platform)}</span>
          ${game.title === 'Needs Manual Verification' ? '<span class="unmatched-tag">Needs manual verification</span>' : price}
        </div>
      </div>
    </article>
  `;
}

/* ----------------------------------------------------------- pagination */
function renderPagination(total, totalPages, start, pageSize) {
  if (totalPages <= 1) return '';

  const end = Math.min(start + pageSize, total);
  const pages = pageButtons(page, totalPages);

  return `
    <div class="pagination-bar">
      <div class="pagination-info">${start + 1}–${end} of ${total}</div>
      <div class="pagination-controls">
        <select class="page-size-select" aria-label="Items per page">
          <option value="25">25 per page</option>
          <option value="50" selected>50 per page</option>
          <option value="100">100 per page</option>
          <option value="200">200 per page</option>
        </select>
        ${pages}
      </div>
    </div>
  `;
}

function pageButtons(current, total) {
  const range = 7;
  let startP = Math.max(1, current - Math.floor(range / 2));
  let endP = Math.min(total, startP + range - 1);
  if (endP - startP < range - 1) startP = Math.max(1, endP - range + 1);

  const btns = [];

  if (startP > 1) {
    btns.push(`<button class="page-btn" data-page="1">1</button>`);
    if (startP > 2) btns.push(`<span class="page-btn" style="cursor:default;border-color:transparent">&hellip;</span>`);
  }

  for (let i = startP; i <= endP; i++) {
    btns.push(`<button class="page-btn${i === current ? ' active' : ''}" data-page="${i}">${i}</button>`);
  }

  if (endP < total) {
    if (endP < total - 1) btns.push(`<span class="page-btn" style="cursor:default;border-color:transparent">&hellip;</span>`);
    btns.push(`<button class="page-btn" data-page="${total}">${total}</button>`);
  }

  return btns.join('');
}

/* ------------------------------------------------------------- helpers */
function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escAttr(s) {
  return escHtml(s).replace(/'/g, '&#39;');
}
