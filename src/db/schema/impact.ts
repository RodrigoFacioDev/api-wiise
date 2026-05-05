import { pgTable, text, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { reservations } from './reservations.js';

export const impactCategoryNameEnum = pgEnum('impact_category_name', ['food', 'education', 'community']);

export const impactCategories = pgTable('impact_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: impactCategoryNameEnum('name').notNull(),
  label: text('label').notNull()
});

export const reservationImpacts = pgTable('reservation_impacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  reservationId: uuid('reservation_id').references(() => reservations.id).notNull(),
  impactCategoryId: uuid('impact_category_id').references(() => impactCategories.id).notNull()
});
