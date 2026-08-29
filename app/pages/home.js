/* ==========================================================================
   Home Page - Phase 4 implementation
   Hero cards (total games, estimated value, recently added, highest rated)
   + widgets for timeline, genre/platform/rating distribution, collection health
   ========================================================================== */

import { getGames } from '../services/loader.js';
import { computeAll } from '../services/analytics.js';

export async function renderHome() {
  const content = document.getElementById('content');
  const games = getGames();
  const analytics = computeAll(games, 'Current');

  content.innerHTML = `
    <div class="home-page">
      <section class="hero-cards">
        ${renderHeroCard('Total Games', analytics.overview.totalGames, '🎮', 'primary')}
        ${renderHeroCard('Library Value', formatCurrency(analytics.value.totalCurrentValue, analytics.value.currency), '💎', 'accent')}
        ${renderHeroCard('Recently Added', analytics.acquisitionTimeline.lastAcquisition || 'N/A', '📅', 'info')}
        ${renderHeroCard('Avg. Rating', formatRating(analytics.ratings.metacritic.average), '⭐', 'ok')}
      </section>

      <section class="widgets">
        <div class="widget glass-panel">
          <h3>Collection Breakdown</h3>
          ${renderPieData(analytics.classifications.distribution)}
        </div>

        <div class="widget glass-panel">
          <h3>Top Genres</h3>
          ${renderBarData(analytics.genres.distribution.slice(0, 8))}
        </div>

        <div class="widget glass-panel">
          <h3>Release Timeline</h3>
          ${renderTimelineData(analytics.releaseTimeline.byDecade)}
        </div>

        <div class="widget glass-panel">
          <h3>Collection Health</h3>
          <div class="health-score">
            <div class="score-circle">${Math.round(analytics.health.metadataCompletenessPercent)}%</div>
            <p class="text-muted">Metadata Completeness</p>
          </div>
          <div class="health-stats">
            <div class="stat">
              <span class="stat-label">High Confidence</span>
              <span class="stat-value">${analytics.overview.confidence.high}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Needs Review</span>
              <span class="stat-value text-warn">${analytics.health.needsManualVerification}</span>
            </div>
          </div>
        </div>

        <div class="widget glass-panel">
          <h3>Value Analysis</h3>
          <div class="value-stats">
            <div class="stat-row">
              <span>Current Value</span>
              <span class="text-gradient">${formatCurrency(analytics.value.totalCurrentValue, analytics.value.currency)}</span>
            </div>
            <div class="stat-row">
              <span>MSRP Total</span>
              <span>${formatCurrency(analytics.overview.msrp.total, analytics.value.currency)}</span>
            </div>
            <div class="stat-row text-faint">
              <span>Amount Paid</span>
              <span>${formatCurrency(analytics.value.totalAmountPaid, analytics.value.currency)}</span>
            </div>
            <div class="stat-row">
              <span>Savings</span>
              <span class="text-ok">${formatCurrency(analytics.value.savingsVsCurrentValue, analytics.value.currency)}</span>
            </div>
          </div>
        </div>

        <div class="widget glass-panel">
          <h3>Playtime</h3>
          <div class="playtime-stats">
            <div class="stat-big">
              <span class="value">${Math.round(analytics.completion.totalHours)}</span>
              <span class="label">Hours Played</span>
            </div>
            <div class="stat-row">
              <span>Games Played</span>
              <span>${analytics.completion.playedCount} / ${analytics.overview.totalGames}</span>
            </div>
            <div class="stat-row">
              <span>Backlog</span>
              <span>${analytics.completion.neverPlayedCount} (${Math.round(analytics.completion.backlogPercent)}%)</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderHeroCard(title, value, icon, color) {
  return `
    <div class="hero-card glass-panel card-${color}">
      <div class="hero-icon">${icon}</div>
      <div class="hero-content">
        <h3 class="hero-title">${title}</h3>
        <div class="hero-value">${value}</div>
      </div>
    </div>
  `;
}

function renderPieData(distribution) {
  const total = distribution.reduce((s, d) => s + d.count, 0);
  return `
    <ul class="data-list">
      ${distribution.map(d => `
        <li>
          <span>${d.label}</span>
          <span class="text-secondary">${d.count} (${Math.round(d.count / total * 100)}%)</span>
        </li>
      `).join('')}
    </ul>
  `;
}

function renderBarData(distribution) {
  const max = distribution[0]?.count || 1;
  return `
    <ul class="bar-chart">
      ${distribution.map(d => `
        <li class="bar-item">
          <span class="bar-label">${d.label}</span>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${d.count / max * 100}%"></div>
          </div>
          <span class="bar-value">${d.count}</span>
        </li>
      `).join('')}
    </ul>
  `;
}

function renderTimelineData(distribution) {
  return `
    <ul class="data-list">
      ${distribution.map(d => `
        <li>
          <span>${d.label}</span>
          <span class="text-secondary">${d.count}</span>
        </li>
      `).join('')}
    </ul>
  `;
}

function formatCurrency(value, currency) {
  if (value == null) return 'N/A';
  const symbol = currency === 'INR' ? '₹' : (currency === 'USD' ? '$' : currency);
  return `${symbol}${Math.round(value).toLocaleString()}`;
}

function formatRating(value) {
  return value != null ? Math.round(value) : 'N/A';
}
