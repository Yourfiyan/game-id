/* ==========================================================================
   Game ID — Analytics Page
   ========================================================================== */

import { getGames } from '../services/loader.js';
import { overview, genreDistribution, priceDistribution, confidenceDistribution, playtimeDistribution, acquisitionTimeline, completionAnalysis, storeDistribution } from '../services/analytics.js';
import { openSyncModal } from '../components/sync-modal.js';

/* ---- token helpers ------------------------------------------------------- */
const TK = {
  canvas:     getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim() || '#141414',
  layer:      getComputedStyle(document.documentElement).getPropertyValue('--bg-layer').trim() || '#1f1f1f',
  subtle:     getComputedStyle(document.documentElement).getPropertyValue('--bg-subtle').trim() || '#292929',
  brand:      getComputedStyle(document.documentElement).getPropertyValue('--brand-rest').trim() || '#115ea3',
  brandHover: getComputedStyle(document.documentElement).getPropertyValue('--brand-hover').trim() || '#0f6cbd',
  fg: {
    primary:   getComputedStyle(document.documentElement).getPropertyValue('--fg-primary').trim() || '#ffffff',
    secondary: getComputedStyle(document.documentElement).getPropertyValue('--fg-secondary').trim() || '#d6d6d6',
    tertiary:  getComputedStyle(document.documentElement).getPropertyValue('--fg-tertiary').trim() || '#adadad',
    quat:      getComputedStyle(document.documentElement).getPropertyValue('--fg-quaternary').trim() || '#949494',
  },
  status: {
    success: getComputedStyle(document.documentElement).getPropertyValue('--status-success-fg').trim() || '#5ec75e',
    caution: getComputedStyle(document.documentElement).getPropertyValue('--status-caution-fg').trim() || '#f2c661',
    danger:  getComputedStyle(document.documentElement).getPropertyValue('--status-danger-fg').trim() || '#e37d80',
    info:    getComputedStyle(document.documentElement).getPropertyValue('--status-info-fg').trim() || '#479ef5',
  },
};

const DONUT_PALETTE = [TK.brand, TK.status.info, TK.status.success, TK.status.caution, TK.status.danger,
                       '#7c5cfc', '#e87d80', '#5ec7c0', '#c0a35e', '#9b5ec7'];

const BAR_COLORS = [TK.brand, TK.brandHover, '#2a7fd4', '#5aa3e8', '#93c5f5',
                    TK.status.info, TK.status.success, TK.status.caution, TK.status.danger,
                    '#7c5cfc', '#e87d80', '#5ec7c0', '#c0a35e', '#9b5ec7', '#8a8a8a'];

export async function renderAnalytics() {
  const games = getGames();
  const content = document.getElementById('content');

  if (!games || games.length === 0) {
    content.innerHTML = `
      <div class="page analytics-page">
        <div class="page-header">
          <h1 class="page-title">Analytics</h1>
          <p class="page-subtitle">Ownership intelligence &amp; portfolio metrics</p>
        </div>
        <div style="background: var(--bg-layer); border: 1px solid var(--stroke-subtle); border-radius: var(--r-lg); padding: 48px 32px; text-align: center; max-width: 640px; margin: 32px auto;">
          <div style="font-size: 40px; margin-bottom: 16px;">📊</div>
          <h2 style="font-size: 20px; font-weight: 600; color: var(--fg-primary); margin-bottom: 8px;">No Analytics Available</h2>
          <p style="font-size: 14px; color: var(--fg-secondary); line-height: 1.5; margin-bottom: 24px;">
            Connect your account by syncing an Epic Games GDPR export (.zip or .pdf) to generate valuation breakdowns, genre distribution charts, review analysis, and playtime metrics.
          </p>
          <button class="btn-primary" id="analytics-empty-sync" style="font-size: 13px; padding: 8px 20px;">
            Sync / Import Data
          </button>
        </div>
      </div>
    `;

    document.getElementById('analytics-empty-sync')?.addEventListener('click', () => openSyncModal());
    return;
  }

  const ov = overview(games);
  const genreData = genreDistribution(games);
  const priceData = priceDistribution(games);
  const confData  = confidenceDistribution(games);
  const playData  = playtimeDistribution(games);
  const tlData    = acquisitionTimeline(games);

  content.innerHTML = `
    <div class="page analytics-page">
      <div class="page-header">
        <h1 class="page-title">Analytics</h1>
        <p class="page-subtitle">Patterns across ${games.length} entitlements</p>
      </div>
      <div class="analytics-grid">
        ${renderDonut({items: genreData.distribution}, 'Genre', 'Top genres across the library')}
        ${renderBars({items: priceData.items}, 'Price', 'Distribution of listed prices', 'price')}
        ${renderBars({items: confData.items}, 'Confidence', 'Enrichment confidence breakdown', 'conf')}
        ${renderScatter({items: playData.scatter}, 'Playtime vs price')}
        ${renderTimeline({items: tlData.byMonth}, 'Acquisition timeline', 'Title additions over time')}
        ${renderHeatmap(games, 'Genre × Confidence')}
      </div>
    </div>
  `;

  await Promise.all([
    drawDonutChart('chart-genre', genreData.distribution, DONUT_PALETTE),
    drawBarChart('chart-price', priceData.items, BAR_COLORS),
    drawBarChart('chart-conf', confData.items, [TK.status.success, TK.status.caution, TK.status.danger]),
    drawScatter('chart-scatter', playData.scatter),
    drawTimeline('chart-timeline', tlData.byMonth),
    drawHeatmap('chart-heatmap', games),
  ]);
}

