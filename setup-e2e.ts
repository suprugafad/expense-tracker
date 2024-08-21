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
      console.log('Database not ready, retrying...');
      retries -= 1;
      await new Promise(res => setTimeout(res, 3000));
    } finally {
      await client.end();
    }
  }

  if (!retries) {
    throw new Error('Unable to connect to the database');
  }
}

global.afterAll(() => {
  console.log('Tearing down containers...');
  execSync('docker-compose -f docker-compose.test.yml down');
});

export default async () => {  
  execSync('docker-compose -f docker-compose.test.yml up -d');
  
  await waitForDatabase();
};

(async () => {
  await (await import('./setup-e2e')).default();
})();