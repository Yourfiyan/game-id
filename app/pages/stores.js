/* ==========================================================================
   Game ID — Stores Page
   Dynamic storefront distribution, store valuation, and linked account sync
   ========================================================================== */

import { getGames, getProfile } from '../services/loader.js';
import { storeDistribution } from '../services/analytics.js';
import { openSyncModal } from '../components/sync-modal.js';

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const STORE_DEFINITIONS = [
  {
    id: 'epic',
    label: 'Epic Games Store',
    icon: '🛒',
    matchKeys: ['epic', 'epic games', 'epic games store', 'epicgames'],
    authKeys: ['epic'],
    description: 'Primary imported account & GDPR data export',
  },
  {
    id: 'steam',
    label: 'Steam',
    icon: '🎮',
    matchKeys: ['steam', 'valve'],
    authKeys: ['steam'],
    description: 'Valve digital distribution platform',
  },
  {
    id: 'gog',
    label: 'GOG',
    icon: '💎',
    matchKeys: ['gog', 'gog.com', 'cd projekt'],
    authKeys: ['gog'],
    description: 'DRM-free PC game store by CD Projekt',
  },
  {
    id: 'microsoft',
    label: 'Xbox / MS Store',
    icon: '🪟',
    matchKeys: ['microsoft', 'xbox', 'ms store', 'windows store'],
    authKeys: ['xbox', 'microsoft', 'live'],
    description: 'Xbox Live & Microsoft Windows store',
  },
  {
    id: 'playstation',
    label: 'PlayStation Network',
    icon: '🎮',
    matchKeys: ['playstation', 'psn', 'sony'],
    authKeys: ['psn', 'playstation', 'sony'],
    description: 'Sony PlayStation Network connected account',
  },
  {
    id: 'ubisoft',
    label: 'Ubisoft Connect',
    icon: '🎯',
    matchKeys: ['ubisoft', 'uplay'],
    authKeys: ['ubisoft', 'uplay'],
    description: 'Ubisoft ecosystem & launcher',
  },
  {
    id: 'ea',
    label: 'EA App / Origin',
    icon: '⚽',
    matchKeys: ['ea', 'origin', 'ea app', 'electronic arts'],
    authKeys: ['ea', 'origin'],
    description: 'Electronic Arts desktop platform',
  },
  {
    id: 'nintendo',
    label: 'Nintendo',
    icon: '🍄',
    matchKeys: ['nintendo', 'switch'],
    authKeys: ['nintendo', 'switch'],
    description: 'Nintendo Network / Nintendo Switch Online',
  },
  {
    id: 'humble',
    label: 'Humble Bundle',
    icon: '🤝',
    matchKeys: ['humble', 'humble bundle'],
    authKeys: ['humble'],
    description: 'Humble Bundle store & charity keys',
  },
  {
    id: 'itch',
    label: 'itch.io',
    icon: '🍠',
    matchKeys: ['itch', 'itch.io'],
    authKeys: ['itch', 'itchio'],
    description: 'Open marketplace for independent digital creators',
  },
  {
    id: 'nv',
    label: 'NVIDIA GeForce NOW',
    icon: '🟢',
    matchKeys: ['nvidia', 'geforce now', 'nv'],
    authKeys: ['nvidia'],
    description: 'Cloud gaming service integration',
  },
  {
    id: 'parsec',
    label: 'Parsec',
    icon: '🌐',
    matchKeys: ['parsec'],
    authKeys: ['parsec'],
    description: 'Low-latency remote gaming & co-op streaming',
  },
];

