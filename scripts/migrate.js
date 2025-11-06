#!/usr/bin/env node
import path from 'path';
import { fileURLToPath } from 'url';
import { Umzug, SequelizeStorage } from 'umzug';
import sequelize from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const umzug = new Umzug({
  migrations: { glob: path.join(__dirname, '..', 'migrations', '*.js') },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize, tableName: 'umzug_migrations' }),
  logger: console,
});

async function run() {
  const cmd = process.argv[2] || 'up';
  try {
    if (cmd === 'up') {
      const migrations = await umzug.up();
      console.log('Migrations applied:', migrations.map(m => m.name));
      process.exit(0);
    } else if (cmd === 'down') {
      const name = process.argv[3];
      if (name) {
        await umzug.down({ to: name });
        console.log(`Rolled back to ${name}`);
      } else {
        const migrations = await umzug.down({ to: 0 });
        console.log('Rolled back migrations:', migrations.map(m => m.name));
      }
      process.exit(0);
    } else if (cmd === 'status') {
      const executed = await umzug.executed();
      const pending = await umzug.pending();
      console.log('Executed migrations:');
      executed.forEach(m => console.log('  ', m.name));
      console.log('Pending migrations:');
      pending.forEach(m => console.log('  ', m.name));
      process.exit(0);
    } else {
      console.error('Unknown command. Use up|down|status');
      process.exit(1);
    }
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

run();
