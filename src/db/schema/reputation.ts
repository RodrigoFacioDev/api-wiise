import { pgTable, integer, timestamp, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { reservations } from './reservations.js';

export const reputationEventTypeEnum = pgEnum('reputation_event_type', [
  'event_completed',
  'contribution_delivered',
  'impact_validated',
  'no_show'
]);

export const reputationEvents = pgTable('reputation_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: reputationEventTypeEnum('type').notNull(),
  points: integer('points').notNull(),
  reservationId: uuid('reservation_id').references(() => reservations.id),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
