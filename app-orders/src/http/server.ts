import { fastify } from "fastify";
import { z } from "zod";
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import fastifyCors from "@fastify/cors";
import { db } from "../db/client.ts";
import { schema } from '../db/schema/index.ts';
import { faker } from '@faker-js/faker';
import { dispatchOrderCreated } from '../broker/messages/order-created.ts';
import { env } from '../../env.ts';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, { origin: "*" });

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.get("/health", (_, reply) => {
	return reply.status(200).send("ok");
});

app.post(
	"/orders",
	{
		schema: {
			body: z.object({
				amount: z.coerce.number(),
			}),
			response: {
				201: z.null(),
			},
		},
	},
	async (request, reply) => {
		const { amount } = request.body;

		const customers =  await db.query.customers.findMany()
		const customerIds = customers.map((customer) => customer.id)
		const randomCustomerId = faker.helpers.arrayElement(customerIds);

		const [order] = await db
			.insert(schema.orders)
			.values({
				amount,
				customerId: randomCustomerId, 
				status: "pending",
			})
			.returning();

		dispatchOrderCreated({
			id: order.id,
			amount: order.amount,
			customer: {
				id: order.customerId
			}
		})

		reply.status(201).send();
	},
);

app
	.listen({ host: "0.0.0.0", port: env.PORT })
	.then(() => console.log("[Orders] HTTP Server is running 🚀"));