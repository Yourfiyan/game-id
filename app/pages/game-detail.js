/* ==========================================================================
   Game ID — Game Detail Page
   ========================================================================== */

import { getGames, getGame } from '../services/loader.js';

export async function renderGameDetail(id) {
  const content = document.getElementById('content');
  const g = getGame(id) || getGames().find(x => x.id === id);
  if (!g) { content.innerHTML = '<div class="page"><p>Game not found.</p></div>'; return; }

  const currency = g.currency ?? 'INR';
  const sym = currency === 'USD' ? '$' : '₹';
  const pt = g.playtime ?? 0;
  const ptStr = pt > 0 ? `${Math.floor(pt / 3600)}h ${Math.round((pt % 3600) / 60)}m` : 'Never played';
  const platforms = (g.platforms && g.platforms.length) ? g.platforms.join(', ') : 'Windows';
  const priceDisplay = g.isFree ? 'Free' : (g.currentPrice != null ? `${sym}${Math.round(g.currentPrice).toLocaleString()}` : (g.msrp != null ? `${sym}${Math.round(g.msrp).toLocaleString()}` : 'Free'));

  content.innerHTML = `
    <div class="page game-detail-page">
      <div class="game-detail-hero">
        <div class="game-detail-cover" style="background: linear-gradient(135deg, var(--bg-subtle), var(--bg-layer-selected))">
          ${g.cover && !g.cover.includes('placeholder') ? `<img src="${esc(g.cover)}" alt="${esc(g.title)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" onerror="this.style.display='none'">` : ''}
          <div class="cover-fallback">${g.title ? g.title[0].toUpperCase() : '?'}</div>
        </div>
        <div class="game-detail-info">
          <div class="detail-header">
            <h1 class="detail-title">${esc(g.title)}</h1>
            ${g.confidence ? badge(g.confidence) : ''}
          </div>
          <div class="detail-developer">${esc(g.developer ?? g.publisher ?? '—')}</div>
          <div class="detail-publisher">${esc(g.publisher ?? 'Epic Games Store')}</div>
          <div class="detail-meta-row">
            ${g.releaseDate ? `<span class="detail-meta-chip">📅 ${formatDate(g.releaseDate)}</span>` : ''}
            <span class="detail-meta-chip">💻 ${esc(platforms)}</span>
            <span class="detail-meta-chip">🛒 ${esc(g.marketplace || 'Epic Games Store')}</span>
            ${g.genres?.length ? `<span class="detail-meta-chip">🏷 ${esc(g.genres.slice(0,3).join(', '))}</span>` : ''}
          </div>
          <div class="detail-stats">
            <div class="detail-stat">
              <div class="detail-stat-val">${ptStr === 'Never played' ? '0h' : ptStr}</div>
              <div class="detail-stat-label">Playtime</div>
            </div>
            <div class="detail-stat">
              <div class="detail-stat-val">${priceDisplay}</div>
              <div class="detail-stat-label">Store Value</div>
            </div>
            <div class="detail-stat">
              <div class="detail-stat-val">${g.steamScore != null ? `${g.steamScore}%` : (g.igdbCritic != null ? g.igdbCritic.toFixed(0) : (g.metacritic != null ? g.metacritic : '—'))}</div>
              <div class="detail-stat-label">Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-grid">
        <div class="widget">
          <div class="widget-title">Classification &amp; Metadata</div>
          <div class="data-list">
            <li><span>Classification</span><span><span class="badge badge-neutral" style="text-transform: uppercase;">${esc(g.classification ?? 'game')}</span></span></li>
            <li><span>Genres</span><span>${(g.genres ?? []).length ? esc(g.genres.join(', ')) : '—'}</span></li>
            <li><span>Platform</span><span>${esc(platforms)}</span></li>
            ${g.summary ? `<li><span>Summary</span><span style="max-width:300px;font-size:12px">${esc(g.summary)}</span></li>` : ''}
          </div>
        </div>

        <div class="widget">
          <div class="widget-title">Provenance</div>
          <div class="data-list">
            <li><span>Confidence</span><span>${badge(g.confidence)}</span></li>
            <li><span>Sources</span><span>${esc((g.sources || []).join(', ') || 'Epic Games Export')}</span></li>
            <li><span>Steam Match</span><span>${g.steamAppId ? `App ID ${g.steamAppId}` : 'Not enriched'}</span></li>
          </div>
        </div>

        <div class="widget">
          <div class="widget-title">Acquisition</div>
          <div class="data-list">
            <li><span>Acquired Date</span><span>${g.purchaseDate ? formatDate(g.purchaseDate) : '—'}</span></li>
            <li><span>Marketplace</span><span>${esc(g.marketplace || 'Epic Games Store')}</span></li>
            ${g.orderId ? `<li><span>Order ID</span><span style="font-size:11px;font-family:var(--font-mono)">${esc(g.orderId)}</span></li>` : ''}
            <li><span>Record ID</span><span style="font-size:11px;color:var(--fg-quaternary);font-family:var(--font-mono)">${esc(g.id)}</span></li>
          </div>
        </div>

        <div class="widget">
          <div class="widget-title">Ownership &amp; Status</div>
          <div class="data-list">
            <li><span>Status</span><span>Owned</span></li>
            <li><span>Playtime Recorded</span><span>${ptStr}</span></li>
            <li><span>Purchase Cost</span><span>${g.amountPaid != null ? `${sym}${g.amountPaid}` : 'Free / Included'}</span></li>
          </div>
        </div>
      </div>

      <button class="back-btn" id="back-btn" style="margin-top:20px;cursor:pointer;background:var(--bg-layer);border:1px solid var(--stroke-subtle);color:var(--fg-primary);padding:8px 16px;border-radius:var(--r-sm);">← Back</button>
    </div>
  `;

  document.getElementById('back-btn')?.addEventListener('click', () => {
    history.back();
  });
}

function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function badge(conf) {
  const c = String(conf || '').toLowerCase();
  const map = { high: 'badge-success', medium: 'badge-caution', low: 'badge-danger' };
  return conf ? `<span class="badge ${map[c] || 'badge-neutral'}">${conf}</span>` : '';
}

function formatDate(s) {
  if (!s) return '—';
  try {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return String(s);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return String(s); }
}
