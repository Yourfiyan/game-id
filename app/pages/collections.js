/* ==========================================================================
   Game ID — Collections Page
   ========================================================================== */

import { getGames } from '../services/loader.js';

export async function renderCollections() {
  const content = document.getElementById('content');
  const games = getGames();

  // Built-in smart collections
  const smart = buildSmart(games);

  document.getElementById('content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">Collections</h1>
        <p class="page-subtitle">${smart.length} smart collections</p>
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
  const played = games.filter(g => g.raw?.playtimePlayed && g.raw.playtimePlayed > 0);
  const never  = games.filter(g => !g.raw?.playtimePlayed || g.raw.playtimePlayed === 0);
  const long   = played.filter(g => (g.raw.playtimePlayed ?? 0) >= 3600);
  const highConf = games.filter(g => (g.raw?.provenance?.confidence ?? '') === 'high');
  const unenr   = games.filter(g => g.title === 'Needs Manual Verification');

  return [
    { name: 'Never played',  icon: '🕐',   description: 'No recorded playtime',  titles: never.map(g => g.title), count: never.length },
    { name: 'Played',        icon: '✅',   description: 'Any playtime recorded',  titles: played.map(g => g.title), count: played.length },
    { name: 'Long sessions',  icon: '⏱',   description: 'Played 1h+',            titles: long.map(g => g.title), count: long.length },
    { name: 'High confidence',icon: '🎯',   description: 'Fully enriched data',  titles: highConf.map(g => g.title), count: highConf.length },
    { name: 'Unenriched',    icon: '❓',   description: 'Needs manual verification', titles: unenr.map(g => g.title), count: unenr.length },
  ];
}
