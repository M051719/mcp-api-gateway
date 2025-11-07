# Environment Variables Documentation

## Overview
This document describes all environment variables used in the application across different environments (development, production, and test).

## Quick Start
1. Copy `.env.example` to create your environment file:
   ```bash
   cp .env.example .env.development   # For development
   cp .env.example .env.production    # For production
   cp .env.example .env.test          # For testing
   ```

2. Use the environment switcher:
   ```bash
   node scripts/switch-env.js
   ```

## Environment Variables

### Node Environment
| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| NODE_ENV | Application environment | Yes | development | production |

### Database Configuration
| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| POSTGRES_HOST | Database host | Yes | localhost | db.example.com |
| POSTGRES_PORT | Database port | Yes | 5432 | 5432 |
| POSTGRES_DB | Database name | Yes | postgres | myapp_db |
| POSTGRES_USER | Database user | Yes | postgres | myapp_user |
| POSTGRES_PASSWORD | Database password | Yes | - | secure_password |

### Supabase Configuration
| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| SUPABASE_URL | Supabase API URL | Yes | - | https://your-project.supabase.co |
| SUPABASE_ANON_KEY | Supabase anonymous key | Yes | - | your-anon-key |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key | Yes | - | your-service-key |
| SUPABASE_JWT_SECRET | JWT secret for auth | Yes | - | your-jwt-secret |
| SUPABASE_DB_URL | Direct database connection URL | Yes | - | postgresql://user:pass@host:5432/db |
| SUPABASE_STORAGE_BUCKET | Storage bucket name | No | default | my-bucket |
| SUPABASE_REALTIME_ENABLED | Enable realtime features | No | false | true |

### Expo Configuration
| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| EXPO_ACCESS_TOKEN | Expo access token | No | - | your-expo-token |
| EXPO_OWNER | Expo account owner | No | - | your-username |
| EXPO_PROJECT_ID | Expo project ID | No | - | project-id |
| EXPO_PUBLIC_API_URL | Public API URL | Yes | - | https://api.example.com |

### Cloudflare Configuration
| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| CLOUDFLARE_API_TOKEN | Cloudflare API token | No | - | your-cf-token |
| CLOUDFLARE_ZONE_ID | Cloudflare zone ID | No | - | zone-id |
| CLOUDFLARE_ACCOUNT_ID | Cloudflare account ID | No | - | account-id |
| CLOUDFLARE_WORKERS_DEV | Enable Workers dev mode | No | false | true |

### StackHawk Configuration
| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| STACKHAWK_API_KEY | StackHawk API key | No | - | hawk-api-key |
| STACKHAWK_APP_ID | StackHawk application ID | No | - | app-id |
| STACKHAWK_ENV | StackHawk environment | Yes | Development | Production |
| STACKHAWK_HOST | Application host for scanning | Yes | - | https://example.com |

### Claude/Anthropic Configuration
| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| ANTHROPIC_API_KEY | Anthropic API key | Yes | - | your-api-key |
| CLAUDE_MODEL | Claude model to use | Yes | claude-3-opus-20240229 | claude-sonnet-4-20250514 |
| CLAUDE_MAX_TOKENS | Maximum tokens per request | Yes | 1024 | 2048 |
| CLAUDE_TEMPERATURE | Model temperature | Yes | 0.7 | 0.9 |

### Security & Rate Limiting
| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| RATE_LIMIT_REQUESTS | Requests per minute | Yes | 100 | 500 |
| RATE_LIMIT_TOKENS | Tokens per minute | Yes | 50000 | 100000 |
| JWT_SECRET | JWT signing secret | Yes | - | your-secret |
| ENCRYPTION_KEY | Data encryption key | Yes | - | your-key |

## Environment-Specific Considerations

### Development Environment
- Debug logging enabled
- CORS allows localhost origins
- Detailed error messages
- Swagger UI enabled
- Test routes available

### Production Environment
- Limited logging
- Strict CORS policy
- Error details hidden
- Security headers enforced
- Rate limiting enforced

### Test Environment
- Separate database
- Mocking enabled
- Rate limiting disabled
- Full logging enabled

## Security Best Practices
1. Never commit .env files to version control
2. Use strong, unique passwords and keys
3. Rotate secrets regularly
4. Use different values for each environment
5. Restrict access to production credentials
6. Use Docker secrets in production

## Troubleshooting
If you encounter issues:
1. Validate your environment:
   ```bash
   # From project root
   npm run validate-env .env.development
   ```
2. Check logs for detailed errors
3. Ensure all required variables are set
4. Verify correct environment is active

## Environment management scripts

Available helper scripts (run from project root):

- List environment files

```bash
npm run list-envs
```

- Validate a specific environment file

```bash
# Example: validate development env
npm run validate-env -- .env.development
```

- Interactive environment switcher

```bash
# Interactive terminal script
npm run switch-env

# PowerShell wrapper (Windows)
npm run switch-env:ps -- -env production
```

Notes:
- The scripts assume you run them from the repository root.
- Install dependencies first:

```bash
npm install
```

- If you see a "module not found" error, ensure you run the command from the project directory and that dependencies are installed.

## Adding New Variables
1. Add to .env.example
2. Update validation schema in validateEnv.js
3. Update documentation
4. Notify team members

## Additional Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Cloudflare API Documentation](https://developers.cloudflare.com/api)
- [StackHawk Documentation](https://docs.stackhawk.com/)
- [Anthropic API Documentation](https://docs.anthropic.com/)

## Secrets management recommendations
See `docs/SECRETS.md` for a detailed guide and scripts for managing secrets securely (Docker secrets, SOPS, OpenSSL helpers, and Vault integration).