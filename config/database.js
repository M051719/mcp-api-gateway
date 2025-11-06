import { Sequelize } from 'sequelize';

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/postgres';

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 20,
    min: 0,
    acquire: 60000,
    idle: 10000
  },
  dialectOptions: {
    statement_timeout: 60000
  }
});

export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Initialize Supabase specific schemas and extensions if needed
    await sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
    `);
    
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
}

export default sequelize;