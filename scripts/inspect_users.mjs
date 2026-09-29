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
  const cols = await client.query(
    "SELECT column_name, data_type, column_default, is_nullable FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position"
  );
  console.log(JSON.stringify(cols.rows, null, 2));

  const fks = await client.query(
    "SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name " +
    "FROM information_schema.table_constraints AS tc " +
    "JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name " +
    "JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name " +
    "WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name='users'"
  );
  console.log("Foreign keys pointing to users:", JSON.stringify(fks.rows, null, 2));

  await client.end();
}

main().catch(console.error);
