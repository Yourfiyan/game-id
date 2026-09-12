/* ==========================================================================
   Game ID — Accounts Page
   ========================================================================== */

import { getGames, getCurrentAccount, getProfile, hasAccount } from '../services/loader.js';
import { overview, completionAnalysis } from '../services/analytics.js';
import { openSyncModal } from '../components/sync-modal.js';

function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

export async function renderAccounts() {
  const content = document.getElementById('content');
  const games = getGames();
  const prof = getProfile();
  const isConnected = hasAccount();

  if (!isConnected) {
    content.innerHTML = `
      <div class="page accounts-page">
        <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 class="page-title">Account &amp; Ownership</h1>
            <p class="page-subtitle">Verified ownership profile and external connected accounts</p>
          </div>
          <button class="btn-primary" id="accounts-sync-btn" style="display: inline-flex; align-items: center; gap: 6px;">
            <svg style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            Sync / Import Data
          </button>
        </div>

        <div style="background: var(--bg-layer); border: 1px solid var(--stroke-subtle); border-radius: var(--r-lg); padding: 48px 32px; text-align: center; margin-top: 24px;">
          <div style="font-size: 40px; margin-bottom: 16px;">👤</div>
          <h2 style="font-size: 20px; font-weight: 600; color: var(--fg-primary); margin-bottom: 8px;">No Account Connected</h2>
          <p style="font-size: 14px; color: var(--fg-secondary); max-width: 520px; margin: 0 auto 24px; line-height: 1.5;">
            You are currently viewing Game ID in guest mode. Import your official Epic Games GDPR data export package (<span style="font-family:var(--font-mono);font-size:12px;">.zip</span> or <span style="font-family:var(--font-mono);font-size:12px;">.pdf</span>) to view your verified ownership profile, linked third-party authentications, and entitlement records.
          </p>
          <button class="btn-primary" id="empty-accounts-sync-btn" style="font-size: 13px; padding: 8px 18px;">
            Import Account Data
          </button>
        </div>

        ${renderFooter()}
      </div>
    `;

    document.getElementById('accounts-sync-btn')?.addEventListener('click', () => openSyncModal());
    document.getElementById('empty-accounts-sync-btn')?.addEventListener('click', () => openSyncModal());
    return;
  }

  const ov = overview(games);
  const comp = completionAnalysis(games);

  const priceSym = games[0]?.currency === 'USD' ? '$' : (games[0]?.currency === 'INR' ? '₹' : '$');
  const val = ov.estimatedLibraryValue;
  const playable = ov.byClassification.game ?? 0;
  const other = ov.totalEntitlements - playable;
  const playtime = ov.totalPlaytime;
  const ptStr = playtime != null && playtime > 0 ? `${Math.round(playtime)}h` : '0h';

  const initials = ((prof?.displayName || 'User').slice(0, 2)).toUpperCase();

  content.innerHTML = `
    <div class="page accounts-page">
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
        <div>
          <h1 class="page-title">Account &amp; Ownership</h1>
          <p class="page-subtitle">Verified ownership profile and external connected accounts</p>
        </div>
        <button class="btn-primary" id="accounts-sync-btn" style="display: inline-flex; align-items: center; gap: 6px;">
          <svg style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          Sync / Import Data
        </button>
      </div>

      <!-- Active Account Overview Card -->
      <div class="account-card" style="margin-bottom: 24px;">
        <div class="account-card-head">
          <div class="account-avatar a" style="font-weight: 700; color: var(--brand-hover);">${esc(initials)}</div>
          <div>
            <h2>${esc(prof?.displayName || 'Primary Account')} ${prof?.fullName ? `<span style="font-weight:400;font-size:13px;color:var(--fg-secondary)">(${esc(prof.fullName)})</span>` : ''}</h2>
            <div class="acct-meta">${games.length} entitlements · Epic Games Store · Status: ${esc(prof?.status || 'ACTIVE')}</div>
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

      <!-- Verified Profile & Connected Accounts -->
      ${prof ? renderVerifiedProfile(prof) : ''}

      ${renderFooter()}
    </div>
  `;

  document.getElementById('accounts-sync-btn')?.addEventListener('click', () => {
    openSyncModal();
  });
}

