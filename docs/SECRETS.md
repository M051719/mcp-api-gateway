Secrets & Secure Deployment

This document explains recommended approaches and quick helper scripts for managing secrets for the `mcp-api-gateway` project.

Options covered:
- Docker Swarm secrets (simple, works with `compose.prod.yml`/`docker stack`)
- GitHub Actions deployment using SSH (example workflow present in `.github/workflows/docker-secrets-deploy.yml`)
- SOPS-based encrypted env files (for checked-in encrypted configs)
- Local OpenSSL helper scripts for encrypt/decrypt
- HashiCorp Vault integration (example module in `config/vault.js`)

Important: Never commit plaintext secrets to git. Keep `.env.*` files in `.gitignore` and use one of the secure methods below.

Docker Swarm (recommended short-term)
------------------------------------
- Use Docker secrets for production: they are mounted in `/run/secrets/<name>` inside containers and not visible in process env.
- Your `compose.prod.yml` references secrets; create them on the target Swarm manager before deploying (the GitHub workflow shows an example).

GitHub Actions deploy (example)
--------------------------------
- The workflow at `.github/workflows/docker-secrets-deploy.yml` shows a practical pattern:
  - Use an SSH action to copy the compose file to the remote manager
  - Create docker secrets on the remote host using values stored in GitHub Secrets
  - Deploy the stack with `docker stack deploy` on the remote host

SOPS (encrypted files in git)
----------------------------
- Use `sops` to encrypt `.env.production` (or other configuration files) with a KMS key (AWS KMS, GCP KMS, Azure KeyVault).
- Store the encrypted file (e.g. `.env.production.enc`) in the repo and decrypt during deployment.

Example usage:
```bash
# encrypt
sops --encrypt --kms "arn:aws:kms:us-east-1:123456:key/your-key" .env.production > .env.production.enc

# decrypt locally
sops --decrypt .env.production.enc > .env.production
```

SOPS helper scripts are provided in `scripts/sops-encrypt.sh` and `scripts/sops-decrypt.sh` (templates).

OpenSSL local helper (quick local encryption)
---------------------------------------------
- Use OpenSSL to symmetrically encrypt files if you need a lightweight local approach.
- Example PowerShell scripts are in `scripts/openssl-encrypt.ps1` and `scripts/openssl-decrypt.ps1`.

HashiCorp Vault (recommended for teams)
---------------------------------------
- Vault offers dynamic secrets, leasing, rotation, and strict ACLs.
- For a production-grade setup, run Vault (HA), configure auth methods (AppRole, Kubernetes auth, AWS IAM), and grant your services access to secrets at runtime.
- A minimal Vault fetcher module is included at `config/vault.js` as an example; adapt it to your chosen auth method.

Next steps
----------
- Choose a primary secrets strategy (Docker secrets for immediate deploys; Vault or managed secret manager for long-term).
- Add required secrets to your CI/CD provider (GitHub Actions Secrets) and tweak the workflow variables.
- If you want, I can implement one of the following now:
  - `docker-secrets-ci` (create a GitHub Actions workflow and test it)
  - `sops-flow` (add SOPS sample and scripts + README integration)
  - `openssl-local-scripts` (add PS scripts and Node wrappers)
  - `vault-integration` (wire a small Vault client module and example in startup)