/* ---- grid wrapper helpers ------------------------------------------------ */
function widget(children, full = false) {
  return `<div class="widget ${full ? 'widget--full' : ''}">${children}</div>`;
}

function title(icon, text, sub) {
  return `<div class="widget-title"><span class="widget-icon">${icon}</span>${text}${sub ? `<span class="widget-subtitle">${sub}</span>` : ''}</div>`;
}

function renderDonut(data, label, sub) {
  const items = data.items || data.distribution || [];
  const total = items.reduce((s, x) => s + x.count, 0);
  return widget(`
    ${title('📊', label, sub)}
    <div class="donut-wrap">
      <div class="donut-canvas-wrap"><canvas id="chart-${sanitize(label)}" width="160" height="160"></canvas></div>
      <div class="donut-legend">
        ${items.slice(0, 8).map((it, i) => `
          <div class="donut-legend-item">
            <div class="donut-legend-dot" style="background:${DONUT_PALETTE[i % DONUT_PALETTE.length]}"></div>
            <span class="donut-legend-label">${esc(it.label)}</span>
            <span class="donut-legend-value">${it.count}</span>
            <span class="donut-legend-pct">${total ? (it.count / total * 100).toFixed(1) : 0}%</span>
          </div>
        `).join('')}
      </div>
    </div>
  `);
}

function renderBars(data, label, sub, type) {
  const items = data.items || data.distribution || [];
  const total = items.reduce((s, x) => s + x.count, 0);
  const max = Math.max(...items.map(x => x.count), 1);
  const colors = type === 'conf' ? [TK.status.success, TK.status.caution, TK.status.danger] : BAR_COLORS;
  return widget(`
    ${title('📈', label, sub)}
    <div class="bar-chart">
      ${items.length === 0 ? '<div style="font-size:13px;color:var(--fg-tertiary)">No data</div>' : items.slice(0, 12).map((it, i) => `
        <div class="bar-row">
          <span class="bar-label">${esc(it.label)}</span>
          <div class="bar-track">
            <div class="bar-fill" style="width:${(it.count / max * 100).toFixed(1)}%;background:${colors[i % colors.length]}"></div>
          </div>
          <span class="bar-val">${it.count}</span>
        </div>
      `).join('')}
      ${items.length === 0 ? '<div style="font-size:13px;color:var(--fg-tertiary)">No data</div>' : ''}
    </div>
  `);
}

function renderScatter(data, label) {
  return widget(`
    ${title('🎯', label, 'Filtered to titles with playtime')}
    <div class="scatter-wrap">
      <canvas id="chart-scatter" width="400" height="200"></canvas>
    </div>
  `, true);
}

function renderTimeline(data, label, sub) {
  return widget(`
    ${title('📅', label, sub)}
    <div class="timeline-canvas-wrap">
      <canvas id="chart-timeline" width="400" height="160"></canvas>
    </div>
  `, true);
}

