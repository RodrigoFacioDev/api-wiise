import { db } from '../src/db/index.js';
import { reservations } from '../src/db/schema/index.js';
import { count, eq } from 'drizzle-orm';

async function checkReservations() {
  const all = await db.select({ id: reservations.id, status: reservations.status }).from(reservations);
  const pending = await db.select({ count: count() }).from(reservations).where(eq(reservations.status, 'pending'));
  
  console.log('All Reservations:', JSON.stringify(all, null, 2));
  console.log('Pending Count:', pending[0].count);
  process.exit(0);
}

checkReservations().catch(err => {
  console.error(err);
  process.exit(1);
});
