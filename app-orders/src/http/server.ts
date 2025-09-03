import { fastify } from "fastify";
import { z } from "zod";
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { channels } from "../../broker/channels/index.ts";
import fastifyCors from "@fastify/cors";
import { db } from "../db/client.ts";
import { schema } from '../db/schema/index.ts';

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

		// const [order] = await db
		// 	.insert(schema.orders)
		// 	.values({
		// 		amount,
		// 		status: "pending",
		// 	})
		// 	.returning();

		channels.orders.sendToQueue(
			"orders",
			Buffer.from(JSON.stringify({  })),
		);

		reply.status(201).send();
	},
);

app
	.listen({ host: "0.0.0.0", port: 3333 })
	.then(() => console.log("[Orders] HTTP Server is running 🚀"));

	//TODO: 47:00