function renderVerifiedProfile(p) {
  const connected = p.connectedAccounts || [];
  const comms = p.communicationMethods || [];
  const agreements = p.agreements || [];
  const authIcons = { github: '🐙', google: '🔍', ubisoft: '🎯', steam: '🎮', xbox: '🟢', playstation: '🔵' };

  return `
    <div class="widget" style="margin-top: 24px;">
      <div class="widget-title" style="display: flex; align-items: center; justify-content: space-between;">
        <span>Verified Epic Account Metadata</span>
        <span class="badge" style="background: rgba(94,199,94,0.1); color: var(--status-success-fg); border: 1px solid var(--status-success-fg); font-size: 11px;">GDPR Verified</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 14px;">
        <!-- Identity Box -->
        <div style="background: var(--bg-canvas); border: 1px solid var(--stroke-subtle); border-radius: var(--r-md); padding: 14px;">
          <div style="font-size: 11px; color: var(--fg-quaternary); text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em;">Account Identity</div>
          <div style="font-size: 14px; font-weight: 600; color: var(--fg-primary);">${esc(p.displayName)} ${p.fullName ? `(${esc(p.fullName)})` : ''}</div>
          <div style="font-size: 12px; color: var(--fg-secondary); margin-top: 2px;">Email: ${esc(p.email || '—')}</div>
          <div style="font-size: 12px; color: var(--fg-secondary); margin-top: 2px;">Country: ${esc(p.country || '—')} · Lang: ${esc(p.language || 'English')}</div>
          <div style="font-size: 11px; color: var(--fg-tertiary); margin-top: 6px;">ID: <code style="font-family: var(--font-mono); font-size: 10px; color: var(--fg-secondary);">${esc(p.id)}</code></div>
        </div>

        <!-- Connected Accounts Box -->
        <div style="background: var(--bg-canvas); border: 1px solid var(--stroke-subtle); border-radius: var(--r-md); padding: 14px;">
          <div style="font-size: 11px; color: var(--fg-quaternary); text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em;">Connected Accounts (${connected.length})</div>
          ${connected.length ? `
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${connected.map(c => `
                <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-chip); padding: 6px 10px; border-radius: var(--r-sm); font-size: 12px;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span>${authIcons[c.authType.toLowerCase()] || '🔗'}</span>
                    <span style="font-weight: 600; color: var(--fg-primary); text-transform: capitalize;">${esc(c.authType)}:</span>
                    <span style="color: var(--fg-secondary);">${esc(c.externalDisplayName || c.externalAuthId)}</span>
                  </div>
                  ${c.addedDate ? `<span style="font-size: 10px; color: var(--fg-quaternary);">${esc(c.addedDate)}</span>` : ''}
                </div>
              `).join('')}
            </div>
          ` : '<p style="font-size: 12px; color: var(--fg-quaternary);">No external accounts linked.</p>'}
        </div>
      </div>

      <!-- Additional Details: Comms & Agreements -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 16px;">
        <div style="background: var(--bg-canvas); border: 1px solid var(--stroke-subtle); border-radius: var(--r-md); padding: 14px;">
          <div style="font-size: 11px; color: var(--fg-quaternary); text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em;">Communications &amp; Security</div>
          <div class="data-list" style="margin: 0;">
            ${comms.length ? comms.map(c => `
              <li><span>${esc(c.method)}</span><span style="font-size:12px">${esc(c.identifier)}</span></li>
            `).join('') : `
              <li><span>Email</span><span>${esc(p.email || '—')}</span></li>
              <li><span>Account Status</span><span><span class="badge badge-success">${esc(p.status || 'ACTIVE')}</span></span></li>
            `}
            ${p.createdAt ? `<li><span>Created</span><span>${esc(p.createdAt)}</span></li>` : ''}
            ${p.lastLogin ? `<li><span>Last login</span><span>${esc(p.lastLogin)}</span></li>` : ''}
          </div>
        </div>

        <div style="background: var(--bg-canvas); border: 1px solid var(--stroke-subtle); border-radius: var(--r-md); padding: 14px;">
          <div style="font-size: 11px; color: var(--fg-quaternary); text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em;">Agreements &amp; Social</div>
          <div class="data-list" style="margin: 0;">
            <li><span>Friends count</span><span>${p.social?.friendsCount ?? 0}</span></li>
            <li><span>Pending friend requests</span><span>${p.social?.incomingFriendRequests ?? 0}</span></li>
            ${agreements.slice(0, 3).map(a => `
              <li><span style="font-size:11px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(a.agreementTitle)}">${esc(a.agreementTitle)}</span><span class="badge badge-neutral" style="font-size:10px">${esc(a.status || 'Accepted')}</span></li>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderFooter() {
  return `
    <div class="app-footer" style="margin-top: 32px;">
      <div class="version">Game ID · Game Library Intelligence Dashboard</div>
    </div>
  `;
}
