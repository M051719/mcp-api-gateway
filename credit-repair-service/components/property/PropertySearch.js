/**
 * Property Search Component
 * Reusable search interface for property lookups
 */

class PropertySearch {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      onSearch: options.onSearch || this.defaultSearch,
      onFilter: options.onFilter || null,
      showMap: options.showMap !== false,
      userTier: options.userTier || 'FREE',
      ...options
    };
    
    this.filters = {
      query: '',
      type: '',
      status: '',
      minPrice: '',
      maxPrice: ''
    };
    
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
    this.attachEventListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="property-search-component">
        <div class="search-header">
          <h2>Search Pre-Foreclosure Properties</h2>
          <p class="search-limit">
            ${this.getLimitText()}
          </p>
        </div>

        <div class="search-form">
          <div class="search-row">
            <input 
              type="text" 
              id="propertySearchInput"
              placeholder="Enter address, city, state, or ZIP code"
              class="search-input"
            />
            <button id="propertySearchBtn" class="btn btn-primary">
              🔍 Search
            </button>
          </div>

          <div class="filter-row">
            <select id="typeFilter" class="filter-select">
              <option value="">All Property Types</option>
              <option value="single-family">Single Family</option>
              <option value="multi-family">Multi-Family</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
            </select>

            <select id="statusFilter" class="filter-select">
              <option value="">All Statuses</option>
              <option value="pre-foreclosure">Pre-Foreclosure</option>
              <option value="auction">Auction</option>
              <option value="bank-owned">Bank Owned</option>
            </select>

            <input 
              type="number" 
              id="minPriceFilter"
              placeholder="Min Price"
              class="filter-input"
            />

            <input 
              type="number" 
              id="maxPriceFilter"
              placeholder="Max Price"
              class="filter-input"
            />

            <button id="clearFilters" class="btn btn-outline">
              Clear
            </button>
          </div>
        </div>

        <div id="searchResults" class="search-results">
          <p class="no-results">Enter a location to search for properties</p>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const searchBtn = document.getElementById('propertySearchBtn');
    const searchInput = document.getElementById('propertySearchInput');
    const clearBtn = document.getElementById('clearFilters');

    searchBtn?.addEventListener('click', () => this.performSearch());
    searchInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.performSearch();
    });

    // Filter listeners
    ['typeFilter', 'statusFilter', 'minPriceFilter', 'maxPriceFilter'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => this.updateFilters());
    });

    clearBtn?.addEventListener('click', () => this.clearFilters());
  }

  performSearch() {
    const query = document.getElementById('propertySearchInput')?.value;
    if (!query) return;

    this.filters.query = query;
    
    // Show loading state
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '<div class="loading">Searching properties...</div>';

    // Call search handler
    this.options.onSearch(this.filters)
      .then(results => this.displayResults(results))
      .catch(error => this.displayError(error));
  }

  defaultSearch(filters) {
    // Default API call
    const params = new URLSearchParams(filters);
    return fetch(`/api/property/search?${params}`)
      .then(response => response.json())
      .then(data => data.data);
  }

  displayResults(results) {
    const resultsContainer = document.getElementById('searchResults');
    
    if (!results.properties || results.properties.length === 0) {
      resultsContainer.innerHTML = '<p class="no-results">No properties found. Try adjusting your search criteria.</p>';
      return;
    }

    resultsContainer.innerHTML = `
      <div class="results-header">
        <h3>Found ${results.count} properties</h3>
        ${results.remainingSearches !== Infinity ? 
          `<p class="searches-remaining">${results.remainingSearches} searches remaining this month</p>` : 
          ''}
      </div>
      <div class="property-grid">
        ${results.properties.map(property => this.renderPropertyCard(property)).join('')}
      </div>
    `;
  }

  renderPropertyCard(property) {
    return `
      <div class="property-card" data-property-id="${property.id}">
        <div class="property-image">
          <img src="/images/property-placeholder.jpg" alt="${property.address}">
          <span class="property-badge ${property.status.toLowerCase().replace(' ', '-')}">${property.status}</span>
        </div>
        <div class="property-info">
          <h4>${property.address}</h4>
          <p class="property-location">${property.city}, ${property.state} ${property.zip}</p>
          <div class="property-details">
            ${property.bedrooms} bed • ${property.bathrooms} bath • ${property.sqft.toLocaleString()} sqft
          </div>
          <div class="property-price">
            <strong>$${property.estimatedValue.toLocaleString()}</strong>
          </div>
          <div class="property-actions">
            <button class="btn btn-primary btn-sm" onclick="viewPropertyDetails('${property.id}')">
              View Details
            </button>
            ${this.options.userTier !== 'FREE' ? `
              <button class="btn btn-outline btn-sm" onclick="analyzeProperty('${property.id}')">
                Analyze
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  displayError(error) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = `
      <div class="error-message">
        <p>Error searching properties: ${error.message}</p>
        <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
      </div>
    `;
  }

  updateFilters() {
    this.filters.type = document.getElementById('typeFilter')?.value || '';
    this.filters.status = document.getElementById('statusFilter')?.value || '';
    this.filters.minPrice = document.getElementById('minPriceFilter')?.value || '';
    this.filters.maxPrice = document.getElementById('maxPriceFilter')?.value || '';

    if (this.options.onFilter) {
      this.options.onFilter(this.filters);
    }
  }

  clearFilters() {
    this.filters = { query: this.filters.query, type: '', status: '', minPrice: '', maxPrice: '' };
    document.getElementById('typeFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('minPriceFilter').value = '';
    document.getElementById('maxPriceFilter').value = '';
  }

  getLimitText() {
    const limits = {
      'FREE': 'Free Tier: 10 searches/month',
      'PREMIUM': 'Professional: 100 searches/month',
      'ELITE': 'Elite: Unlimited searches'
    };
    return limits[this.options.userTier] || '';
  }
}

// Global helper functions
function viewPropertyDetails(propertyId) {
  window.location.href = `/property/${propertyId}`;
}

function analyzeProperty(propertyId) {
  window.location.href = `/property/${propertyId}/analyze`;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PropertySearch;
}
