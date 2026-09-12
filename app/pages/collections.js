/* ==========================================================================
   Game ID — Collections Page
   ========================================================================== */

import { getGames } from '../services/loader.js';
import { openSyncModal } from '../components/sync-modal.js';

export async function renderCollections() {
  const content = document.getElementById('content');
  const games = getGames();

  if (!games || games.length === 0) {
    content.innerHTML = `
      <div class="page collections-page">
        <div class="page-header">
          <h1 class="page-title">Collections</h1>
          <p class="page-subtitle">Curated smart collections and thematic hubs</p>
        </div>
        <div style="background: var(--bg-layer); border: 1px solid var(--stroke-subtle); border-radius: var(--r-lg); padding: 48px 32px; text-align: center; max-width: 640px; margin: 32px auto;">
          <div style="font-size: 40px; margin-bottom: 16px;">📁</div>
          <h2 style="font-size: 20px; font-weight: 600; color: var(--fg-primary); margin-bottom: 8px;">No Collections Available</h2>
          <p style="font-size: 14px; color: var(--fg-secondary); line-height: 1.5; margin-bottom: 24px;">
            Smart collections are automatically generated once your game library is loaded. Import your Epic Games account export (.zip or .pdf) to create collections for played titles, free games, and high-confidence metadata.
          </p>
          <button class="btn-primary" id="collections-empty-sync" style="font-size: 13px; padding: 8px 20px;">
            Sync / Import Data
          </button>
        </div>
      </div>
    `;

    document.getElementById('collections-empty-sync')?.addEventListener('click', () => openSyncModal());
    return;
  }

  // Built-in smart collections
  const smart = buildSmart(games);

  content.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">Collections</h1>
        <p class="page-subtitle">${smart.length} smart collections across ${games.length} titles</p>
      </div>
      <div class="collections-grid">
        ${smart.map(c => `
          <div class="collection-card" data-name="${esc(c.name)}">
            <div class="coll-header">
              <div class="coll-icon">${c.icon}</div>
              <div class="coll-name">${esc(c.name)}</div>
              <span class="badge badge-neutral">${c.count}</span>
            </div>
            <div class="coll-meta">
              <span>${esc(c.description)}</span>
            </div>
            <div class="coll-preview">
              ${c.titles.slice(0, 4).map(t => `<span class="coll-tag">${esc(t)}</span>`).join('')}
              ${c.titles.length > 4 ? `<span class="coll-tag">+${c.titles.length - 4}</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.querySelectorAll('.coll-tag').forEach(el => {
    el.addEventListener('click', () => {
      import('./search.js').then(m => m.renderSearch(`title:"${el.textContent}"`));
    });
  });
}

function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function buildSmart(games) {
  const isPlayable = g => g.classification === 'game';
  const played = games.filter(g => (g.playtime ?? 0) > 0);
  const never = games.filter(g => !g.playtime || g.playtime === 0);
  const long = games.filter(g => (g.playtime ?? 0) >= 3600);
  const highConf = games.filter(g => (g.confidence || '').toLowerCase() === 'high');
  const free = games.filter(g => g.isFree === true);
  const apps = games.filter(g => g.classification !== 'game');

  return [
    { name: 'All Games', icon: '🎮', description: 'Playable full games', titles: games.filter(isPlayable).map(g => g.title), count: games.filter(isPlayable).length },
    { name: 'Never played', icon: '🕐', description: 'No recorded playtime', titles: never.map(g => g.title), count: never.length },
    { name: 'Played', icon: '✅', description: 'Any playtime recorded', titles: played.map(g => g.title), count: played.length },
    { name: 'High confidence', icon: '🎯', description: 'Verified publisher metadata', titles: highConf.map(g => g.title), count: highConf.length },
    { name: 'Apps & Add-ons', icon: '📦', description: 'Applications, DLCs and extras', titles: apps.map(g => g.title), count: apps.length },
    { name: 'Free Acquisitions', icon: '🎁', description: 'Claimed free titles', titles: free.map(g => g.title), count: free.length },
  ];
}
