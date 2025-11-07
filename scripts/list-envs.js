#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const cwd = process.cwd();
const files = fs.readdirSync(cwd).filter(f => f.startsWith('.env'));

if (files.length === 0) {
  console.log('No .env.* files found in project root');
  process.exit(0);
}

console.log('Found environment files:');
files.forEach(f => {
  try {
    const stat = fs.statSync(path.join(cwd, f));
    console.log(`- ${f} (${stat.size} bytes)`);
  } catch (err) {
    console.log(`- ${f}`);
  }
});

console.log('\nTip: use `node scripts/validate-env.js .env.<env>` to validate a specific file');
