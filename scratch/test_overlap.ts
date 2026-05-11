import { db } from '../src/db/index.js';
import { reservations } from '../src/db/schema/index.js';
import { and, lt, gt, ne } from 'drizzle-orm';

async function testOverlap() {
  const start = new Date('2026-06-01T10:00:00Z');
  const end = new Date('2026-06-01T12:00:00Z');

  console.log('Checking overlap for:', start, 'to', end);

  const overlapping = await db.select().from(reservations)
    .where(
      and(
        ne(reservations.status, 'rejected'),
        ne(reservations.status, 'cancelled'),
        lt(reservations.startDate, end),
        gt(reservations.endDate, start)
      )
    ).limit(1);

  if (overlapping.length > 0) {
    console.log('Overlap found:', overlapping[0].id);
  } else {
    console.log('No overlap found.');
  }
  
  process.exit(0);
}

testOverlap().catch(err => {
  console.error(err);
  process.exit(1);
});
