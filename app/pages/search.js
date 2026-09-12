/* ==========================================================================
   Game ID — Search Page
   ========================================================================== */

import { getGames } from '../services/loader.js';
import { openSyncModal } from '../components/sync-modal.js';

const SUGGESTIONS = [
  'genre:roguelike',
  'store:epic',
  'platform:windows',
  'platform:mac',
  'played',
  'never played',
  'confidence:high',
  'price:paid',
  'price:free',
  'rating:≥80',
];

function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function parseQuery(raw) {
  const q = String(raw).trim();
  const lower = q.toLowerCase();
  const filters = {};
  let freeText = q;

  const platformRe = /platform:(\w+)/i;
  const mPlat = lower.match(platformRe);
  if (mPlat) { filters.platform = mPlat[1]; freeText = freeText.replace(platformRe, '').trim(); }

  const genreRe = /genre:(\w+)/i;
  const mGenre = lower.match(genreRe);
  if (mGenre) { filters.genre = mGenre[1]; freeText = freeText.replace(genreRe, '').trim(); }

  const storeRe = /store:(\w+)/i;
  const mStore = lower.match(storeRe);
  if (mStore) { filters.store = mStore[1]; freeText = freeText.replace(storeRe, '').trim(); }

  if (/free/i.test(lower))       { filters.price = 'free';     freeText = freeText.replace(/free/gi, '').trim(); }
  if (/paid|priced/i.test(lower)){ filters.price = 'paid';     freeText = freeText.replace(/paid|priced/gi, '').trim(); }

  const playRe = /played|never played/i;
  const mPlay = lower.match(playRe);
  if (mPlay) {
    filters.played = mPlay[0].toLowerCase().includes('never') ? false : true;
    freeText = freeText.replace(playRe, '').trim();
  }

  const confRe = /confidence:(high|medium|low)/i;
  const mConf = lower.match(confRe);
  if (mConf) { filters.confidence = mConf[1].toLowerCase(); freeText = freeText.replace(confRe, '').trim(); }

  const ratingRe = /rating[:\s≥>]+(\d+)/i;
  const mRating = lower.match(ratingRe);
  if (mRating) { filters.minRating = parseInt(mRating[1]); freeText = freeText.replace(ratingRe, '').trim(); }

  return { q: freeText, filters };
}

function matches(g, q, filters) {
  if (q) {
    const hay = `${g.title} ${g.developer ?? ''} ${g.publisher ?? ''} ${(g.genres ?? []).join(' ')}`.toLowerCase();
    if (!hay.includes(q.toLowerCase())) return false;
  }
  if (filters.platform) {
    const p = filters.platform.toLowerCase();
    if (!(g.platforms || []).some(x => String(x).toLowerCase().includes(p))) return false;
  }
  if (filters.genre) {
    if (!(g.genres ?? []).some(x => x.toLowerCase().includes(filters.genre))) return false;
  }
  if (filters.store) {
    const s = (g.marketplace || g.store || '').toLowerCase();
    if (!s.includes(filters.store)) return false;
  }
  if (filters.price === 'free') {
    if (!g.isFree && (g.currentPrice ?? g.msrp) > 0) return false;
  }
  if (filters.price === 'paid') {
    if (g.isFree || (g.currentPrice ?? g.msrp ?? 0) === 0) return false;
  }
  if (filters.played === false) {
    if (g.playtime && g.playtime > 0) return false;
  }
  if (filters.played === true) {
    if (!g.playtime || g.playtime === 0) return false;
  }
  if (filters.confidence) {
    if ((g.confidence || '').toLowerCase() !== filters.confidence) return false;
  }
  if (filters.minRating != null) {
    const r = g.steamScore ?? g.igdbCritic ?? g.metacritic;
    if (r == null || r < filters.minRating) return false;
  }
  return true;
}

