import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;
const c = new Client({connectionString: process.env.DATABASE_URL});
c.connect()
  .then(()=> { console.log('DB CONNECTION OK'); process.exit(0); })
  .catch(e => { console.error('DB ERROR:', e.message); process.exit(1); })
