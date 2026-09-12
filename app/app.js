/* ==========================================================================
   Game ID — App Router & Topbar Controller
   ========================================================================== */

import { loadAccount, getProfile, hasAccount, getLastSyncTime } from './services/loader.js';
import { renderHome } from './pages/home.js';
import { renderLibrary } from './pages/library.js';
import { renderGameDetail } from './pages/game-detail.js';
import { renderAnalytics } from './pages/analytics.js';
import { renderAccounts } from './pages/accounts.js';
import { renderStores } from './pages/stores.js';
import { renderCollections } from './pages/collections.js';
import { renderSearch } from './pages/search.js';
import { renderSettings } from './pages/settings.js';
import { openSyncModal } from './components/sync-modal.js';

const routes = {
  home: renderHome,
  accounts: renderAccounts,
  library: renderLibrary,
  stores: renderStores,
  analytics: renderAnalytics,
  collections: renderCollections,
  search: renderSearch,
  settings: renderSettings,
};

const pageTitles = {
  home: 'Home',
  accounts: 'Accounts',
  library: 'Library',
  stores: 'Stores',
  analytics: 'Analytics',
  collections: 'Collections',
  search: 'Search',
  settings: 'Settings',
};

let currentRoute = null;

export async function navigate(route, params, force = false) {
  if (currentRoute === route && !params && !force) return;
  currentRoute = route;

  const renderer = routes[route];
  if (!renderer) return;

  const content = document.getElementById('content');
  content.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

  document.getElementById('breadcrumb').textContent = pageTitles[route] || route;

  // Update active nav
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.route === route);
  });

  try {
    await renderer(params);
  } catch (err) {
    console.error(`[Router] ${route} failed:`, err);
    content.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-title">Something went wrong</p>
        <p class="empty-state-body">${escapeHtml(err.message)}</p>
      </div>`;
  }
}

export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function updateTopbarProfile(profile) {
  const avatarEl = document.querySelector('.user-avatar');
  const syncStatus = document.querySelector('.sync-status');

  if (profile && (profile.displayName || profile.fullName || profile.email)) {
    const name = profile.displayName || profile.fullName || 'User';
    if (avatarEl) {
      const initials = name.slice(0, 2).toUpperCase();
      avatarEl.textContent = initials;
      avatarEl.title = `${name} (${profile.email || 'Connected'})`;
      avatarEl.classList.remove('guest');
    }

    if (syncStatus) {
      syncStatus.innerHTML = `
        <span class="sync-dot" style="background: var(--status-success-fg); box-shadow: 0 0 8px var(--status-success-fg);"></span>
        <span style="color: var(--status-success-fg); font-weight: 500;">Connected</span>
      `;
    }
  } else {
    // Logged out / fresh state
    if (avatarEl) {
      avatarEl.textContent = '—';
      avatarEl.title = 'No account connected';
      avatarEl.classList.add('guest');
    }

    if (syncStatus) {
      syncStatus.innerHTML = `
        <span class="sync-dot" style="background: var(--fg-quaternary); box-shadow: none;"></span>
        <span style="color: var(--fg-quaternary); font-weight: 400;">Not connected</span>
      `;
    }
  }
}

/* --------------------------------------------------------------- bootstrap */
document.addEventListener('DOMContentLoaded', async () => {
  // Theme
  const savedTheme = localStorage.getItem('gameid-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Load account data from localStorage (or clean fresh state)
  await loadAccount();

  // Update topbar profile indicator
  const prof = getProfile();
  updateTopbarProfile(prof);

  // Setup Sync now button in topbar
  const syncBtn = document.querySelector('.sync-btn');
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      openSyncModal();
    });
  }

  // Default route
  const hash = window.location.hash.replace('#', '') || 'home';
  const [route] = hash.split('/');
  await navigate(route || 'home');
});

window.addEventListener('hashchange', () => {
  const [route] = window.location.hash.replace('#', '').split('/');
  navigate(route || 'home');
});

// Shortcuts: Ctrl+K / Cmd+K -> Search
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    navigate('search');
  }
});

// Topbar search — navigate to search page on Enter
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'topbar-search') {
    const q = e.target.value.trim();
    navigate('search', q || undefined);
  }
});