export async function renderSearch(presetQuery) {
  const content = document.getElementById('content');
  const query = presetQuery || '';
  const games = getGames();

  content.innerHTML = `
    <div class="page search-page">
      <div class="search-hero">
        <h1>Search</h1>
        <p>Search ${games.length} entitlements by title, genre, platform, store, confidence, or playtime.</p>
        <div class="search-suggestions">
          ${SUGGESTIONS.map(s => `<button class="search-chip">${esc(s)}</button>`).join('')}
        </div>
      </div>
      <div id="search-results"></div>
    </div>
  `;

  const box = content.querySelector('.search-hero');

  // Build search input
  const inputWrap = document.createElement('div');
  inputWrap.style.cssText = 'position:relative;margin-top:16px';
  inputWrap.innerHTML = `
    <input id="search-input" type="text" placeholder="Try: genre:roguelike  ·  platform:windows  ·  confidence:high  ·  played"
           value="${esc(query)}"
           style="width:100%;height:40px;padding:0 14px 0 40px;font-family:var(--font-sans);font-size:14px;color:var(--fg-primary);background:var(--bg-subtle);border:1px solid var(--stroke-divider);border-radius:var(--r-md);outline:none;transition:border-color var(--t-fast)">
    <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:16px;opacity:0.4;pointer-events:none">🔍</span>
  `;
  box.appendChild(inputWrap);

  const input = document.getElementById('search-input');
  const resultsEl = document.getElementById('search-results');

  function doSearch(raw) {
    const allGames = getGames();
    if (!allGames.length) {
      resultsEl.innerHTML = `
        <div class="no-results" style="padding: 40px 20px; text-align: center;">
          <p style="font-size: 16px; font-weight: 600; color: var(--fg-primary);">No library connected</p>
          <p style="font-size: 13px; color: var(--fg-secondary); margin-top: 4px; margin-bottom: 16px;">
            Import your Epic Games account export to enable full-text searching across your collection.
          </p>
          <button class="btn-primary" id="search-sync-btn" style="font-size: 12px; padding: 6px 16px;">Sync now</button>
        </div>
      `;
      document.getElementById('search-sync-btn')?.addEventListener('click', () => openSyncModal());
      return;
    }

    const { q, filters } = parseQuery(raw);
    let matchedGames = allGames;
    if (q || Object.keys(filters).length) {
      matchedGames = allGames.filter(g => matches(g, q, filters));
    }
    const total = matchedGames.length;
    if (!raw && !total) {
      resultsEl.innerHTML = `
        <div class="search-results-head"><span></span></div>
        <div class="no-results"><p>Start typing to search</p><p>All ${allGames.length} titles will appear as you type</p></div>
      `;
      return;
    }
    const top = matchedGames.slice(0, 50);
    resultsEl.innerHTML = `
      <div class="search-results-head">
        <span class="result-meta">${total} result${total !== 1 ? 's' : ''}${Object.keys(filters).length ? ' (filtered)' : ''}</span>
        ${raw ? `<button class="clear-search-btn">Clear</button>` : ''}
      </div>
      ${total ? `
        <div style="overflow-y:auto;max-height:calc(100vh - 260px)">
          <table class="search-table">
            <thead><tr><th>Title</th><th>Store</th><th>Platform</th><th>Confidence</th></tr></thead>
            <tbody>
              ${top.map(g => `
                <tr class="clickable" data-id="${esc(g.id)}">
                  <td class="td-title">${esc(g.title)}</td>
                  <td class="td-platform">${esc(g.marketplace || g.store || 'Epic Games')}</td>
                  <td>${esc((g.platforms || ['Windows']).join(', '))}</td>
                  <td><span class="badge badge-${(g.confidence || 'medium').toLowerCase() === 'high' ? 'success' : ((g.confidence || '').toLowerCase() === 'low' ? 'danger' : 'caution')}">${esc(g.confidence || 'Medium')}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ${total > 50 ? `<div class="text-muted" style="font-size:12px;margin-top:8px;text-align:right">Showing first 50 of ${total}</div>` : ''}
      ` : `
        <div class="no-results">
          <p>No results</p>
          <p>Try different keywords or remove filters.</p>
        </div>
      `}
    `;
    resultsEl.querySelectorAll('[data-id]').forEach(el => {
      el.addEventListener('click', () => {
        window.location.hash = `#game/${encodeURIComponent(el.dataset.id)}`;
      });
    });
    const clearBtn = resultsEl.querySelector('.clear-search-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        doSearch('');
      });
    }
  }

  input.addEventListener('input', () => doSearch(input.value));
  box.querySelectorAll('.search-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.textContent;
      doSearch(input.value);
    });
  });

  doSearch(query);
}
