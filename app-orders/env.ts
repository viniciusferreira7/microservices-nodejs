import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .regex(/^postgresql:\/\//, "DATABASE_URL must be a valid PostgreSQL connection string"),

  BROKER_URL: z
    .string()
    .url()
    .regex(/^amqp:\/\//, "BROKER_URL must be a valid AMQP connection string"),

  OTEL_TRACES_EXPORTER: z.enum(["otlp", "jaeger", "zipkin"]).default("otlp"),

  OTEL_EXPORTER_OTLP_ENDPOINT: z
    .string()
    .url()
    .regex(/^http/, "Must be a valid HTTP URL"),

  OTEL_SERVICE_NAME: z.string().min(1, "OTEL_SERVICE_NAME is required"),

  OTEL_NODE_ENABLED_INSTRUMENTATIONS: z
    .string()
    .transform((val) => val.split(",").map((v) => v.trim()))
    .pipe(z.array(z.enum(["http", "fastify", "pg", "amqplib"]))),
});


const schema = envSchema.parse(process.env);

export const env = schema
