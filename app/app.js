/* ==========================================================================
   Game ID — App Router
   ========================================================================== */

import { loadAccount, getCurrentAccount, getAccounts } from './services/loader.js';
import { renderHome } from './pages/home.js';
import { renderLibrary } from './pages/library.js';
import { renderGameDetail } from './pages/game-detail.js';
import { renderAnalytics } from './pages/analytics.js';
import { renderAccounts } from './pages/accounts.js';
import { renderStores } from './pages/stores.js';
import { renderCollections } from './pages/collections.js';
import { renderSearch } from './pages/search.js';
import { renderSettings } from './pages/settings.js';

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

export async function navigate(route, params) {
  if (currentRoute === route && !params) return;
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

/* --------------------------------------------------------------- bootstrap */
document.addEventListener('DOMContentLoaded', async () => {
  // Theme
  const saved = localStorage.getItem('gameid-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  // Load config first (needed by everything)
  await loadAccount('A');

  // Default route
  const hash = window.location.hash.replace('#', '') || 'home';
  const [route] = hash.split('/');
  await navigate(route);
});

window.addEventListener('hashchange', () => {
  const [route] = window.location.hash.replace('#', '').split('/');
  navigate(route);
});

// Theme toggle on avatar click (or could be moved to settings)
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

// Account switcher
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.account-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const acct = btn.dataset.account;
      document.querySelectorAll('.account-btn').forEach(b => b.classList.toggle('active', b.dataset.account === acct));
      await loadAccount(acct);
      // Refresh current view
      const hash = window.location.hash.replace('#', '') || 'home';
      const [route] = hash.split('/');
      await navigate(route);
    });
  });
});
