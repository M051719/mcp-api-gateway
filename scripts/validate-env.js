#!/usr/bin/env node
import { validateEnv } from '../config/validateEnv.js';
import path from 'path';

const args = process.argv.slice(2);
const envFile = args[0] || '.env';

try {
  console.log(`🔍 Validating environment file: ${envFile}`);
  validateEnv(envFile);
  console.log('✅ Validation succeeded');
  process.exit(0);
} catch (err) {
  console.error('❌ Validation failed');
  process.exit(2);
}
