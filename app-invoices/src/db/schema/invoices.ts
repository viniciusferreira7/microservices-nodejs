import { timestamp } from "drizzle-orm/pg-core";
import { uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";


export const invoices = pgTable("invoices", {
	id: uuid().primaryKey().defaultRandom(),
	orderId: uuid().notNull(),
	createdAt: timestamp().defaultNow().notNull(),
});
