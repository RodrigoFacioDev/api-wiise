import fs from 'fs';
import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;
const c = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
  await c.connect();
  const sql = fs.readFileSync('src/db/migrations/0000_elite_killraven.sql', 'utf8');
  const statements = sql.split('--> statement-breakpoint');
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (!stmt) continue;
    try {
      await c.query(stmt);
      console.log(`[OK] Statement ${i}`);
    } catch (e) {
      console.error(`[ERROR] Statement ${i}:`, e.message);
      console.error(stmt);
      process.exit(1);
    }
  }
  console.log('All migrations applied successfully!');
  process.exit(0);
}

run();
