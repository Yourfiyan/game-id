/* ==========================================================================
   Game ID — Analytics Page
   ========================================================================== */

import { getGames } from '../services/loader.js';
import { overview, genreDistribution, priceDistribution, confidenceDistribution, playtimeDistribution, acquisitionTimeline, completionAnalysis, storeDistribution } from '../services/analytics.js';

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
  const ov = overview(games);
  const genreData = genreDistribution(games);
  const priceData = priceDistribution(games);
  const confData  = confidenceDistribution(games);
  const playData  = playtimeDistribution(games);
  const tlData    = acquisitionTimeline(games);

  document.getElementById('content').innerHTML = `
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
      ${data.items.length === 0 ? '<div style="font-size:13px;color:var(--fg-tertiary)">No data</div>' : ''}
    </div>
  `);
}

function renderScatter(data, titleText) {
  const items = Array.isArray(data) ? data : (data.items || data.scatter || []);
  return widget(`
    ${title('🔬', titleText)}
    <div class="scatter-wrap"><canvas id="chart-scatter"></canvas></div>
    <div class="analytics-notes" style="margin-top:10px">
      <ul>
        <li>Price is the listed store price; playtime is hours recorded across all sources.</li>
        <li>Games with no recorded playtime appear on the x-axis at 0.</li>
      </ul>
    </div>
  `);
}

function renderTimeline(data, label, sub) {
  return widget(`
    ${title('📅', label, sub)}
    <div class="time-line-wrap"><canvas id="chart-timeline"></canvas></div>
  `);
}

function renderHeatmap(games, label) {
  const genres = (genreDistribution(games)?.distribution ?? []).slice(0, 12).map(i => i.label);
  const confLevels = ['high', 'medium', 'low'];
  const grid = [];
  genres.forEach(g => {
    confLevels.forEach(c => {
      const n = games.filter(x => (x.genres ?? []).includes(g) && (x.raw?.provenance?.confidence ?? '') === c).length;
      grid.push({ genre: g, conf: c, n });
    });
  });
  const maxN = Math.max(...grid.map(x => x.n), 1);

  // generate consistent color per genre
  const colorByGenre = {};
  genres.forEach((g, i) => { colorByGenre[g] = DONUT_PALETTE[i % DONUT_PALETTE.length]; });

  return widget(`
    ${title('🗺', label)}
    <div style="display:flex;gap:24px;flex-wrap:wrap">
      <div>
        <div style="display:grid;grid-template-columns:120px repeat(3,56px);gap:2px;font-size:11px">
          <div></div>
          ${confLevels.map(c => `<div style="text-align:center;color:var(--fg-tertiary);font-weight:600;text-transform:uppercase">${c}</div>`).join('')}
          ${genres.map(g => `
            <div style="color:var(--fg-secondary);padding:4px 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(g)}</div>
            ${confLevels.map(c => {
              const cell = grid.find(x => x.genre === g && x.conf === c);
              const n = cell?.n ?? 0;
              const bg = n ? colorByGenre[g] : 'transparent';
              const op = n ? (0.15 + (n / maxN) * 0.85).toFixed(2) : 0;
              return `<div style="display:flex;align-items:center;justify-content:center;height:28px;border-radius:3px;background:${bg};opacity:${op};color:${n > 0 ? 'var(--fg-primary)' : 'var(--fg-quaternary)'};font-weight:600">${n || '·'}</div>`;
            }).join('')}
          `).join('')}
        </div>
      </div>
      <div style="font-size:11px;color:var(--fg-tertiary);max-width:200px">
        Each cell shows how many titles of that genre carry that confidence. Opacity scales with count.
        Titles with no genre assignment are omitted.
      </div>
    </div>
  `);
}

/* ---- chart drawing ------------------------------------------------------- */
async function drawDonutChart(id, items, palette) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = 160 * dpr; canvas.height = 160 * dpr;
  canvas.style.width = '160px'; canvas.style.height = '160px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const total = items.reduce((s, x) => s + x.count, 0);
  if (!total) return;

  const cx = 80, cy = 80, R = 64, r = 40;
  let angle = -Math.PI / 2;
  items.forEach((it, i) => {
    const slice = (it.count / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    ctx.arc(cx, cy, R, angle, angle + slice);
    ctx.arc(cx, cy, r, angle + slice, angle, true);
    ctx.closePath();
    ctx.fillStyle = palette[i % palette.length];
    ctx.fill();
    angle += slice;
  });
  // center text
  ctx.fillStyle = TK.fg.primary;
  ctx.font = 'bold 22px var(--font-sans, sans-serif)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(total, cx, cy - 6);
  ctx.fillStyle = TK.fg.tertiary;
  ctx.font = '10px var(--font-sans, sans-serif)';
  ctx.fillText('titles', cx, cy + 12);
}

