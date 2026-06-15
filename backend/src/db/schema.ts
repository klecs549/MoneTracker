import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const borrowingStatusEnum = pgEnum('borrowing_status', ['awaiting', 'returned']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  mail: varchar('mail', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
});

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  icon: varchar('icon', { length: 255 }),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').references(() => tags.id, { onDelete: 'set null' }),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  note: text('note'),
  date: timestamp('date').notNull().defaultNow(),
});

export const borrowing = pgTable('borrowing', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  date: timestamp('date').notNull().defaultNow(),
  returnDate: timestamp('return_date'),
  status: borrowingStatusEnum('status').notNull().default('awaiting'),
});
