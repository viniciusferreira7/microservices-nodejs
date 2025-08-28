import { integer } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { pgEnum } from 'drizzle-orm/pg-core';
import { uuid } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';

export const statusEnum = pgEnum('status', ['pending', 'paid', 'canceled'])

export const orders = pgTable('orders', {
  id: uuid().primaryKey(),
  customerId: uuid().notNull(),
  amount: integer(),
  status: statusEnum().notNull().default('pending'),
  createdAt: timestamp().defaultNow().notNull()
})