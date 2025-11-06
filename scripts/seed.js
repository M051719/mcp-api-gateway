#!/usr/bin/env node
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize, { initializeDatabase } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const env = process.argv[2] || process.env.SEED_ENV || process.env.NODE_ENV || 'development';
  const seedPath = path.join(__dirname, '..', 'seeds', `${env}.js`);
  try {
    const ok = await initializeDatabase();
    if (!ok) {
      console.error('Cannot connect to database, aborting seeds.');
      process.exit(1);
    }

    const mod = await import(seedPath);
    if (!mod || typeof mod.up !== 'function') {
      console.error('Seed file does not export an up function:', seedPath);
      process.exit(1);
    }

    console.log(`Running seeds for environment: ${env}`);
    await mod.up({ sequelize });
    console.log('Seeds completed.');
    process.exit(0);
  } catch (err) {
    console.error('Seed runner error:', err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('seed.js')) {
  run();
}
