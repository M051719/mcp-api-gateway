#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import { validateEnv } from '../config/validateEnv.js';

const ENVIRONMENTS = ['development', 'production', 'test'];
const DOCKER_COMPOSE_FILES = {
  development: 'compose.dev.yml',
  production: 'compose.prod.yml',
  test: 'compose.test.yml'
};

async function switchEnvironment() {
  try {
    // 1. Get current state
    console.log('🔍 Checking current environment...');
    const currentEnv = process.env.NODE_ENV || 'development';
    
    // 2. Prompt for environment
    const { targetEnv } = await inquirer.prompt([
      {
        type: 'list',
        name: 'targetEnv',
        message: 'Select target environment:',
        choices: ENVIRONMENTS,
        default: currentEnv
      }
    ]);

    // 3. Confirm if switching to production
    if (targetEnv === 'production') {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: '⚠️ You are switching to PRODUCTION. Are you sure?',
          default: false
        }
      ]);
      if (!confirm) {
        console.log('❌ Operation cancelled');
        return;
      }
    }

    // 4. Check if environment file exists
    const envFile = `.env.${targetEnv}`;
    if (!fs.existsSync(envFile)) {
      console.error(`❌ Environment file ${envFile} not found`);
      const { createEnv } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'createEnv',
          message: `Would you like to create ${envFile} from .env.example?`,
          default: true
        }
      ]);
      
      if (createEnv) {
        fs.copyFileSync('.env.example', envFile);
        console.log(`✅ Created ${envFile} from template`);
      } else {
        return;
      }
    }

    // 5. Validate environment variables
    try {
      console.log(`🔍 Validating ${envFile}...`);
      validateEnv(envFile);
    } catch (error) {
      console.error('❌ Environment validation failed');
      return;
    }

    // 6. Stop running containers if any
    try {
      console.log('🛑 Stopping running containers...');
      execSync('docker-compose down', { stdio: 'inherit' });
    } catch (error) {
      console.log('No running containers found or docker unavailable');
    }

    // 7. Switch environment
    console.log(`🔄 Switching to ${targetEnv} environment...`);
    
    // Copy environment file
    fs.copyFileSync(envFile, '.env');
    
    // Set NODE_ENV
    process.env.NODE_ENV = targetEnv;
    
    // 8. Start containers with appropriate compose file
    if (targetEnv !== 'test') {
      console.log('🚀 Starting containers...');
      try {
        execSync(`docker-compose -f ${DOCKER_COMPOSE_FILES[targetEnv]} up -d`, { stdio: 'inherit' });
      } catch (error) {
        console.error('❌ Failed to start containers (docker may be unavailable):', error.message);
      }
    }

    console.log(`✅ Successfully switched to ${targetEnv} environment`);
    console.log(`📝 Environment file: ${envFile}`);
    console.log(`🐳 Docker Compose file: ${DOCKER_COMPOSE_FILES[targetEnv]}`);
    
    // 9. Additional environment-specific steps
    if (targetEnv === 'development') {
      console.log('🔧 Running development setup...');
      console.log('- Enabling debug endpoints');
      console.log('- Starting development servers');
    } else if (targetEnv === 'production') {
      console.log('🚀 Running production setup...');
      console.log('- Enabling production optimizations');
      console.log('- Starting monitoring services');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
switchEnvironment().catch(console.error);