import { pgTable, text, timestamp, numeric, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { reservations } from './reservations.js';

export const contributionTypeEnum = pgEnum('contribution_type', ['donation', 'time_impact', 'content_impact']);
export const contributionStatusEnum = pgEnum('contribution_status', ['pending', 'delivered', 'validated']);

export const contributions = pgTable('contributions', {
  id: uuid('id').primaryKey().defaultRandom(),
  reservationId: uuid('reservation_id').references(() => reservations.id).notNull(),
  type: contributionTypeEnum('type').notNull(),
  subtype: text('subtype').notNull(),
  quantity: numeric('quantity').notNull(),
  unit: text('unit').notNull(),
  equivalentValue: numeric('equivalent_value').notNull(),
  status: contributionStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});
