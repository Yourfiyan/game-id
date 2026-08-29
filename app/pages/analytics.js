/* ==========================================================================
   Analytics Page - Phase 3 analytics visualization (stub)

   The analytics service (`services/analytics.js`) is complete with 13 computed
   metrics. This stub page exists to satisfy the nav link and will be replaced
   with chart visualizations in the next phase.
   ========================================================================== */

import { getGames, getCurrentAccount } from '../services/loader.js';
import { computeAll } from '../services/analytics.js';

export async function renderAnalytics() {
  const content = document.getElementById('content');
  const games = getGames();
  const account = getCurrentAccount();
  const analytics = computeAll(games, account);

  content.innerHTML = `
    <div class="analytics-page glass-panel">
      <h2>Analytics — Account ${escapeHtml(account)}</h2>
      <p class="text-muted" style="margin-top: var(--sp-4);">
        Full analytics visualization (9 chart types per Phase 5) is pending.
        The underlying service is complete — see
        <code style="color: var(--accent-cool);">app/services/analytics.js</code>.
      </p>

      <details style="margin-top: var(--sp-8);">
        <summary style="cursor: pointer; color: var(--text-secondary); font-weight: 600;">
          Show computed analytics JSON
        </summary>
        <pre style="margin-top: var(--sp-4); padding: var(--sp-4); background: var(--bg-raised);
                    border-radius: var(--r-md); overflow: auto; font-size: var(--fs-xs);
                    max-height: 600px;">${escapeHtml(JSON.stringify(analytics, null, 2))}</pre>
      </details>
    </div>
  `;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
