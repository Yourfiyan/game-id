/* ==========================================================================
   Game ID — Stores Page
   ========================================================================== */

import { getGames } from '../services/loader.js';
import { storeDistribution } from '../services/analytics.js';

function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

const STORES = [
  { id: 'epic',    label: 'Epic Games Store',   icon: '🛒' },
  { id: 'steam',   label: 'Steam',               icon: '🎮' },
  { id: 'gog',     label: 'GOG',                  icon: '💎' },
  { id: 'microsoft',label:'Microsoft Store',      icon: '🪟' },
  { id: 'humble',  label: 'Humble Bundle',        icon: '🤝' },
  { id: 'itch',    label: 'itch.io',              icon: '🍠' },
  { id: 'ubisoft', label: 'Ubisoft Connect',      icon: '🎯' },
  { id: 'ea',      label: 'EA App',               icon: '⚽' },
  { id: 'origin',  label: 'Origin',               icon: '🔵' },
  { id: 'parsec',  label: 'Parsec',               icon: '🌐' },
  { id: 'nv',      label: 'NVIDIA GeForce NOW',   icon: '🟢' },
  { id: 'stadia',  label: 'Google Stadia',        icon: '📡' },
];

export async function renderStores() {
  const games = getGames();
  const storeDist = storeDistribution(games);
  const storeMap = Object.fromEntries(storeDist.distribution.map(s => [s.label.toLowerCase().replace(/[^a-z0-9]/g,''), s]));

  const priceSym = games[0]?.currency === 'USD' ? '$' : '₹';

  // Top-rated per store
  const storeRated = {};
  games.forEach(g => {
    if (!g.ratings || !g.ratings.igdb) return;
    const store = (g.store || g.platform || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '');
    const match = Object.keys(storeMap).find(k => store.includes(k));
    if (!match) return;
    if (!storeRated[match] || g.ratings.igdb > storeRated[match].ratings.igdb) {
      storeRated[match] = g;
    }
  });

  const total = games.length;
  const unenriched = games.filter(g => g.title === 'Needs Manual Verification').length;

  document.getElementById('content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">Stores</h1>
        <p class="page-subtitle">${total} entitlements across ${STORES.length} connected stores</p>
      </div>

      <div class="store-grid">
        ${STORES.map(s => {
          const key = s.id.toLowerCase().replace(/[^a-z0-9]/g,'');
          const data = storeMap[key] || { count: 0 };
          const pct = total ? (data.count / total * 100).toFixed(1) : 0;
          return `
            <div class="store-card">
              <div class="store-card-head">
                <div class="store-icon">${s.icon}</div>
                <div class="store-name">${s.label}</div>
                <div class="store-count-badge">${data.count}</div>
              </div>
              <div class="store-card-body">
                <div class="store-stat">
                  <span>Share</span>
                  <span class="text-brand" style="font-weight:600">${pct}%</span>
                </div>
                <div class="store-bar-track">
                  <div class="store-bar-fill" style="width:${pct}%"></div>
                </div>
                ${data.count ? `<div class="store-top-game">${storeRated[key] ? esc(storeRated[key].title) : ''}</div>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="widget" style="margin-top:28px">
        <div class="widget-title">Store distribution summary</div>
        <div class="distribution-list" style="max-width:560px">
          ${storeDist.distribution.slice(0, 10).map(s => {
            const pct = (s.count / storeDist.distribution[0].count * 100).toFixed(0);
            return `
              <div class="distribution-item">
                <span class="distribution-label">${esc(s.label)}</span>
                <div class="distribution-bar-track"><div class="distribution-bar-fill" style="width:${pct}%"></div></div>
                <span class="distribution-count">${s.count}</span>
              </div>
            `;
          }).join('')}
        </div>
        <div class="divider"></div>
        <div class="data-list">
          <li><span>Known store</span><span>${total - unenriched}</span></li>
          <li><span>Unenriched</span><span>${unenriched}</span></li>
          <li><span>Stores with content</span><span>${storeDist.distribution.filter(s => s.count > 0).length}</span></li>
        </div>
      </div>
    </div>
  `;
}
