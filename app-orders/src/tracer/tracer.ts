import { trace } from '@opentelemetry/api'
import { env } from '../../env.ts'

export const tracer = trace.getTracer(env.OTEL_SERVICE_NAME)

// TODO: 1:23:10 
