/* ==========================================================================
   Game ID — Sync Modal Component
   Handles Drag & Drop ZIP extraction, in-browser PDF parsing,
   displaying extracted account data, and updating application state.
   ========================================================================== */

import { extractFromZipOrFile } from '../services/extractor.js';
import { loadAccount, getCurrentAccount } from '../services/loader.js';

let modalContainer = null;
let lastExtractionResult = null;

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Initializes and injects the Sync Modal DOM if not present.
 */
export function initSyncModal() {
  if (document.getElementById('sync-modal-root')) return;

  const root = document.createElement('div');
  root.id = 'sync-modal-root';
  root.innerHTML = `
    <div class="sync-scrim" id="sync-scrim">
      <div class="sync-modal" role="dialog" aria-modal="true" aria-labelledby="sync-modal-title">
        <!-- Header -->
        <div class="sync-header">
          <div class="sync-title-group">
            <div class="sync-icon-badge">
              <svg viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            </div>
            <div>
              <div class="sync-title" id="sync-modal-title">Sync Account Data</div>
              <div class="sync-subtitle">Extract library, connected accounts & profile from Epic export</div>
            </div>
          </div>
          <button class="sync-close-btn" id="sync-close-btn" aria-label="Close dialog">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="sync-body" id="sync-body">
          <!-- Drop Zone -->
          <div class="sync-dropzone" id="sync-dropzone">
            <div class="sync-dropzone-icon">
              <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <div class="sync-dropzone-title">Drop EpicGamesAccountData.zip here</div>
            <div class="sync-dropzone-desc">Drag and drop your exported Epic Games account data ZIP file or click to select from your computer.</div>
            <div class="sync-dropzone-hint">Compatible with GDPR account exports and individual PDF data files</div>
            <input type="file" id="sync-file-input" class="sync-file-input" accept=".zip,.pdf">
          </div>

          <!-- Progress (hidden initially) -->
          <div class="sync-progress" id="sync-progress" style="display: none;">
            <div class="sync-progress-head">
              <span id="sync-progress-label">Extracting account metadata...</span>
              <span class="spinner" style="width: 14px; height: 14px; display: inline-block;"></span>
            </div>
            <div class="sync-progress-bar">
              <div class="sync-progress-fill"></div>
            </div>
          </div>

          <!-- Results Container (hidden initially) -->
          <div class="sync-results" id="sync-results" style="display: none;"></div>
        </div>

        <!-- Footer -->
        <div class="sync-footer" id="sync-footer">
          <div class="sync-footer-info" id="sync-footer-info" style="font-size: 12px; color: var(--fg-tertiary);">
            No data uploaded to any server — processed 100% locally in your browser.
          </div>
          <div class="sync-footer-actions">
            <button class="btn-secondary" id="sync-cancel-btn">Close</button>
            <button class="btn-primary" id="sync-apply-btn" style="display: none;">Apply to Library</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(root);
  modalContainer = root;

  setupEvents();
}

function setupEvents() {
  const scrim = document.getElementById('sync-scrim');
  const closeBtn = document.getElementById('sync-close-btn');
  const cancelBtn = document.getElementById('sync-cancel-btn');
  const applyBtn = document.getElementById('sync-apply-btn');
  const dropzone = document.getElementById('sync-dropzone');
  const fileInput = document.getElementById('sync-file-input');

  // Close handlers
  const close = () => closeSyncModal();
  closeBtn.addEventListener('click', close);
  cancelBtn.addEventListener('click', close);
  scrim.addEventListener('click', (e) => {
    if (e.target === scrim) close();
  });

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && scrim.classList.contains('active')) {
      close();
    }
  });

  // Dropzone click -> file input
  dropzone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  });

  // Drag and drop events
  ['dragenter', 'dragover'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  });

  // Apply button
  applyBtn.addEventListener('click', () => {
    applyExtractedData();
  });
}

/**
 * Open the sync modal.
 */
export function openSyncModal() {
  initSyncModal();
  const scrim = document.getElementById('sync-scrim');
  scrim.classList.add('active');

  // If there are already results, keep them, else show dropzone
  if (!lastExtractionResult) {
    resetSyncModal();
  }
}

/**
 * Close the sync modal.
 */
export function closeSyncModal() {
  const scrim = document.getElementById('sync-scrim');
  if (scrim) scrim.classList.remove('active');
}

function resetSyncModal() {
  const dropzone = document.getElementById('sync-dropzone');
  const progress = document.getElementById('sync-progress');
  const results = document.getElementById('sync-results');
  const applyBtn = document.getElementById('sync-apply-btn');

  if (dropzone) dropzone.style.display = 'flex';
  if (progress) progress.style.display = 'none';
  if (results) {
    results.style.display = 'none';
    results.innerHTML = '';
  }
  if (applyBtn) applyBtn.style.display = 'none';
}

async function handleFile(file) {
  const dropzone = document.getElementById('sync-dropzone');
  const progress = document.getElementById('sync-progress');
  const progressLabel = document.getElementById('sync-progress-label');
  const results = document.getElementById('sync-results');
  const applyBtn = document.getElementById('sync-apply-btn');

  dropzone.style.display = 'none';
  progress.style.display = 'flex';
  results.style.display = 'none';

  try {
    const data = await extractFromZipOrFile(file, (p) => {
      progressLabel.textContent = p.message || 'Extracting data...';
    });

    lastExtractionResult = data;
    renderResults(data);

    progress.style.display = 'none';
    results.style.display = 'flex';
    applyBtn.style.display = 'inline-block';
  } catch (err) {
    console.error('[SyncModal] Extraction failed:', err);
    progress.style.display = 'none';
    dropzone.style.display = 'flex';
    alert(`Extraction failed: ${err.message}`);
  }
}

function renderResults(data) {
  const results = document.getElementById('sync-results');
  const prof = data.profile;
  const connected = prof.connectedAccounts || [];
  const games = data.games || [];

  const initials = (prof.displayName || 'U').slice(0, 2).toUpperCase();

  const authIcons = {
    github: '🐙',
    google: '🔍',
    ubisoft: '🎯',
    steam: '🎮',
    xbox: '🟢',
    playstation: '🔵',
  };

  results.innerHTML = `
    <!-- Success Banner -->
    <div class="sync-success-banner">
      <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <span>Successfully extracted account metadata and ${games.length} consented game entries!</span>
    </div>

    <!-- Account Details Card -->
    <div class="sync-account-card">
      <div class="sync-account-head">
        <div class="sync-account-avatar">${esc(initials)}</div>
        <div>
          <div class="sync-account-name">${esc(prof.displayName)} ${prof.fullName ? `(${esc(prof.fullName)})` : ''}</div>
          <div class="sync-account-sub">ID: ${esc(prof.id)} · Status: ${esc(prof.status)} · Created: ${esc(prof.createdAt)}</div>
        </div>
      </div>

      <div class="sync-account-details-grid">
        <div class="sync-detail-item">
          <span class="sync-detail-label">Email</span>
          <span class="sync-detail-val">${esc(prof.email || '—')}</span>
        </div>
        <div class="sync-detail-item">
          <span class="sync-detail-label">Country / Lang</span>
          <span class="sync-detail-val">${esc(prof.country)} · ${esc(prof.language)}</span>
        </div>
        <div class="sync-detail-item">
          <span class="sync-detail-label">Entitlements</span>
          <span class="sync-detail-val">${prof.entitlementCount} grants</span>
        </div>
        <div class="sync-detail-item">
          <span class="sync-detail-label">Consented Games</span>
          <span class="sync-detail-val">${games.length} titles</span>
        </div>
        <div class="sync-detail-item">
          <span class="sync-detail-label">Last Login</span>
          <span class="sync-detail-val">${esc(prof.lastLogin || '—')}</span>
        </div>
        <div class="sync-detail-item">
          <span class="sync-detail-label">Connected Accounts</span>
          <span class="sync-detail-val">${connected.length} linked</span>
        </div>
      </div>
    </div>

    <!-- Connected Accounts Section -->
    ${connected.length ? `
      <div class="sync-connected-section">
        <div class="sync-section-title">Connected Accounts (External Auths)</div>
        <div class="sync-connected-grid">
          ${connected.map(c => `
            <div class="sync-connected-card">
              <div class="sync-auth-icon">${authIcons[c.authType.toLowerCase()] || '🔗'}</div>
              <div class="sync-auth-info">
                <div class="sync-auth-type">${esc(c.authType)}</div>
                <div class="sync-auth-name">${esc(c.externalDisplayName || c.externalAuthId)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Games Preview Table -->
    <div class="sync-games-preview">
      <div class="sync-section-title">Extracted Games &amp; Applications (${games.length})</div>
      <div class="sync-games-table-wrapper">
        <table class="sync-games-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Publisher / Org</th>
              <th>Type</th>
              <th>Authorized Date</th>
            </tr>
          </thead>
          <tbody>
            ${games.map(g => `
              <tr>
                <td style="font-weight: 500; color: var(--fg-primary);">${esc(g.title)}</td>
                <td>${esc(g.publisher || '—')}</td>
                <td><span class="badge" style="font-size: 10px; text-transform: uppercase;">${esc(g.classification)}</span></td>
                <td>${esc(g.ownership?.purchaseDate || '—')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function applyExtractedData() {
  if (!lastExtractionResult) return;

  const prof = lastExtractionResult.profile;

  // Save to localStorage
  localStorage.setItem('gameid-synced-profile', JSON.stringify(prof));
  localStorage.setItem('gameid-last-sync', new Date().toISOString());

  // Update topbar status
  const syncStatus = document.querySelector('.sync-status');
  if (syncStatus) {
    syncStatus.innerHTML = `
      <span class="sync-dot" style="background: var(--status-success-fg); box-shadow: 0 0 8px var(--status-success-fg);"></span>
      <span style="color: var(--status-success-fg); font-weight: 500;">Synced just now</span>
    `;
  }

  // Update user avatar initials in topbar
  const avatarEl = document.querySelector('.user-avatar');
  if (avatarEl && prof.displayName) {
    avatarEl.textContent = prof.displayName.slice(0, 2).toUpperCase();
    avatarEl.title = `${prof.displayName} (${prof.email || ''})`;
  }

  // Close modal and show notification
  closeSyncModal();

  // Reload current account / trigger page update
  const curr = getCurrentAccount() || 'B';
  loadAccount(curr).then(() => {
    const hash = window.location.hash.replace('#', '') || 'home';
    const [route] = hash.split('/');
    import('../app.js').then(m => m.navigate(route));
  });
}
