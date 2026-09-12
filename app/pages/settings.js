/* ==========================================================================
   Game ID — Settings Page
   ========================================================================== */

import { getGames, getProfile, hasAccount, removeAccount } from '../services/loader.js';
import { overview } from '../services/analytics.js';
import { openSyncModal } from '../components/sync-modal.js';
import { navigate, updateTopbarProfile } from '../app.js';

const SK = 'gameid-settings';

function load() {
  try { return JSON.parse(localStorage.getItem(SK)) || {}; }
  catch { return {}; }
}
function save(s) { localStorage.setItem(SK, JSON.stringify(s)); }

function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

export async function renderSettings() {
  const s = load();
  const games = getGames();
  const prof = getProfile();
  const isConnected = hasAccount();
  const ov = overview(games);

  document.getElementById('content').innerHTML = `
    <div class="page settings-page">
      <div class="page-header">
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Application preferences and account data management</p>
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
        <h3>Account &amp; Data Source</h3>
        <div style="margin-bottom: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 12px;">
            <div>
              <div style="font-weight: 600; font-size: 15px; color: var(--fg-primary);">
                ${isConnected ? esc(prof?.displayName || 'Connected Account') : 'No Account Connected'}
                ${prof?.email ? `<span style="font-size: 13px; font-weight: 400; color: var(--fg-secondary); margin-left: 6px;">(${esc(prof.email)})</span>` : ''}
              </div>
              <div style="font-size: 12px; color: var(--fg-tertiary); margin-top: 3px;">
                ${isConnected ? 'Imported from official Epic Games account export' : 'Connect an account by syncing an Epic Games GDPR export (.zip or .pdf)'}
              </div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <button class="btn-primary" id="btn-sync-settings" style="font-size: 13px; padding: 7px 14px;">
                ${isConnected ? 'Sync New Export' : 'Connect / Sync Account'}
              </button>
              ${isConnected ? `
                <button class="btn-secondary" id="btn-remove-account" style="font-size: 13px; padding: 7px 14px; color: var(--status-danger-fg); border-color: rgba(227, 125, 128, 0.4);">
                  Remove Account
                </button>
              ` : ''}
            </div>
          </div>
        </div>

        <ul class="data-list">
          <li><span>Account Status</span><span>${isConnected ? '<span class="badge badge-success">Connected</span>' : '<span class="badge badge-neutral">Not Connected</span>'}</span></li>
          <li><span>Total records</span><span>${games.length}</span></li>
          <li><span>Games (classification: game)</span><span>${ov.byClassification?.game ?? 0}</span></li>
          <li><span>DLC / Other</span><span>${(ov.byClassification?.dlc ?? 0) + (ov.byClassification?.other ?? 0) + (ov.byClassification?.app ?? 0)}</span></li>
          <li><span>Data Storage</span><span>100% Local (Browser LocalStorage)</span></li>
        </ul>
      </div>

      <div class="settings-section">
        <h3>About</h3>
        <ul class="data-list">
          <li><span>App</span><span>Game ID · Game Library Intelligence Dashboard</span></li>
          <li><span>Privacy Guarantee</span><span>Zero-server, 100% client-side data parsing</span></li>
          <li><span>Supported Formats</span><span>Epic Games GDPR Export (.zip, .pdf)</span></li>
        </ul>
      </div>
    </div>
  `;

  document.getElementById('set-theme')?.addEventListener('change', e => {
    save({ ...s, theme: e.target.value });
    document.documentElement.setAttribute('data-theme', e.target.value);
    localStorage.setItem('gameid-theme', e.target.value);
  });
  document.getElementById('set-pagesize')?.addEventListener('change', e => save({ ...s, pageSize: parseInt(e.target.value, 10) }));
  document.getElementById('set-compact')?.addEventListener('change', e => save({ ...s, compact: e.target.checked }));

  document.getElementById('btn-sync-settings')?.addEventListener('click', () => {
    openSyncModal();
  });

  document.getElementById('btn-remove-account')?.addEventListener('click', async () => {
    const ok = confirm('Are you sure you want to remove your account?\n\nThis will delete all imported profile and game data from this browser and return Game ID to the logged-out state.');
    if (ok) {
      await removeAccount();
      updateTopbarProfile(null);
      navigate('settings', null, true);
    }
  });
}
