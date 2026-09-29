import pg from 'pg';
const { Client } = pg;

import fs from 'fs';
import path from 'path';

function getConnectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.DB_URL) return process.env.DB_URL;
  for (const envPath of ['.env', '../.env', 'backend/.env']) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed.startsWith('DATABASE_URL=') || trimmed.startsWith('DB_URL=')) {
          let val = trimmed.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
          if (val.startsWith('jdbc:')) val = val.substring(5);
          return val;
        }
      }
    }
  }
  return null;
}

const connectionString = getConnectionString();
if (!connectionString) {
  console.error('DATABASE_URL or DB_URL not found in environment or .env');
  process.exit(1);
}


async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to Neon PostgreSQL!');

  // Check counts in users and dependent tables
  const userCount = await client.query('SELECT COUNT(*) FROM users');
  console.log('users count:', userCount.rows[0].count);

  const tables = ['sessions', 'user_settings', 'algorithm_executions', 'saved_visualizations', 'projects', 'executions', 'history', 'quiz_attempts', 'user_problem_progress', 'user_problem_notes', 'user_submissions'];
  for (const t of tables) {
    try {
      const res = await client.query(`SELECT COUNT(*) FROM ${t}`);
      console.log(`${t} count:`, res.rows[0].count);
    } catch (e) {
      console.log(`${t}:`, e.message);
    }
  }

  await client.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
