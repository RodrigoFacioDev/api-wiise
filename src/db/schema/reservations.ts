import { pgTable, text, timestamp, numeric, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const usageTypeEnum = pgEnum('usage_type', ['course', 'social_event', 'content_recording']);
export const reservationStatusEnum = pgEnum('reservation_status', ['pending', 'approved', 'rejected', 'completed', 'cancelled']);

export const reservations = pgTable('reservations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  usageType: usageTypeEnum('usage_type').notNull(),
  status: reservationStatusEnum('status').default('pending').notNull(),
  eventTitle: text('event_title').notNull(),
  eventDescription: text('event_description').notNull(),
  estimatedValue: numeric('estimated_value').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});
