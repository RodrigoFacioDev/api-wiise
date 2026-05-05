import { db } from './src/db/index';
import { impactCategories } from './src/db/schema/index';

async function listCategories() {
  try {
    const list = await db.select().from(impactCategories);
    console.log(JSON.stringify(list, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listCategories();
