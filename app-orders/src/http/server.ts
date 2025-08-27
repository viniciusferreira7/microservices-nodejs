import { fastify } from "fastify";
import { z } from "zod";
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.get('/health', (_, reply) => {
	return reply.status(200).send('ok')
})

app.post(
	"/orders",
	{
		schema: {
			body: z.object({
				amount: z.number(),
			}),
		},
	},
	(request, reply) => {
		const { amount } = request.body;

		console.log('Creating order with amount ' + amount)

		return reply.status(201).send();
	},
);

app
	.listen({ host: "0.0.0.0", port: 3333 })
	.then(() => console.log("[Orders] HTTP Server is running 🚀"));
