/* ==========================================================================
   Game ID — Accounts Page
   ========================================================================== */

import { getGames, getCurrentAccount } from '../services/loader.js';
import { overview, completionAnalysis, storeDistribution, acquisitionTimeline } from '../services/analytics.js';

function formatPrice(val) {
  if (val == null || val === 0 || val === '0' || val === 'free') return 'Free';
  if (typeof val === 'string') return val;
  return `$${Math.round(val)}`;
}

export async function renderAccounts() {
  const content = document.getElementById('content');
  const accounts = ['A', 'B'];

  const acctSummary = accounts.map(id => {
    const games = getGames(id);
    const ov = overview(games);
    const comp = completionAnalysis(games);
    const priceSym = games[0]?.currency === 'USD' ? '$' : '₹';
    const val = ov.estimatedLibraryValue;
    return { id, games, ov, comp, priceSym, val };
  });

  // Shared titles
  const titlesA = new Set(acctSummary[0].games.map(g => g.title));
  const shared = acctSummary[1].games.filter(g => titlesA.has(g.title));

  const gamesB = getGames('B');

  content.innerHTML = `
    <div class="page accounts-page">
      <div class="page-header">
        <h1 class="page-title">Accounts</h1>
        <p class="page-subtitle">Game Library management and ownership overview</p>
      </div>

      <div class="account-cards">
        ${acctSummary.map(a => renderCard(a)).join('')}
      </div>

      ${renderShared(shared)}
      ${renderFooter()}
    </div>
  `;

  // wire up shared title clicks
  content.querySelectorAll('[data-id]').forEach(el => {
    el.addEventListener('click', () => {
      import('./game-detail.js').then(m => m.renderGameDetail(el.dataset.id));
    });
  });
}

function renderCard({ id, games, ov, comp, priceSym, val }) {
  const playable = ov.byClassification.game ?? 0;
  const other = ov.totalEntitlements - playable;
  const playtime = ov.totalPlaytime;
  const ptStr = playtime != null ? `${Math.round(playtime)}h` : '—';

  return `
    <div class="account-card">
      <div class="account-card-head">
        <div class="account-avatar ${id === 'A' ? 'a' : 'b'}">👤</div>
        <div>
          <h2>Account ${id}</h2>
          <div class="acct-meta">${games.length} entitlements · Account ${id}</div>
        </div>
      </div>

      <div class="overview-stats">
        <div class="stat-box">
          <div class="stat-value">${ov.totalEntitlements}</div>
          <div class="stat-label">Entitlements</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${playable}</div>
          <div class="stat-label">Games</div>
          ${other ? `<div class="stat-label" style="margin-top:2px;opacity:0.6">+${other} other</div>` : ''}
        </div>
        <div class="stat-box">
          <div class="stat-value">${val != null ? `${priceSym}${Math.round(val).toLocaleString()}` : '—'}</div>
          <div class="stat-label">Store value</div>
        </div>
      </div>

      <ul class="breakdown-list">
        <li><span>Free games</span><span>${ov.freeGames}</span></li>
        <li><span>Paid (listed)</span><span>${ov.paidGames}</span></li>
        <li><span>Played</span><span>${comp.playedCount}</span></li>
        <li><span>Never played</span><span>${comp.neverPlayedCount}</span></li>
        <li><span>Total playtime</span><span>${ptStr}</span></li>
        <li><span>Confidence: High / Med / Low</span><span>${ov.confidence.high} / ${ov.confidence.medium} / ${ov.confidence.low}</span></li>
        <li><span>Priced titles</span><span>${ov.msrp.coverage.known}</span></li>
        ${ov.topGenre ? `<li><span>Top genre</span><span>${ov.topGenre.label}</span></li>` : ''}
      </ul>
    </div>
  `;
}

function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function renderShared(shared) {
  return `
    <div class="widget" style="margin-top:20px">
      <div class="widget-title">Cross-account overlap <span class="badge badge-brand">${shared.length} titles</span></div>
      ${shared.length ? `
        <div class="shared-table">
          <table>
            <thead><tr><th>Title</th><th>Platform</th><th>Price</th></tr></thead>
            <tbody>
              ${shared.slice(0, 20).map(g => `
                <tr class="clickable" data-id="${esc(g.id)}">
                  <td>${esc(g.title)}</td>
                  <td>${esc(g.platform ?? g.store ?? '—')}</td>
                  <td>${g.pricing?.current != null ? formatPrice(g.pricing.current) : '<span style="color:var(--fg-quaternary)">—</span>'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ${shared.length > 20 ? `<div class="text-muted" style="font-size:12px;margin-top:8px">Showing 20 of ${shared.length}</div>` : ''}
      ` : `<p class="text-muted" style="font-size:13px">No titles owned on both accounts.</p>`}
    </div>
  `;
}

function renderFooter() {
  return `
    <div class="app-footer">
      <div class="version">Game ID · Game Library Intelligence Dashboard</div>
    </div>
  `;
}
