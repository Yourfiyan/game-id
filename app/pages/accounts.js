/* ==========================================================================
   Game ID — Accounts Page
   ========================================================================== */

import { getGames, getCurrentAccount, loadAccount } from '../services/loader.js';
import { overview, completionAnalysis, storeDistribution, acquisitionTimeline } from '../services/analytics.js';

function formatPrice(val) {
  if (val == null || val === 0 || val === '0' || val === 'free') return 'Free';
  if (typeof val === 'string') return val;
  return `$${Math.round(val)}`;
}

export async function renderAccounts() {
  const content = document.getElementById('content');
  const accounts = ['A', 'B'];

  // Load both accounts
  for (const id of accounts) {
    await loadAccount(id);
  }

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

  // Synced profile from export
  const savedProfile = localStorage.getItem('gameid-synced-profile');
  let syncedProf = null;
  if (savedProfile) {
    try { syncedProf = JSON.parse(savedProfile); } catch (e) {}
  }

  content.innerHTML = `
    <div class="page accounts-page">
      <div class="page-header">
        <h1 class="page-title">Accounts</h1>
        <p class="page-subtitle">Game Library management and ownership overview</p>
      </div>

      <div class="account-cards">
        ${acctSummary.map(a => renderCard(a)).join('')}
      </div>

      ${syncedProf ? renderSyncedProfile(syncedProf) : ''}

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

function renderSyncedProfile(p) {
  const connected = p.connectedAccounts || [];
  const authIcons = { github: '🐙', google: '🔍', ubisoft: '🎯', steam: '🎮', xbox: '🟢', playstation: '🔵' };

  return `
    <div class="widget" style="margin-top:24px">
      <div class="widget-title" style="display:flex;align-items:center;justify-content:space-between">
        <span>Verified Account Profile <span class="badge badge-brand">${esc(p.displayName || 'Epic Account')}</span></span>
        <span class="badge" style="background:rgba(94,199,94,0.1);color:var(--status-success-fg);border:1px solid var(--status-success-fg);font-size:11px">Export Verified</span>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;margin-top:14px">
        <div style="background:var(--bg-canvas);border:1px solid var(--stroke-subtle);border-radius:var(--r-md);padding:14px">
          <div style="font-size:11px;color:var(--fg-quaternary);text-transform:uppercase;margin-bottom:6px">Account Identity</div>
          <div style="font-size:14px;font-weight:600;color:var(--fg-primary)">${esc(p.displayName)} ${p.fullName ? `(${esc(p.fullName)})` : ''}</div>
          <div style="font-size:12px;color:var(--fg-secondary);margin-top:2px">${esc(p.email || '—')} · ${esc(p.country || '—')}</div>
          <div style="font-size:11px;color:var(--fg-tertiary);margin-top:4px">Account ID: <code style="font-family:var(--font-mono);font-size:10px">${esc(p.id)}</code></div>
        </div>

        <div style="background:var(--bg-canvas);border:1px solid var(--stroke-subtle);border-radius:var(--r-md);padding:14px">
          <div style="font-size:11px;color:var(--fg-quaternary);text-transform:uppercase;margin-bottom:6px">Connected Accounts (${connected.length})</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${connected.map(c => `
              <div style="display:flex;align-items:center;gap:6px;background:var(--bg-chip);padding:4px 8px;border-radius:var(--r-sm);font-size:12px">
                <span>${authIcons[c.authType.toLowerCase()] || '🔗'}</span>
                <span style="font-weight:600;color:var(--fg-primary);text-transform:capitalize">${esc(c.authType)}:</span>
                <span style="color:var(--fg-secondary)">${esc(c.externalDisplayName || c.externalAuthId)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
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
