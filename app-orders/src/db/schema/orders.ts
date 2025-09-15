import { integer, pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { customers } from './customers.ts';

export const statusEnum = pgEnum('status', ['pending', 'paid', 'canceled']);

export const orders = pgTable('orders', {
	id: uuid().primaryKey().defaultRandom(),
	customerId: uuid()
		.notNull()
		.references(() => customers.id, {
			onDelete: 'cascade',
		}),
	amount: integer().notNull(),
	status: statusEnum().notNull().default('pending'),
	createdAt: timestamp().defaultNow().notNull(),
});
