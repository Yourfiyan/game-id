/* ==========================================================================
   Game ID — Home Page
   ========================================================================== */

import { getGames, getCurrentAccount, getAccounts } from '../services/loader.js';
import { overview, genreDistribution, storeDistribution, acquisitionTimeline, completionAnalysis, collectionHealth } from '../services/analytics.js';
import { formatPrice } from './library.js';

const UNKNOWN = '<span style="color:var(--fg-quaternary);font-style:italic">Needs Manual Verification</span>';

function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

export async function renderHome() {
  const games = getGames();
  if (!games.length) {
    document.getElementById('content').innerHTML =
      '<div class="page loading"><div class="spinner"></div>Loading…</div>';
    return;
  }

  const acct = getCurrentAccount();
  const ov = overview(games);
  const genres = genreDistribution(games);
  const stores = storeDistribution(games);
  const timeline = acquisitionTimeline(games);
  const comp = completionAnalysis(games);
  const health = collectionHealth(games);

  const priceSym = games[0]?.currency === 'USD' ? '$' : '₹';

  document.getElementById('content').innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Account ${esc(acct)} · ${ov.totalEntitlements} entitlements · ${ov.byClassification.game ?? 0} games</p>
      </div>

      ${renderKpis(ov, priceSym, comp, health)}

      <div class="widget-grid">
        ${renderTopGenres(genres)}
        ${renderPlaytime(comp)}
        ${renderValue(ov, priceSym)}
        ${renderConfidence(ov)}
        ${renderHealth(health)}
        ${renderAcquisitions(timeline)}
      </div>
    </div>
  `;
}

function kpiIcon(icon, cls) {
  return `<div class="kpi-icon ${cls}">${icon}</div>`;
}

function renderKpis(ov, sym, comp, health) {
  const cardBg = 'var(--bg-layer)';
  const val = ov.estimatedLibraryValue;
  const fmt = val != null ? `${sym}${Math.round(val).toLocaleString()}` : '—';

  return `
    <div class="kpi-grid">
      <div class="kpi-card">
        ${kpiIcon('🎮', 'brand')}
        <div class="kpi-body">
          <div class="kpi-label">Games</div>
          <div class="kpi-value">${ov.totalGames}</div>
          <div class="kpi-sub">${ov.freeGames} free · ${ov.paidGames} priced</div>
        </div>
      </div>
      <div class="kpi-card">
        ${kpiIcon('💰', 'success')}
        <div class="kpi-body">
          <div class="kpi-label">Store value</div>
          <div class="kpi-value">${fmt}</div>
          <div class="kpi-sub">${ov.valueCoverage.known}/${ov.totalGames} known</div>
        </div>
      </div>
      <div class="kpi-card">
        ${kpiIcon('✅', 'success')}
        <div class="kpi-body">
          <div class="kpi-label">Confidence</div>
          <div class="kpi-value">${ov.confidence.high + ov.confidence.medium}</div>
          <div class="kpi-sub">${ov.confidence.high} high · ${ov.confidence.medium} medium · ${ov.confidence.low} low</div>
        </div>
      </div>
      <div class="kpi-card">
        ${kpiIcon('⏱', 'info')}
        <div class="kpi-body">
          <div class="kpi-label">Played</div>
          <div class="kpi-value">${comp.playedCount}</div>
          <div class="kpi-sub">${comp.backlogPercent != null ? `${Math.round(comp.backlogPercent)}% backlog` : ''}</div>
        </div>
      </div>
      <div class="kpi-card">
        ${kpiIcon('📊', 'caution')}
        <div class="kpi-body">
          <div class="kpi-label">Enriched</div>
          <div class="kpi-value">${Math.round(health.metadataCompletenessPercent)}%</div>
          <div class="kpi-sub">${ov.metadataCoverage.developer}/${ov.totalGames} with developer</div>
        </div>
      </div>
    </div>
  `;
}

function renderTopGenres(genres) {
  const top = genres.distribution.slice(0, 8);
  const max = top[0]?.count ?? 1;
  return `
    <div class="widget">
      <div class="widget-title">Top genres</div>
      ${top.length ? `
        <div class="distribution-list">
          ${top.map(g => {
            const pct = (g.count / max * 100).toFixed(0);
            return `
              <div class="distribution-item">
                <span class="distribution-label" title="${esc(g.label)}">${esc(g.label)}</span>
                <div class="distribution-bar-track"><div class="distribution-bar-fill" style="width:${pct}%"></div></div>
                <span class="distribution-pct">${g.count}</span>
              </div>`;
          }).join('')}
        </div>
      ` : '<p class="text-muted" style="font-size:13px">No genre data.</p>'}
    </div>
  `;
}

function renderPlaytime(comp) {
  const h = Math.floor(comp.totalHours);
  const m = Math.round((comp.totalHours - h) * 60);
  return `
    <div class="widget">
      <div class="widget-title">Playtime</div>
      <div class="playtime-hero">
        <div class="playtime-number">${h}<span class="playtime-unit">h ${m}m</span></div>
      </div>
      <div class="data-list">
        <li><span>Played</span><span>${comp.playedCount}</span></li>
        <li><span>Never played</span><span>${comp.neverPlayedCount}</span></li>
        <li><span>Avg (played titles)</span><span>${comp.averageHoursAcrossPlayed != null ? `${comp.averageHoursAcrossPlayed.toFixed(1)}h` : '—'}</span></li>
        ${comp.longest ? `<li><span>Most played</span><span style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(comp.longest.title)}">${esc(comp.longest.title)}</span></li>` : ''}
      </div>
    </div>
  `;
}

function renderValue(ov, sym) {
  const total = ov.estimatedLibraryValue;
  const fmt = total != null ? `${sym}${Math.round(total).toLocaleString()}` : '—';
  return `
    <div class="widget">
      <div class="widget-title">Library value</div>
      <div class="data-list">
        <li><span>Current store value</span><span class="text-brand">${fmt}</span></li>
        <li><span>MSRP total</span><span>${ov.msrp.total != null ? `${sym}${Math.round(ov.msrp.total).toLocaleString()}` : '—'}</span></li>
        <li><span>MSRP median</span><span>${ov.msrp.median != null ? `${sym}${Math.round(ov.msrp.median).toLocaleString()}` : '—'}</span></li>
        <li><span>Value coverage</span><span>${ov.valueCoverage.known}/${ov.totalGames}</span></li>
      </div>
    </div>
  `;
}

function renderConfidence(ov) {
  const total = ov.totalEntitlements;
  return `
    <div class="widget">
      <div class="widget-title">Confidence distribution</div>
      <div class="data-list">
        <li><span>High</span><span><span class="badge badge-success">${ov.confidence.high}</span></span></li>
        <li><span>Medium</span><span><span class="badge badge-caution">${ov.confidence.medium}</span></span></li>
        <li><span>Low</span><span><span class="badge badge-danger">${ov.confidence.low}</span></span></li>
      </div>
    </div>
  `;
}

function renderHealth(health) {
  const pct = health.metadataCompletenessPercent.toFixed(0);
  return `
    <div class="widget">
      <div class="widget-title">Collection health</div>
      <div class="health-score-wrap">
        <div class="health-ring" style="--health-pct:${pct}%">
          <div class="health-ring-inner">
            <div class="health-ring-value">${pct}%</div>
            <div class="health-ring-label">Complete</div>
          </div>
        </div>
        <div class="health-stats">
          <div class="health-stat"><span class="health-stat-label">Developer</span><span class="health-stat-value">${health.fieldCoverage.developer}/${health.fieldCoverage.total}</span></div>
          <div class="health-stat"><span class="health-stat-label">Publisher</span><span class="health-stat-value">${health.fieldCoverage.publisher}/${health.fieldCoverage.total}</span></div>
          <div class="health-stat"><span class="health-stat-label">Release date</span><span class="health-stat-value">${health.fieldCoverage.releaseDate}/${health.fieldCoverage.total}</span></div>
          <div class="health-stat"><span class="health-stat-label">Any rating</span><span class="health-stat-value">${health.fieldCoverage.anyRating}/${health.fieldCoverage.total}</span></div>
        </div>
      </div>
    </div>
  `;
}

function renderAcquisitions(timeline) {
  const months = timeline.byMonth.slice(-12);
  if (!months.length) return `<div class="widget"><div class="widget-title">Acquisitions</div><p class="text-muted" style="font-size:13px">No dated acquisitions.</p></div>`;

  const max = Math.max(...months.map(m => m.count));
  const bars = months.map(m => {
    const h = (m.count / max * 100).toFixed(0);
    const label = m.label.slice(2); // strip "20"
    return `<div class="timeline-bar-wrap">
      <div class="timeline-bar" style="height:${h}%"></div>
      <span class="timeline-year">${label}</span>
    </div>`;
  }).join('');

  return `
    <div class="widget">
      <div class="widget-title">Acquisitions — last 12 months</div>
      <div class="timeline-chart">${bars}</div>
      ${timeline.firstAcquisition ? `<div class="text-muted" style="font-size:11px;margin-top:8px">First: ${timeline.firstAcquisition} · Last: ${timeline.lastAcquisition}</div>` : ''}
    </div>
  `;
}
