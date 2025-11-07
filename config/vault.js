// Extended HashiCorp Vault helper module (ESM)
// Supports token, AppRole and Kubernetes auth, plus masked value logging and metrics

import { URL } from 'url';
import maskdata from 'maskdata';
import fs from 'fs/promises';

const maskConfig = {
  // mask all but first/last 4 chars of connection strings/keys
  maskWith: '*',
  unmaskedStartCharacters: 4,
  unmaskedEndCharacters: 4,
  maskAtTheRate: false
};

// Track secret access patterns
const metrics = {
  accessCount: new Map(), // path -> count
  lastAccess: new Map(),  // path -> timestamp
  authMethods: {
    token: 0,
    approle: 0,
    kubernetes: 0
  },
  errors: []
};

class VaultClient {
  constructor(config = {}) {
    this.addr = config.addr || process.env.VAULT_ADDR;
    if (!this.addr) throw new Error('VAULT_ADDR must be set');

    // Auth configuration
    this.token = config.token || process.env.VAULT_TOKEN;
    this.roleId = config.roleId || process.env.VAULT_ROLE_ID;
    this.secretId = config.secretId || process.env.VAULT_SECRET_ID;
    this.k8sRole = config.k8sRole || process.env.VAULT_K8S_ROLE;
    this.k8sTokenPath = config.k8sTokenPath || '/var/run/secrets/kubernetes.io/serviceaccount/token';

    // Auth endpoints
    this.approleLoginPath = '/v1/auth/approle/login';
    this.k8sLoginPath = '/v1/auth/kubernetes/login';
    
    // Optional features
    this.logMasked = config.logMasked || process.env.VAULT_LOG_MASKED === 'true';
    this.trackMetrics = config.trackMetrics || process.env.VAULT_TRACK_METRICS === 'true';
  }

  async getToken() {
    // Return existing token if available
    if (this.token) {
      if (this.trackMetrics) metrics.authMethods.token++;
      return this.token;
    }

    // Try AppRole auth if credentials available
    if (this.roleId && this.secretId) {
      if (this.trackMetrics) metrics.authMethods.approle++;
      return this.loginWithAppRole();
    }

    // Try Kubernetes auth if in cluster
    if (this.k8sRole) {
      if (this.trackMetrics) metrics.authMethods.kubernetes++;
      return this.loginWithKubernetes();
    }

    throw new Error('No valid auth method configured');
  }

  async loginWithAppRole() {
    const loginUrl = new URL(this.approleLoginPath, this.addr).toString();
    const res = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role_id: this.roleId,
        secret_id: this.secretId
      })
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Vault AppRole login failed ${res.status}: ${body}`);
    }

    const json = await res.json();
    this.token = json.auth?.client_token;
    if (!this.token) throw new Error('No client_token in Vault login response');
    return this.token;
  }

  async loginWithKubernetes() {
    try {
      const jwt = await fs.readFile(this.k8sTokenPath, 'utf8');
      const loginUrl = new URL(this.k8sLoginPath, this.addr).toString();
      
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: this.k8sRole,
          jwt: jwt
        })
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Vault Kubernetes login failed ${res.status}: ${body}`);
      }

      const json = await res.json();
      this.token = json.auth?.client_token;
      if (!this.token) throw new Error('No client_token in Vault login response');
      return this.token;
    } catch (err) {
      throw new Error(`Kubernetes auth failed: ${err.message}`);
    }
  }

  async getSecret(kvPath, key = 'value') {
    const token = await this.getToken();
    const url = new URL(kvPath, this.addr).toString();

    // Track metrics before request
    if (this.trackMetrics) {
      metrics.accessCount.set(kvPath, (metrics.accessCount.get(kvPath) || 0) + 1);
      metrics.lastAccess.set(kvPath, new Date().toISOString());
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Vault-Token': token,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      const body = await res.text();
      const error = `Vault error ${res.status}: ${body}`;
      if (this.trackMetrics) {
        metrics.errors.push({
          timestamp: new Date().toISOString(),
          path: kvPath,
          error
        });
      }
      throw new Error(error);
    }

    const json = await res.json();
    let value;

    // Support both KV v1 and v2 shapes
    if (json.data && json.data.data && key in json.data.data) {
      value = json.data.data[key];
    } else if (json.data && key in json.data) {
      value = json.data[key];
    } else {
      throw new Error(`Secret key "${key}" not found in Vault response`);
    }

    if (this.logMasked && value) {
      const masked = maskdata.maskString(value, maskConfig);
      console.log(`[Vault] Loaded ${kvPath}:${key} = ${masked}`);
    }

    return value;
  }

  // Load multiple secrets at once, with logging
  async loadSecrets(mapping) {
    const results = {};
    let errors = [];

    for (const [envVar, vaultSpec] of Object.entries(mapping)) {
      try {
        let path = vaultSpec;
        let key = 'value';
        if (vaultSpec.includes(':')) {
          const idx = vaultSpec.lastIndexOf(':');
          path = vaultSpec.substring(0, idx);
          key = vaultSpec.substring(idx + 1);
        }

        const value = await this.getSecret(path, key);
        if (value != null) {
          results[envVar] = value;
        }
      } catch (err) {
        errors.push(`Failed to load ${envVar} from ${vaultSpec}: ${err.message}`);
      }
    }

    if (errors.length > 0) {
      const err = new Error('One or more secrets failed to load');
      err.errors = errors;
      throw err;
    }

    return results;
  }
}

// Static metrics methods
VaultClient.getMetrics = () => {
  if (!metrics) return null;
  
  return {
    accessPatterns: Object.fromEntries(metrics.accessCount.entries()),
    lastAccess: Object.fromEntries(metrics.lastAccess.entries()),
    authMethodUsage: metrics.authMethods,
    recentErrors: metrics.errors.slice(-10), // Last 10 errors
    totalRequests: Array.from(metrics.accessCount.values()).reduce((a, b) => a + b, 0)
  };
};

VaultClient.resetMetrics = () => {
  metrics.accessCount.clear();
  metrics.lastAccess.clear();
  metrics.authMethods = { token: 0, approle: 0, kubernetes: 0 };
  metrics.errors = [];
};

export { VaultClient };