async function drawBarChart(id, items, colors) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const wrap = canvas.parentElement;
  const w = wrap.clientWidth;
  const h = 260;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const pad = { top: 10, right: 50, bottom: 80, left: 10 };
  const chartW = w - pad.left - pad.right;
  const max = Math.max(...items.map(x => x.count), 1);
  const maxBars = 10;
  const visible = items.slice(0, maxBars);
  const barH = Math.max(16, Math.min(32, (h - pad.top - pad.bottom) / visible.length - 6));

  visible.forEach((it, i) => {
    const y = pad.top + i * (barH + 6);
    const bw = (it.count / max) * chartW;
    const x = pad.left;

    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.roundRect(x, y, bw, barH, 3);
    ctx.fill();

    ctx.fillStyle = TK.fg.tertiary;
    ctx.font = '11px var(--font-sans, sans-serif)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(truncate(it.label, 14), x, y + barH + 4);

    ctx.fillStyle = TK.fg.primary;
    ctx.font = 'bold 11px var(--font-sans, sans-serif)';
    ctx.textAlign = 'right';
    ctx.fillText(it.count, w - pad.right + 40, y + barH / 2 - 6);
  });
}

async function drawScatter(id, items) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const wrap = canvas.parentElement;
  const w = wrap.clientWidth;
  const h = 320;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const pad = { top: 10, right: 20, bottom: 40, left: 48 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  const prices = items.map(x => x.price ?? 0).filter(p => p > 0);
  const playtimes = items.map(x => x.playtime ?? 0).filter(t => t > 0);
  const maxPrice = Math.max(...prices, 1);
  const maxPlay = Math.max(...playtimes, 1);

  // grid lines
  ctx.strokeStyle = TK.subtle;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH / 4) * i;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
  }

  // axis labels
  ctx.fillStyle = TK.fg.tertiary;
  ctx.font = '10px var(--font-sans, sans-serif)';
  ctx.textAlign = 'center';
  ctx.fillText(`Playtime (hours) → max ${Math.round(maxPlay)}`, pad.left + chartW / 2, h - 4);
  ctx.save();
  ctx.translate(10, pad.top + chartH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`Price (${items[0]?.currency || 'USD'}) → max ${Math.round(maxPrice)}`, 0, 0);
  ctx.restore();

  // zero-line at y=playtime=0
  const zeroY = pad.top + chartH;
  ctx.strokeStyle = TK.fg.quat;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(pad.left, zeroY); ctx.lineTo(w - pad.right, zeroY); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = TK.fg.quat;
  ctx.font = '10px var(--font-sans, sans-serif)';
  ctx.textAlign = 'left';
  ctx.fillText('0h', pad.left - 2, zeroY + 4);

  // points
  items.forEach(it => {
    if (it.price == null) return;
    const px = pad.left + (it.price / maxPrice) * chartW;
    const py = pad.top + chartH - ((it.playtime ?? 0) / maxPlay) * chartH;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(17, 94, 163, 0.7)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

async function drawTimeline(id, items) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const wrap = canvas.parentElement;
  const w = wrap.clientWidth;
  const h = 200;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const pad = { top: 10, right: 20, bottom: 30, left: 48 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  if (items.length === 0) {
    ctx.fillStyle = TK.fg.tertiary;
    ctx.font = '12px var(--font-sans, sans-serif)';
    ctx.textAlign = 'center';
    ctx.fillText('No dated acquisitions', w / 2, h / 2);
    return;
  }

  const maxCount = Math.max(...items.map(x => x.count), 1);
  const minDate = new Date(items[0].label);
  const maxDate = new Date(items[items.length - 1].label);
  const dateRange = maxDate - minDate || 1;

  // area fill
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top + chartH);
  items.forEach((it, i) => {
    const x = pad.left + ((new Date(it.label) - minDate) / dateRange) * chartW;
    const y = pad.top + chartH - (it.count / maxCount) * chartH;
    ctx.lineTo(x, y);
  });
  ctx.lineTo(pad.left + chartW, pad.top + chartH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(17, 94, 163, 0.1)';
  ctx.fill();

  // line
  ctx.beginPath();
  items.forEach((it, i) => {
    const x = pad.left + ((new Date(it.label) - minDate) / dateRange) * chartW;
    const y = pad.top + chartH - (it.count / maxCount) * chartH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = TK.brand;
  ctx.lineWidth = 2;
  ctx.stroke();

  // x-axis labels
  ctx.fillStyle = TK.fg.tertiary;
  ctx.font = '10px var(--font-sans, sans-serif)';
  ctx.textAlign = 'center';
  [0, 0.25, 0.5, 0.75, 1].forEach(t => {
    const x = pad.left + chartW * t;
    const d = new Date(minDate.getTime() + dateRange * t);
    ctx.fillText(formatDateShort(d), x, h - 6);
  });
}

async function drawHeatmap(id, games) { /* static HTML grid — no canvas needed */ }

/* ---- utilities ----------------------------------------------------------- */
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function truncate(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s; }
function sanitize(s) { return s.toLowerCase().replace(/[^a-z0-9]/g, ''); }
function formatDateShort(d) {
  if (!(d instanceof Date) || isNaN(d)) return '';
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}
