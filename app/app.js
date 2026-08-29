/* ==========================================================================
   App Router
   Hash-based client-side routing with account switching
   ========================================================================== */

import { loadAccount, getCurrentAccount } from './services/loader.js';
import { renderHome } from './pages/home.js';
import { renderLibrary } from './pages/library.js';
import { renderGameDetail } from './pages/game-detail.js';
import { renderAnalytics } from './pages/analytics.js';

const routes = {
  '': renderHome,
  home: renderHome,
  library: renderLibrary,
  game: renderGameDetail,
  analytics: renderAnalytics,
};

let currentRoute = null;

async function navigate(route, params = {}) {
  currentRoute = route;

  const content = document.getElementById('content');
  const breadcrumb = document.getElementById('breadcrumb');

  // Update nav active state
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href').slice(1);
    link.classList.toggle('active', href === route);
  });

  // Update breadcrumb
  const labels = {
    '': 'Home',
    home: 'Home',
    library: 'Library',
    game: params.title || 'Game Detail',
    analytics: 'Analytics'
  };
  breadcrumb.textContent = labels[route] || route;

  // Render page
  content.innerHTML = '<div class="loading">Loading...</div>';

  try {
    const account = getCurrentAccount();
    if (routes[route]) {
      await routes[route](params);
    } else {
      content.innerHTML = '<div class="loading">Page not found</div>';
    }
  } catch (err) {
    content.innerHTML = `<div class="loading" style="color: var(--danger);">Error: ${err.message}</div>`;
    console.error('[Router] Navigation failed:', err);
  }
}

async function switchAccount(account) {
  try {
    await loadAccount(account);

    // Update UI
    document.querySelectorAll('.account-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.account === account);
    });

    // Re-render current page
    if (currentRoute) {
      await navigate(currentRoute);
    }
  } catch (err) {
    console.error('[Router] Account switch failed:', err);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Account switcher
  document.querySelectorAll('.account-btn').forEach(btn => {
    btn.addEventListener('click', () => switchAccount(btn.dataset.account));
  });

  // Nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const route = link.getAttribute('href').slice(1);
      window.location.hash = route;
    });
  });

  // Hash change
  // Hash change. Library links ids with encodeURIComponent, so decode here or
  // ids containing %20 / %26 never match the catalog.
  const routeFromHash = () => {
    const hash = window.location.hash.slice(1) || 'home';
    const [route, ...rest] = hash.split('/');
    let id = rest.join('/') || undefined;
    if (id) {
      try { id = decodeURIComponent(id); } catch { /* leave raw if malformed */ }
    }
    return { route, id };
  };

  window.addEventListener('hashchange', () => {
    const { route, id } = routeFromHash();
    navigate(route, { id });
  });

  // Load initial account and route
  await loadAccount('B');
  const { route, id } = routeFromHash();
  await navigate(route, { id });
});

export { navigate };
