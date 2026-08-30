/* ==========================================================================
   Game ID — Search Page
   ========================================================================== */

import { getGames } from '../services/loader.js';

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
    if (!(g.raw?.platform ?? []).some(x => String(x).toLowerCase().includes(p))) return false;
  }
  if (filters.genre) {
    if (!(g.genres ?? []).some(x => x.toLowerCase().includes(filters.genre))) return false;
  }
  if (filters.store) {
    const s = (g.store ?? g.platform ?? '').toLowerCase();
    if (!s.includes(filters.store)) return false;
  }
  if (filters.price === 'free') {
    const p = g.pricing?.current;
    if (p != null && p !== 0 && p !== '0' && p !== 'free') return false;
  }
  if (filters.price === 'paid') {
    const p = g.pricing?.current;
    if (p == null || p === 0 || String(p) === 'free') return false;
  }
  if (filters.played === false) {
    if (g.raw?.playtimePlayed && g.raw.playtimePlayed > 0) return false;
  }
  if (filters.played === true) {
    if (!g.raw?.playtimePlayed || g.raw.playtimePlayed === 0) return false;
  }
  if (filters.confidence) {
    if ((g.raw?.provenance?.confidence ?? '') !== filters.confidence) return false;
  }
  if (filters.minRating != null) {
    const r = g.ratings?.igdb;
    if (r == null || r < filters.minRating) return false;
  }
  return true;
}

export async function renderSearch(presetQuery) {
  const content = document.getElementById('content');
  const query = presetQuery || '';

  content.innerHTML = `
    <div class="page search-page">
      <div class="search-hero">
        <h1>Search</h1>
        <p>Search ${getGames().length} entitlements by title, genre, platform, store, confidence, or playtime.</p>
        <div class="search-suggestions">
          ${SUGGESTIONS.map(s => `<button class="search-chip">${esc(s)}</button>`).join('')}
        </div>
      </div>
      <div id="search-results"></div>
    </div>
  `;

  const box = content.querySelector('.search-hero'); // locate input area

  // Build a search input
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
    const { q, filters } = parseQuery(raw);
    let games = getGames();
    if (q || Object.keys(filters).length) {
      games = games.filter(g => matches(g, q, filters));
    }
    const total = games.length;
    if (!raw && !total) {
      resultsEl.innerHTML = `
        <div class="search-results-head"><span></span></div>
        <div class="no-results"><p>Start typing to search</p><p>All ${getGames().length} titles will appear as you type</p></div>
      `;
      return;
    }
    const top = games.slice(0, 50);
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
                  <td class="td-platform">${esc(g.store ?? g.platform ?? '—')}</td>
                  <td>${g.raw?.platform ? (Array.isArray(g.raw.platform) ? g.raw.platform.join(', ') : g.raw.platform) : '—'}</td>
                  <td>${badge(g.raw?.provenance?.confidence)}</td>
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
        import('./game-detail.js').then(m => m.renderGameDetail(el.dataset.id));
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

  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => doSearch(input.value), 120);
  });
  input.addEventListener('keydown', e => { if (e.key === 'Escape') { input.value = ''; doSearch(''); } });

  if (query) doSearch(query);
  else doSearch('');

  // chips
  document.querySelectorAll('.search-chip').forEach(btn => {
    btn.addEventListener('click', () => { input.value = btn.textContent; doSearch(btn.textContent); });
  });
}

function badge(conf) {
  const map = { high: 'badge-success', medium: 'badge-caution', low: 'badge-danger' };
  const cls = map[conf] || 'badge-neutral';
  return conf ? `<span class="badge ${cls}">${conf}</span>` : '<span style="color:var(--fg-quaternary)">—</span>';
}
