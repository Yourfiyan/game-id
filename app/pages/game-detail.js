/* ==========================================================================
   Game ID — Game Detail Page
   ========================================================================== */

import { getGames } from '../services/loader.js';

let gameCache = null;

export async function renderGameDetail(id) {
  const content = document.getElementById('content');
  if (!gameCache) gameCache = getGames();
  const g = gameCache.find(x => x.id === id);
  if (!g) { content.innerHTML = '<div class="page"><p>Game not found.</p></div>'; return; }

  const currency = g.currency ?? 'USD';
  const sym = currency === 'INR' ? '₹' : '$';
  const pt = g.raw?.playtimePlayed ?? 0;
  const ptStr = pt > 0 ? `${Math.round(pt / 60)}h ${Math.round(pt % 60)}m` : 'Never played';
  const platforms = g.raw?.platform ? (Array.isArray(g.raw.platform) ? g.raw.platform.join(', ') : String(g.raw.platform)) : '—';

  content.innerHTML = `
    <div class="page game-detail-page">
      <div class="game-detail-hero">
        <div class="game-detail-cover" style="background: linear-gradient(135deg, var(--bg-subtle), var(--bg-layer-selected))">
          <div class="cover-fallback">${g.title ? g.title[0].toUpperCase() : '?'}</div>
        </div>
        <div class="game-detail-info">
          <div class="detail-header">
            <h1 class="detail-title">${esc(g.title)}</h1>
            ${g.raw?.provenance?.confidence ? badge(g.raw.provenance.confidence) : ''}
          </div>
          <div class="detail-developer">${esc(g.developer ?? '—')}</div>
          <div class="detail-publisher">${esc(g.publisher ?? '—')}</div>
          <div class="detail-meta-row">
            ${g.raw?.releaseDate ? `<span class="detail-meta-chip">📅 ${formatDate(g.raw.releaseDate)}</span>` : ''}
            ${platforms !== '—' ? `<span class="detail-meta-chip">💻 ${esc(platforms)}</span>` : ''}
            ${g.raw?.store ? `<span class="detail-meta-chip">🛒 ${esc(g.raw.store)}</span>` : ''}
            ${g.genres?.length ? `<span class="detail-meta-chip">🏷 ${esc(g.genres.slice(0,3).join(', '))}</span>` : ''}
          </div>
          <div class="detail-stats">
            <div class="detail-stat">
              <div class="detail-stat-val">${ptStr === 'Never played' ? '—' : Math.round(pt / 60) + 'h'}</div>
              <div class="detail-stat-label">Playtime</div>
            </div>
            <div class="detail-stat">
              <div class="detail-stat-val">${g.pricing?.current != null ? formatPrice(g.pricing.current) : '—'}</div>
              <div class="detail-stat-label">Price</div>
            </div>
            <div class="detail-stat">
              <div class="detail-stat-val">${g.ratings?.igdb != null ? g.ratings.igdb.toFixed(1) : '—'}</div>
              <div class="detail-stat-label">IGDB Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-grid">
        <div class="widget">
          <div class="widget-title">Classification</div>
          <div class="data-list">
            <li><span>Type</span><span>${esc(g.classification ?? '—')}</span></li>
            <li><span>Genres</span><span>${(g.genres ?? []).length ? esc(g.genres.join(', ')) : '—'}</span></li>
            <li><span>Features</span><span>${(g.features ?? []).length ? esc(g.features.join(', ')) : '—'}</span></li>
          </div>
        </div>

        <div class="widget">
          <div class="widget-title">Provenance</div>
          <div class="data-list">
            <li><span>Confidence</span><span>${g.raw?.provenance?.confidence ? badge(g.raw.provenance.confidence) : '—'}</span></li>
            <li><span>Source</span><span>${esc(g.raw?.provenance?.source ?? '—')}</span></li>
            <li><span>Updated</span><span>${g.raw?.provenance?.updatedAt ? formatDate(g.raw.provenance.updatedAt) : '—'}</span></li>
          </div>
        </div>

        <div class="widget">
          <div class="widget-title">Acquisition</div>
          <div class="data-list">
            <li><span>Purchased</span><span>${g.raw?.dateAdded ? formatDate(g.raw.dateAdded) : '—'}</span></li>
            <li><span>Transaction</span><span style="font-size:11px;word-break:break-all">${esc(g.transactionId ?? '—')}</span></li>
            <li><span>Record ID</span><span style="font-size:11px;color:var(--fg-quaternary)">${esc(g.id)}</span></li>
          </div>
        </div>

        <div class="widget">
          <div class="widget-title">Links</div>
          <div class="data-list">
            ${g.raw?.url ? `<li><a href="${esc(g.raw.url)}" target="_blank" rel="noopener" style="color:var(--brand-hover)">Store page ↗</a></li>` : ''}
            ${g.raw?.reviewsUrl ? `<li><a href="${esc(g.raw.reviewsUrl)}" target="_blank" rel="noopener" style="color:var(--brand-hover)">Reviews ↗</a></li>` : ''}
          </div>
        </div>
      </div>

      <button class="back-btn" id="back-btn">← Back</button>
    </div>
  `;

  document.getElementById('back-btn')?.addEventListener('click', () => {
    history.back();
  });
}

function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function badge(conf) {
  const map = { high: 'badge-success', medium: 'badge-caution', low: 'badge-danger' };
  return conf ? `<span class="badge ${map[conf] || 'badge-neutral'}">${conf}</span>` : '';
}

function formatPrice(v) {
  if (v == null || v === 0 || String(v).toLowerCase() === 'free') return 'Free';
  if (typeof v === 'number') return `$${v.toFixed(2)}`;
  return String(v);
}

function formatDate(s) {
  if (!s) return '—';
  try {
    const d = new Date(s);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return String(s); }
}
