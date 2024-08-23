import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config({ path: '.env.test' });

async function waitForDatabase() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  });

  let retries = 5;
  while (retries) {
    try {
      await client.connect();
      await client.query('SELECT 1');
      console.log('Database is ready');
      return;
    } catch (err) {
      console.log(`Database not ready, retrying in 5 seconds... (${5 - retries + 1}/5)`);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000));
    } finally {
      await client.end();
    }
  }

  throw new Error('Unable to connect to the database');
}

global.beforeAll(() => {
  console.log('Starting containers...');
  try {
    execSync('docker-compose -f docker-compose.test.yml up -d', { stdio: 'inherit' });
  } catch (err) {
    console.error('Error starting docker-compose:', err.message);
    throw err;
  }
});

global.afterAll(() => {
  console.log('Tearing down containers...');
  try {
    execSync('docker-compose -f docker-compose.test.yml down', { stdio: 'inherit' });
  } catch (err) {
    console.error('Error stopping docker-compose:', err.message);
  }
});

export default async () => {
  await waitForDatabase();
};
