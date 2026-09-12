/* ==========================================================================
   Game ID — Library Page
   Matches Figma wireframe: horizontal filter chips, 240px cards, flat hover
   ========================================================================== */

import { getGames, hasAccount } from '../services/loader.js';
import {
  emptyFilters, facets, applyFilters, sortGames, bestRating,
  SORT_OPTIONS, activeFilterCount,
} from '../services/filters.js';
import { openSyncModal } from '../components/sync-modal.js';

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

  if (!games || games.length === 0) {
    content.innerHTML = `
      <div class="library-page" style="padding: 24px;">
        <div style="background: var(--bg-layer); border: 1px solid var(--stroke-subtle); border-radius: var(--r-lg); padding: 48px 32px; text-align: center; max-width: 640px; margin: 40px auto;">
          <div style="font-size: 40px; margin-bottom: 16px;">🎮</div>
          <h2 style="font-size: 20px; font-weight: 600; color: var(--fg-primary); margin-bottom: 8px;">Your Library is Empty</h2>
          <p style="font-size: 14px; color: var(--fg-secondary); line-height: 1.5; margin-bottom: 24px;">
            No account is currently connected. Import your official Epic Games GDPR data export package (.zip or .pdf) to browse, filter, and inspect your entire collection.
          </p>
          <button class="btn-primary" id="btn-library-sync" style="font-size: 13px; padding: 8px 20px;">
            Sync / Import Library
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-library-sync')?.addEventListener('click', () => {
      openSyncModal();
    });
    return;
  }

  const fc = facets(games);

  content.innerHTML = `
    <div class="library-page">
      <!-- Filter bar (horizontal chip dropdowns per Figma) -->
      <div class="filter-bar">
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
    filters.search = searchInput ? searchInput.value : '';
    page = 1;
    renderResults(games, fc);
  };
  if (searchInput) {
    searchInput.addEventListener('input', debounce(doSearch, 200));
  }

  // Top filter chips
  document.getElementById('flt-confidence')?.addEventListener('change', e => {
    filters.confidence = e.target.value === 'all' ? null : e.target.value;
    page = 1;
    renderResults(games, fc);
  });
  document.getElementById('flt-store')?.addEventListener('change', e => {
    filters.stores = e.target.value === 'all' ? [] : [e.target.value];
    page = 1;
    renderResults(games, fc);
  });
  document.getElementById('flt-type')?.addEventListener('change', e => {
    filters.classifications = e.target.value === 'all' ? [] : [e.target.value];
    page = 1;
    renderResults(games, fc);
  });

  // Sort
  document.getElementById('sort')?.addEventListener('change', e => {
    sortKey = e.target.value;
    renderResults(games, fc);
  });

  // View toggle
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      view = btn.dataset.view;
      document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b === btn));
      renderResults(games, fc);
    });
  });

  // Sidebar checkbox filters
  const sidebar = document.getElementById('filters-sidebar');
  sidebar?.addEventListener('change', e => {
    const el = e.target;
    if (el.dataset.filter) {
      const key = el.dataset.filter;
      const val = el.value;
      if (el.checked) {
        if (!filters[key].includes(val)) filters[key].push(val);
      } else {
        filters[key] = filters[key].filter(x => x !== val);
      }
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
    if (searchInput) searchInput.value = '';
    const fltAccount = document.getElementById('flt-account');
    if (fltAccount) fltAccount.value = 'all';
    const fltConf = document.getElementById('flt-confidence');
    if (fltConf) fltConf.value = 'all';
    const fltStore = document.getElementById('flt-store');
    if (fltStore) fltStore.value = 'all';
    const fltType = document.getElementById('flt-type');
    if (fltType) fltType.value = 'all';
    page = 1;
    renderResults(games, fc);
  });
}

/* -------------------------------------------------------------- results */
function renderResults(games, fc) {
  let filtered = games;
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
    const pagArea = document.getElementById('pagination-area');
    if (pagArea) pagArea.innerHTML = '';
    return;
  }

  grid.innerHTML = pageItems.map(card).join('');

  // Pagination
  const pagArea = document.getElementById('pagination-area');
  if (pagArea) pagArea.innerHTML = renderPagination(total, totalPages, start, PAGE_SIZE);

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
  wirePagination(total, totalPages, games, fc);
}

function card(g) {
  const rating = bestRating(g);
  const isNeedsVerif = g.title === 'Needs Manual Verification';
  const displayTitle = isNeedsVerif
    ? '<span style="color:var(--fg-quaternary);font-style:italic">Needs Manual Verification</span>'
    : escHtml(g.title);

  const ratingHtml = rating
    ? `<span class="rating-badge">${rating.source === 'Steam' ? '👍' : '★'} ${rating.score}</span>`
    : '';

  const confBadge = `<span class="conf-dot conf-${(g.confidence || 'medium').toLowerCase()}" title="Confidence: ${g.confidence || 'Medium'}"></span>`;
  const priceFormatted = g.isFree ? 'Free' : (g.currentPrice != null ? `$${Math.round(g.currentPrice)}` : (g.msrp != null ? `$${Math.round(g.msrp)}` : ''));

  return `
    <article class="game-card" data-id="${escAttr(g.id)}" tabindex="0" role="button" aria-label="${escAttr(g.title)}">
      <div class="card-cover">
        <img src="${escAttr(g.cover || 'assets/placeholders/cover.svg')}"
             alt="${escAttr(g.title)}"
             loading="lazy"
             onerror="this.src='assets/placeholders/cover.svg';">
        <div class="card-badges">
          ${confBadge}
          ${ratingHtml}
        </div>
      </div>
      <div class="card-body">
        <h3 class="card-title" title="${escAttr(g.title)}">${displayTitle}</h3>
        <p class="card-meta">
          <span>${escHtml(g.developer || g.publisher || g.marketplace || 'Epic Games')}</span>
          ${priceFormatted ? `<span>${priceFormatted}</span>` : ''}
        </p>
      </div>
    </article>
  `;
}

function renderPagination(total, totalPages, start, pageSize) {
  if (totalPages <= 1) return '';
  const from = start + 1;
  const to = Math.min(start + pageSize, total);
  return `
    <div class="pagination">
      <span class="pagination-info">Showing ${from}&ndash;${to} of ${total}</span>
      <div class="pagination-buttons">
        <button class="pag-btn" id="pag-prev" ${page <= 1 ? 'disabled' : ''}>&larr; Prev</button>
        <span class="pag-current">Page ${page} of ${totalPages}</span>
        <button class="pag-btn" id="pag-next" ${page >= totalPages ? 'disabled' : ''}>Next &rarr;</button>
      </div>
    </div>
  `;
}

function wirePagination(total, totalPages, games, fc) {
  document.getElementById('pag-prev')?.addEventListener('click', () => {
    if (page > 1) {
      page--;
      renderResults(games, fc);
      document.querySelector('.library-results')?.scrollIntoView({ behavior: 'smooth' });
    }
  });
  document.getElementById('pag-next')?.addEventListener('click', () => {
    if (page < totalPages) {
      page++;
      renderResults(games, fc);
      document.querySelector('.library-results')?.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escAttr(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
