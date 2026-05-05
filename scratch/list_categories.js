import { db } from '../src/db/index.js';
import { impactCategories } from '../src/db/schema/index.js';

async function listCategories() {
  const categories = await db.select().from(impactCategories);
  console.log(JSON.stringify(categories, null, 2));
  process.exit(0);
}

listCategories().catch(err => {
  console.error(err);
  process.exit(1);
});
