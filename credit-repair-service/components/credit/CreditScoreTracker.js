/**
 * Credit Score Tracker Component
 * Visual display of credit score progress and trends
 */

class CreditScoreTracker {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      showHistory: options.showHistory !== false,
      showGoal: options.showGoal !== false,
      userTier: options.userTier || 'FREE',
      ...options
    };
    
    this.data = null;
    this.init();
  }

  async init() {
    if (!this.container) return;
    await this.loadData();
    this.render();
  }

  async loadData() {
    try {
      const response = await fetch('/api/credit-repair/progress');
      const result = await response.json();
      this.data = result.data;
    } catch (error) {
      console.error('Error loading credit data:', error);
      this.data = { current: 0, history: [], improvement: 0 };
    }
  }

  render() {
    if (!this.data) return;

    const { current, improvement, goal, estimatedTimeToGoal } = this.data;
    
    this.container.innerHTML = `
      <div class="credit-tracker-component">
        <div class="tracker-header">
          <h2>Your Credit Score</h2>
        </div>

        <div class="score-display-large">
          <div class="score-circle ${this.getScoreClass(current)}">
            <div class="score-number">${current}</div>
            <div class="score-label">Current Score</div>
          </div>
          
          <div class="score-details">
            <div class="score-change ${improvement >= 0 ? 'positive' : 'negative'}">
              ${improvement >= 0 ? '↑' : '↓'} ${Math.abs(improvement)} points
              <span class="change-label">Overall Improvement</span>
            </div>
            
            ${this.options.showGoal && goal ? `
              <div class="score-goal">
                <strong>Goal: ${goal}</strong>
                <p>Estimated: ${estimatedTimeToGoal}</p>
              </div>
            ` : ''}
          </div>
        </div>

        ${this.options.showHistory ? this.renderHistory() : ''}

        <div class="quick-actions">
          <h3>Improve Your Score</h3>
          <div class="action-buttons">
            <button class="btn btn-primary btn-sm" onclick="window.location.href='/services/credit-repair'">
              Start Dispute
            </button>
            <button class="btn btn-outline btn-sm" onclick="window.location.href='/credit-tips'">
              View Tips
            </button>
            <button class="btn btn-outline btn-sm" onclick="window.location.href='/reports'">
              View Reports
            </button>
          </div>
        </div>

        ${this.options.userTier === 'FREE' ? this.renderUpgradePrompt() : ''}
      </div>
    `;
  }

  renderHistory() {
    if (!this.data.history || this.data.history.length === 0) {
      return '<p class="no-history">No history data available yet</p>';
    }

    const maxScore = Math.max(...this.data.history.map(h => h.score));
    const minScore = Math.min(...this.data.history.map(h => h.score));
    const range = maxScore - minScore || 100;

    return `
      <div class="score-history">
        <h3>Score History</h3>
        <div class="history-chart">
          ${this.data.history.map((point, index) => {
            const height = ((point.score - minScore) / range) * 100;
            return `
              <div class="history-point" style="height: ${height}%">
                <div class="point-marker" data-score="${point.score}"></div>
                <div class="point-label">${this.formatDate(point.date)}</div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="history-legend">
          <span>Score Range: ${minScore} - ${maxScore}</span>
        </div>
      </div>
    `;
  }

  renderUpgradePrompt() {
    return `
      <div class="upgrade-prompt">
        <p>📊 Upgrade to Professional or Elite for all 3 bureau monitoring!</p>
        <a href="/pricing" class="btn btn-primary btn-sm">View Plans</a>
      </div>
    `;
  }

  getScoreClass(score) {
    if (score >= 750) return 'excellent';
    if (score >= 700) return 'good';
    if (score >= 650) return 'fair';
    if (score >= 600) return 'poor';
    return 'very-poor';
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  async refresh() {
    await this.loadData();
    this.render();
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CreditScoreTracker;
}
