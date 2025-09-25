import '../broker/subscriber.ts';
import '@opentelemetry/auto-instrumentations-node/register';

import fastifyCors from '@fastify/cors';
import { fastify } from 'fastify';
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from '../../env.ts';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, { origin: '*' });

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.get('/health', (_, reply) => {
	return reply.status(200).send('ok');
});

app
	.listen({ host: '0.0.0.0', port: env.PORT })
	.then(() => console.log('[Invoices] HTTP Server is running 🚀'));
