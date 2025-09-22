import '@opentelemetry/auto-instrumentations-node/register';
import { trace } from '@opentelemetry/api'
import { setTimeout } from 'node:timers/promises'

import { fastify } from 'fastify';
import { z } from 'zod';
import { faker } from '@faker-js/faker';
import fastifyCors from '@fastify/cors';
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from '../../env.ts';
import { dispatchOrderCreated } from '../broker/messages/order-created.ts';
import { db } from '../db/client.ts';
import { schema } from '../db/schema/index.ts';
import { tracer } from '../tracer/tracer.ts';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, { origin: '*' });

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.get('/health', (_, reply) => {
	return reply.status(200).send('ok');
});

app.post(
	'/orders',
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

		const customers = await db.query.customers.findMany();
		const customerIds = customers.map((customer) => customer.id);
		const randomCustomerId = faker.helpers.arrayElement(customerIds);

		const [order] = await db
			.insert(schema.orders)
			.values({
				amount,
				customerId: randomCustomerId,
				status: 'pending',
			})
			.returning();

			const span = tracer.startSpan("Maybe is here the problem")

			span.setAttribute('setTimeout', 2000)

			await setTimeout(2000)

			span.end()

			trace.getActiveSpan()?.setAttribute('order_id', order.id)

		dispatchOrderCreated({
			id: order.id,
			amount: order.amount,
			customer: {
				id: order.customerId,
			},
		});

		reply.status(201).send();
	}
);

app
	.listen({ host: '0.0.0.0', port: env.PORT })
	.then(() => console.log('[Orders] HTTP Server is running 🚀'));
