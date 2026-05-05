import { pgTable, text, timestamp, integer, pgEnum, uuid } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['user', 'admin']);
export const reputationLevelEnum = pgEnum('reputation_level', ['bronze', 'silver', 'gold']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').default('user').notNull(),
  reputationScore: integer('reputation_score').default(0).notNull(),
  reputationLevel: reputationLevelEnum('reputation_level').default('bronze').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});
