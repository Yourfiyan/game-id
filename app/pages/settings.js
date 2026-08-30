/* ==========================================================================
   Game ID — Settings Page
   ========================================================================== */

import { getGames, getAccounts } from '../services/loader.js';
import { overview } from '../services/analytics.js';

const SK = 'gameid-settings';

function load() {
  try { return JSON.parse(localStorage.getItem(SK)) || {}; }
  catch { return {}; }
}
function save(s) { localStorage.setItem(SK, JSON.stringify(s)); }

function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

export async function renderSettings() {
  const s = load();
  const accounts = getAccounts();
  const games = accounts.B || [];
  const ov = overview(games);

  document.getElementById('content').innerHTML = `
    <div class="page settings-page">
      <div class="page-header">
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Application preferences and data management</p>
      </div>

      <div class="settings-section">
        <h3>Preferences</h3>

        <div class="setting-row">
          <div class="setting-label">
            <div class="setting-name">Theme</div>
            <div class="setting-desc">Colour mode for the interface</div>
          </div>
          <select id="set-theme" class="setting-control">
            <option value="dark" ${s.theme === 'light' ? '' : 'selected'}>Dark</option>
            <option value="light" ${s.theme === 'light' ? 'selected' : ''}>Light</option>
          </select>
        </div>

        <div class="setting-row">
          <div class="setting-label">
            <div class="setting-name">Default account</div>
            <div class="setting-desc">Library to show first</div>
          </div>
          <select id="set-account" class="setting-control">
            <option value="A" ${s.defaultAccount === 'A' ? 'selected' : ''}>Account A (${accounts.A?.length ?? 0} entitlements)</option>
            <option value="B" ${s.defaultAccount === 'B' ? 'selected' : ''}>Account B (${accounts.B?.length ?? 0} entitlements)</option>
            <option value="both" ${s.defaultAccount === 'both' ? 'selected' : ''}>Both accounts</option>
          </select>
        </div>

        <div class="setting-row">
          <div class="setting-label">
            <div class="setting-name">Page size</div>
            <div class="setting-desc">Rows per page in the library</div>
          </div>
          <select id="set-pagesize" class="setting-control">
            <option value="24" ${!s.pageSize || s.pageSize === 24 ? 'selected' : ''}>24</option>
            <option value="50" ${s.pageSize === 50 ? 'selected' : ''}>50</option>
            <option value="100" ${s.pageSize === 100 ? 'selected' : ''}>100</option>
            <option value="0" ${s.pageSize === 0 ? 'selected' : ''}>All</option>
          </select>
        </div>

        <div class="setting-row">
          <div class="setting-label">
            <div class="setting-name">Compact mode</div>
            <div class="setting-desc">Tighter rows and smaller gutters</div>
          </div>
          <label class="toggle">
            <input type="checkbox" id="set-compact" ${s.compact ? 'checked' : ''}>
            <span class="toggle-track"><span class="toggle-thumb"></span></span>
          </label>
        </div>
      </div>

      <div class="settings-section">
        <h3>Data</h3>
        <ul class="data-list">
          <li><span>Total records</span><span>${games.length}</span></li>
          <li><span>Games (classification: game)</span><span>${ov.byClassification?.game ?? 0}</span></li>
          <li><span>DLC / Other</span><span>${(ov.byClassification?.dlc ?? 0) + (ov.byClassification?.other ?? 0)}</span></li>
          <li><span>Last refreshed</span><span>${new Date().toLocaleDateString()}</span></li>
        </ul>
      </div>

      <div class="settings-section">
        <h3>About</h3>
        <ul class="data-list">
          <li><span>App</span><span>Game ID · Game Library Intelligence Dashboard</span></li>
          <li><span>Source of truth</span><span>Figma design system</span></li>
          <li><span>Total assets</span><span>${games.length} entitlements</span></li>
        </ul>
      </div>
    </div>
  `;

  document.getElementById('set-theme').addEventListener('change', e => {
    save({ ...s, theme: e.target.value });
    document.documentElement.setAttribute('data-theme', e.target.value);
    localStorage.setItem('gameid-theme', e.target.value);
  });
  document.getElementById('set-account').addEventListener('change', e => save({ ...s, defaultAccount: e.target.value }));
  document.getElementById('set-pagesize').addEventListener('change', e => save({ ...s, pageSize: parseInt(e.target.value, 10) }));
  document.getElementById('set-compact').addEventListener('change', e => save({ ...s, compact: e.target.checked }));
}