function renderHeatmap(games, label) {
  return widget(`
    ${title('🗺', label, 'Distribution across confidence buckets')}
    <div id="chart-heatmap" class="heatmap-container"></div>
  `, true);
}

/* ---- chart drawing helpers (Canvas) -------------------------------------- */
function sanitize(s) { return s.toLowerCase().replace(/[^a-z0-9]/g, '-'); }
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function drawDonutChart(canvasId, items, palette) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 160;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.scale(dpr, dpr);

  const total = items.reduce((s, x) => s + x.count, 0);
  if (!total) return;

  const cx = size / 2, cy = size / 2, r = 68, innerR = 46;
  let start = -Math.PI / 2;

  items.forEach((it, i) => {
    const slice = (it.count / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, start + slice);
    ctx.arc(cx, cy, innerR, start + slice, start, true);
    ctx.closePath();
    ctx.fillStyle = palette[i % palette.length];
    ctx.fill();
    start += slice;
  });
}

function drawBarChart(canvasId, items, palette) {
  // Handled via CSS bars in renderBars() for crisp text rendering
}

function drawScatter(canvasId, points) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width || 400;
  const h = 200;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  if (!points || !points.length) {
    ctx.fillStyle = TK.fg.tertiary;
    ctx.font = '12px Inter, Segoe UI, sans-serif';
    ctx.fillText('No recorded playtime data in this library', 20, h / 2);
    return;
  }

  const maxHours = Math.max(...points.map(p => p.hours), 1);
  const maxPrice = Math.max(...points.map(p => p.price), 100);
  const pad = 36;

  // Grid
  ctx.strokeStyle = TK.subtle;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, h - pad);
  ctx.lineTo(w - pad, h - pad);
  ctx.stroke();

  // Points
  points.forEach(p => {
    const x = pad + (p.hours / maxHours) * (w - pad * 2);
    const y = (h - pad) - (p.price / maxPrice) * (h - pad * 2);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = TK.brandHover;
    ctx.fill();
  });
}

function drawTimeline(canvasId, months) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width || 400;
  const h = 160;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  if (!months || !months.length) {
    ctx.fillStyle = TK.fg.tertiary;
    ctx.font = '12px Inter, Segoe UI, sans-serif';
    ctx.fillText('No acquisition dates recorded in this library', 20, h / 2);
    return;
  }

  const max = Math.max(...months.map(m => m.count), 1);
  const pad = 30;
  const barW = Math.max(2, (w - pad * 2) / months.length - 2);

  months.forEach((m, i) => {
    const barH = (m.count / max) * (h - pad * 2);
    const x = pad + i * ((w - pad * 2) / months.length);
    const y = h - pad - barH;
    ctx.fillStyle = TK.brand;
    ctx.fillRect(x, y, barW, barH);
  });
}

function drawHeatmap(containerId, games) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const topGenres = ['Action', 'Indie', 'Adventure', 'RPG', 'Strategy', 'Casual', 'Simulation'].slice(0, 6);
  const confs = ['High', 'Medium', 'Low'];

  const matrix = {};
  confs.forEach(c => {
    matrix[c] = {};
    topGenres.forEach(g => { matrix[c][g] = 0; });
  });

  games.forEach(g => {
    const c = g.confidence || 'Medium';
    (g.genres || []).forEach(gen => {
      if (topGenres.includes(gen) && matrix[c]) {
        matrix[c][gen]++;
      }
    });
  });

  let maxVal = 1;
  confs.forEach(c => topGenres.forEach(g => {
    if (matrix[c][g] > maxVal) maxVal = matrix[c][g];
  }));

  el.innerHTML = `
    <table class="heatmap-table">
      <thead>
        <tr>
          <th>Confidence</th>
          ${topGenres.map(g => `<th>${esc(g)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${confs.map(c => `
          <tr>
            <td class="heatmap-row-header">${c}</td>
            ${topGenres.map(g => {
              const val = matrix[c][g];
              const intensity = (val / maxVal).toFixed(2);
              return `<td class="heatmap-cell" style="background: rgba(17,94,163,${Math.max(0.08, intensity)})" title="${c} × ${g}: ${val} titles">${val}</td>`;
            }).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}
