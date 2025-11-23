/**
 * Pricing Card Component
 * Reusable component for displaying membership tier pricing
 */

class PricingCard {
  constructor(tierData, options = {}) {
    this.tierData = tierData;
    this.options = {
      showAnnual: options.showAnnual || false,
      highlightPopular: options.highlightPopular !== false,
      ctaCallback: options.ctaCallback || null,
      ...options
    };
  }

  render() {
    const { id, name, displayName, price, annualPrice, features, highlights, popular, badge } = this.tierData;
    const { showAnnual, highlightPopular } = this.options;

    const displayPrice = showAnnual && annualPrice ? annualPrice / 12 : price;
    const isPopular = popular && highlightPopular;
    
    return `
      <div class="pricing-card tier-${id} ${isPopular ? 'popular' : ''}" data-tier="${id}">
        ${isPopular ? '<div class="popular-badge">Most Popular</div>' : ''}
        ${badge ? `<div class="elite-badge">${badge}</div>` : ''}
        
        <div class="pricing-header">
          <h3>${displayName}</h3>
          <div class="price">
            <span class="currency">$</span>
            <span class="amount">${Math.floor(displayPrice)}</span>
            <span class="period">/${price === 0 ? 'forever' : 'month'}</span>
          </div>
          ${showAnnual && annualPrice ? 
            `<p class="annual-savings">Save $${((price * 12) - annualPrice).toFixed(0)}/year</p>` : 
            ''}
        </div>

        <div class="pricing-features">
          <ul>
            ${highlights.map(highlight => `<li>✓ ${highlight}</li>`).join('')}
          </ul>
        </div>

        <button class="btn btn-cta btn-block" onclick="handlePricingCTA('${id}')">
          ${this.getCtaText()}
        </button>
        
        ${price === 0 ? '<p class="no-cc">No credit card required</p>' : '<p class="money-back">30-day money-back guarantee</p>'}
      </div>
    `;
  }

  getCtaText() {
    const { id, price } = this.tierData;
    if (price === 0) return 'Get Started Free';
    if (id === 'elite') return 'Go Elite Now';
    return 'Upgrade Now';
  }
}

// Handle CTA clicks
function handlePricingCTA(tierId) {
  console.log(`CTA clicked for tier: ${tierId}`);
  window.location.href = `/signup?tier=${tierId}`;
}

// Initialize pricing cards
function initPricingCards(containerSelector, options = {}) {
  fetch('/api/membership/tiers')
    .then(response => response.json())
    .then(data => {
      const container = document.querySelector(containerSelector);
      if (!container) return;

      const tiers = ['FREE', 'PREMIUM', 'ELITE'];
      container.innerHTML = tiers.map(tier => {
        const card = new PricingCard(data.data[tier], options);
        return card.render();
      }).join('');
    })
    .catch(error => console.error('Error loading pricing cards:', error));
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PricingCard, initPricingCards };
}