export async function renderStores() {
  const games = getGames();
  const profile = getProfile();
  const content = document.getElementById('content');

  if (!games || games.length === 0) {
    content.innerHTML = `
      <div class="page stores-page">
        <div class="page-header">
          <h1 class="page-title">Stores</h1>
          <p class="page-subtitle">Storefront distribution &amp; marketplace coverage</p>
        </div>
        <div style="background: var(--bg-layer); border: 1px solid var(--stroke-subtle); border-radius: var(--r-lg); padding: 48px 32px; text-align: center; max-width: 640px; margin: 32px auto;">
          <div style="font-size: 40px; margin-bottom: 16px;">🏪</div>
          <h2 style="font-size: 20px; font-weight: 600; color: var(--fg-primary); margin-bottom: 8px;">No Store Data Available</h2>
          <p style="font-size: 14px; color: var(--fg-secondary); line-height: 1.5; margin-bottom: 24px;">
            Sync your game account data to inspect ownership across Epic Games Store, Steam, GOG, and other connected gaming marketplaces.
          </p>
          <button class="btn-primary" id="stores-empty-sync" style="font-size: 13px; padding: 8px 20px;">
            Sync / Import Data
          </button>
        </div>
      </div>
    `;

    document.getElementById('stores-empty-sync')?.addEventListener('click', () => openSyncModal());
    return;
  }

  const total = games.length;
  const connectedExternalAccounts = profile?.connectedAccounts || [];

  // Match games and connected auths to each store definition
  const storeStats = STORE_DEFINITIONS.map(storeDef => {
    // Find games matching this store
    const storeGames = games.filter(g => {
      const storeName = (g.marketplace || g.store || '').toLowerCase();
      const sources = (g.sources || []).join(' ').toLowerCase();
      return storeDef.matchKeys.some(k => storeName.includes(k) || sources.includes(k));
    });

    // If no direct marketplace match, check if this is Epic Games Store (default for all Epic exports)
    let matchedGames = storeGames;
    if (storeDef.id === 'epic' && matchedGames.length === 0) {
      matchedGames = games; // All imported games originate from the Epic export
    }

    // Check if user has an external auth connected for this store (e.g. Steam ID, Xbox gamertag, PSN, Ubisoft)
    const linkedAuth = connectedExternalAccounts.find(ext => {
      const authType = (ext.authType || '').toLowerCase().trim();
      return storeDef.authKeys.some(k => authType === k || authType.startsWith(k) || (k === 'xbox' && authType.includes('xbox')) || (k === 'psn' && (authType.includes('playstation') || authType.includes('psn'))));
    });

    // Calculate store valuation & metrics
    const count = matchedGames.length;
    const pct = total ? ((count / total) * 100).toFixed(1) : 0;
    const storeValue = matchedGames.reduce((acc, g) => acc + (g.currentPrice ?? g.msrp ?? 0), 0);
    const currency = matchedGames[0]?.currency || 'USD';
    const sym = currency === 'USD' ? '$' : (currency === 'INR' ? '₹' : '$');

    // Top rated game in this store
    const ratedGames = matchedGames.filter(g => (g.steamScore != null || g.metacritic != null));
    const topGame = ratedGames.sort((a, b) => (b.steamScore ?? b.metacritic ?? 0) - (a.steamScore ?? a.metacritic ?? 0))[0] || matchedGames[0] || null;

    return {
      ...storeDef,
      count,
      pct,
      storeValue,
      sym,
      topGame,
      linkedAuth,
      hasContent: count > 0 || !!linkedAuth,
    };
  });

  // Sort: active stores first, then others
  const sortedStores = [...storeStats].sort((a, b) => {
    if (a.count !== b.count) return b.count - a.count;
    if (a.linkedAuth && !b.linkedAuth) return -1;
    if (!a.linkedAuth && b.linkedAuth) return 1;
    return a.label.localeCompare(b.label);
  });

  const activeStoreCount = sortedStores.filter(s => s.hasContent).length;
  const totalValuation = games.reduce((acc, g) => acc + (g.currentPrice ?? g.msrp ?? 0), 0);
  const curSym = games[0]?.currency === 'USD' ? '$' : (games[0]?.currency === 'INR' ? '₹' : '$');

  content.innerHTML = `
    <div class="page stores-page">
      <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;">
        <div>
          <h1 class="page-title">Stores</h1>
          <p class="page-subtitle">${total} entitlements across ${activeStoreCount} connected &amp; linked gaming storefronts</p>
        </div>
        <div style="background:var(--bg-layer);border:1px solid var(--stroke-subtle);border-radius:var(--r-md);padding:10px 18px;display:flex;gap:20px;">
          <div>
            <div style="font-size:11px;color:var(--fg-tertiary);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px;">Total Store Value</div>
            <div style="font-size:18px;font-weight:700;color:var(--status-success-fg);">${curSym}${Math.round(totalValuation).toLocaleString()}</div>
          </div>
          <div style="width:1px;background:var(--stroke-divider);"></div>
          <div>
            <div style="font-size:11px;color:var(--fg-tertiary);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px;">Connected Stores</div>
            <div style="font-size:18px;font-weight:700;color:var(--fg-primary);">${activeStoreCount}</div>
          </div>
        </div>
      </div>

      <div class="store-grid">
        ${sortedStores.map(s => {
          const isLinked = !!s.linkedAuth;
          const authName = s.linkedAuth ? (s.linkedAuth.externalDisplayName || s.linkedAuth.externalAuthId || 'Connected') : null;

          return `
            <div class="store-card ${s.count > 0 ? 'store-has-games' : ''}" style="transition:transform 0.15s ease, border-color 0.15s ease; cursor:pointer;" data-store-name="${esc(s.label)}">
              <div class="store-card-head" style="align-items:flex-start;">
                <div style="display:flex;align-items:center;gap:12px;">
                  <div class="store-icon" style="font-size:24px;">${s.icon}</div>
                  <div>
                    <div class="store-name" style="font-weight:600;font-size:15px;color:var(--fg-primary);">${esc(s.label)}</div>
                    ${isLinked ? `
                      <div style="font-size:11px;color:var(--status-success-fg);display:inline-flex;align-items:center;gap:4px;margin-top:2px;">
                        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--status-success-fg);"></span>
                        Linked: ${esc(authName)}
                      </div>
                    ` : `
                      <div style="font-size:11px;color:var(--fg-quaternary);margin-top:2px;">${esc(s.description)}</div>
                    `}
                  </div>
                </div>
                <div class="store-count-badge" style="font-size:13px;font-weight:700;padding:3px 10px;border-radius:12px;background:var(--bg-subtle);border:1px solid var(--stroke-divider);">
                  ${s.count}
                </div>
              </div>

              <div class="store-card-body" style="margin-top:14px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:12px;">
                  <span style="color:var(--fg-secondary);">Library share</span>
                  <span style="font-weight:600;color:var(--brand-hover);">${s.pct}%</span>
                </div>
                <div class="store-bar-track" style="height:6px;background:var(--bg-subtle);border-radius:3px;overflow:hidden;margin-bottom:12px;">
                  <div class="store-bar-fill" style="height:100%;background:var(--brand-rest);width:${s.pct}%;border-radius:3px;"></div>
                </div>

                ${s.count > 0 ? `
                  <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid var(--stroke-subtle);font-size:12px;">
                    <span style="color:var(--fg-tertiary);">Store Worth</span>
                    <span style="font-weight:600;color:var(--status-success-fg);">${s.sym}${Math.round(s.storeValue).toLocaleString()}</span>
                  </div>
                  ${s.topGame ? `
                    <div class="store-top-game" style="font-size:11px;color:var(--fg-secondary);margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="Featured: ${esc(s.topGame.title)}">
                      ⭐ ${esc(s.topGame.title)}
                    </div>
                  ` : ''}
                ` : `
                  <div style="font-size:11px;color:var(--fg-quaternary);font-style:italic;padding-top:8px;border-top:1px solid var(--stroke-subtle);">
                    ${isLinked ? 'Account linked · No direct titles parsed' : 'No titles or linked account'}
                  </div>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="widget" style="margin-top:32px;">
        <div class="widget-title">Connected Storefront Summary</div>
        <div class="data-list" style="max-width:600px;margin-top:12px;">
          <li><span>Total Library Titles</span><span><strong>${total}</strong></span></li>
          <li><span>Estimated Total Store Worth</span><span style="color:var(--status-success-fg);font-weight:600;">${curSym}${Math.round(totalValuation).toLocaleString()}</span></li>
          <li><span>Active Marketplace</span><span>Epic Games Store (GDPR Export)</span></li>
          <li><span>External Connected Auth Links</span><span>${connectedExternalAccounts.length} linked platforms</span></li>
        </div>
      </div>
    </div>
  `;

  // Wire store cards click to filter library
  content.querySelectorAll('.store-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.hash = '#library';
    });
  });
}
