# 🚀 Modern Microservices Architecture with Node.js

A comprehensive study project demonstrating event-driven microservices architecture with **RabbitMQ** for asynchronous communication, **Kong** API Gateway for centralized routing, and **AWS ECS Fargate** for scalable cloud deployment using **Pulumi Infrastructure as Code**.

## 📋 Project Overview

This project implements an **Order Processing System** showcasing enterprise patterns for building scalable distributed systems:

- ✅ **Event-Driven Architecture**: Pub/Sub pattern with RabbitMQ
- ✅ **Service Decoupling**: Independent services communicating asynchronously
- ✅ **API Gateway**: Centralized request routing and management
- ✅ **Distributed Tracing**: Full observability with OpenTelemetry + Jaeger
- ✅ **Cloud-Native Deployment**: Containerized services on AWS ECS Fargate
- ✅ **Infrastructure as Code**: Reproducible AWS infrastructure with Pulumi
- ✅ **Type Safety**: End-to-end TypeScript with Drizzle ORM
- ✅ **High Performance**: Built with Fastify framework

### Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                Kong API Gateway                       │
│         (HTTP Proxy, Admin API, Admin UI)            │
└────────────────┬─────────────────────────────────────┘
                 │
     ┌───────────┴───────────┐
     │                       │
     ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│  Orders Service │    │ Invoices Service │
│  Fastify + DB   │    │  Fastify + DB    │
└────────┬────────┘    └────────┬─────────┘
         │ publishes             │ subscribes
         └───────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  RabbitMQ Broker     │
          │  (Message Queue)     │
          └──────────────────────┘

┌────────────────────────────────────────────────┐
│   Jaeger + OpenTelemetry                       │
│   (Distributed Tracing & Observability)        │
└────────────────────────────────────────────────┘
```

---

## 🏗️ System Architecture

### Core Components

#### **Orders Service** (Publisher)
- **Framework**: Fastify (high-performance HTTP framework)
- **Database**: PostgreSQL with Drizzle ORM
- **Responsibility**: Create orders and publish `order-created` events
- **Port**: 3333
- **Instrumentation**: OpenTelemetry tracing

#### **Invoices Service** (Subscriber)
- **Framework**: Fastify
- **Database**: PostgreSQL with Drizzle ORM
- **Responsibility**: Consume order events and generate invoices
- **Port**: 3334
- **Instrumentation**: OpenTelemetry tracing

#### **Kong API Gateway**
- **Version**: 3.9 (custom Docker image)
- **Purpose**: Route requests to appropriate services
- **Ports**:
  - 8000: HTTP Proxy
  - 8001: Admin API
  - 8002: Admin UI
- **Configuration**: Declarative YAML-based routing

#### **RabbitMQ Message Broker**
- **Version**: 3.x with Management UI
- **Ports**:
  - 5672: AMQP protocol
  - 15672: Management Console
- **Default Credentials**: admin/admin
- **Queue**: `orders` (order creation events)

---

## 🔄 Communication Pattern: Event-Driven Architecture

### How It Works

```
1. CLIENT REQUEST
   ↓
   POST http://gateway:8000/orders { amount: 100 }

2. KONG GATEWAY
   Routes → orders-service:3333

3. ORDERS SERVICE
   ├─ Validate input (Zod schema)
   ├─ Insert order into PostgreSQL
   ├─ Publish "order-created" event to RabbitMQ
   └─ Return 201 Created

4. RABBITMQ BROKER
   Stores message in "orders" queue
   Ensures delivery reliability

5. INVOICES SERVICE
   ├─ Poll queue continuously
   ├─ Receive "order-created" event
   ├─ Create invoice in PostgreSQL
   └─ Acknowledge consumption (ACK)

6. JAEGER TRACING
   Visualize complete request flow
   Track latency at each hop
```

### Event Contract

```typescript
// contracts/messages/order-created-message.ts
interface OrderCreatedMessage {
  id: string              // UUID of the order
  amount: number          // Order amount
  customer: {
    id: string            // Customer ID
  }
}
```

### Benefits of This Pattern

- 🔌 **Loose Coupling**: Services don't directly depend on each other
- 📈 **Scalability**: Add consumers without modifying publishers
- 🔄 **Resilience**: Failed deliveries are retried via persistent queues
- ⚡ **Async Processing**: Non-blocking request handling
- 🔍 **Traceability**: Complete visibility of distributed transactions

---

## 🔧 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | 22.18.0 | JavaScript runtime |
| **HTTP Framework** | Fastify | 5.5.0 | High-performance REST APIs |
| **ORM** | Drizzle ORM | 0.44.5 | Type-safe database queries |
| **Database** | PostgreSQL | Latest | Relational data storage |
| **Message Broker** | RabbitMQ | 3.x | Asynchronous messaging |
| **API Gateway** | Kong | 3.9 | Request routing & policies |
| **Validation** | Zod | 4.1.3 | Runtime schema validation |
| **Observability** | OpenTelemetry | 1.9.0 | Distributed tracing |
| **Trace Backend** | Jaeger | 1.57 | Trace visualization |
| **Orchestration** | ECS Fargate | Latest | Serverless container management |
| **IaC** | Pulumi | 3.113.0 | Cloud infrastructure management |
| **Container Runtime** | Docker | 20.10+ | Containerization |
| **Package Manager** | PNPM | 10.15.0 | Fast npm alternative |

---

## 📁 Project Structure

```
microservices-nodejs/
├── app-orders/                    # Order Service (Publisher)
│   ├── src/
│   │   ├── http/                 # HTTP server setup
│   │   ├── broker/               # Event publishing
│   │   │   ├── messages/         # Dispatch events
│   │   │   └── channels/         # Queue configuration
│   │   ├── db/                   # Database layer
│   │   │   ├── schema/           # Table definitions
│   │   │   └── client.ts         # DB instance
│   │   ├── tracer/               # OpenTelemetry setup
│   │   └── index.ts              # Entry point
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── app-invoices/                  # Invoice Service (Subscriber)
│   ├── src/
│   │   ├── http/                 # HTTP server setup
│   │   ├── broker/               # Event consuming
│   │   │   ├── subscriber.ts     # Queue listener
│   │   │   └── channels/
│   │   ├── db/                   # Database layer
│   │   └── index.ts              # Entry point
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── infra/                         # Infrastructure as Code (Pulumi)
│   ├── src/
│   │   ├── index.ts              # Main Pulumi program
│   │   ├── cluster.ts            # ECS Cluster config
│   │   ├── services/             # Service definitions
│   │   │   ├── orders.ts
│   │   │   ├── invoices.ts
│   │   ├── kong.ts
│   │   │   └── rabbitmq.ts
│   │   ├── images/               # Docker image builders
│   │   │   ├── orders.ts
│   │   │   ├── invoices.ts
│   │   │   └── kong.ts
│   │   ├── load-balancer.ts      # ALB configuration
│   │   └── security.ts           # VPC & Security Groups
│   ├── Pulumi.yaml
│   ├── Pulumi.dev.yaml
│   ├── package.json
│   └── README.md                 # Detailed infra docs
│
├── docker/
│   └── kong/                      # Custom Kong image
│       ├── Dockerfile
│       ├── config.template.yaml
│       └── startup.sh
│
├── contracts/                     # Shared message contracts
│   └── messages/
│       └── order-created-message.ts
│
├── docker-compose.yml             # Local development orchestration
├── .github/                       # GitHub workflows
│   └── workflows/
│       └── deploy.yml             # CI/CD pipeline (WIP)
├── .gitignore
├── package.json                   # Root workspace config
├── pnpm-workspace.yaml            # PNPM monorepo setup
├── tsconfig.json                  # TypeScript config
└── README.md                      # ← You are here
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 22.0
- **Docker** & **Docker Compose**
- **PNPM** >= 9.0 (or npm/yarn)

### Local Development (Docker Compose)

```bash
# 1. Install dependencies across all workspace packages
pnpm install

# 2. Start infrastructure services (RabbitMQ, Jaeger)
docker-compose up -d

# 3. Start Orders Service (Terminal 1)
cd app-orders
pnpm run dev

# 4. Start Invoices Service (Terminal 2)
cd app-invoices
pnpm run dev
```

**Available Services:**
- 🔵 **Kong API Gateway**: http://localhost:8000
- 🔑 **Kong Admin**: http://localhost:8001 or UI at http://localhost:8002
- 📨 **RabbitMQ Console**: http://localhost:15672 (admin/admin)
- 🔍 **Jaeger Traces**: http://localhost:16686
- 📊 **Orders API**: http://localhost:3333
- 📊 **Invoices API**: http://localhost:3334

### Test the System

```bash
# Create a new order
curl -X POST http://localhost:8000/orders \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'

# Expected response (201 Created):
# {
#   "id": "550e8400-e29b-41d4-a716-446655440000",
#   "customerId": "customer-123",
#   "amount": 100,
#   "status": "pending",
#   "createdAt": "2025-11-03T10:30:00.000Z"
# }

# Health check
curl http://localhost:8000/orders/health
# Response: { "status": "ok" }

# List invoices created from orders
curl http://localhost:8000/invoices

# Monitor RabbitMQ queue
# Visit http://localhost:15672 → Queues → orders
```

---

## 🛠️ Development Workflow

### Setup Environment Variables

**app-orders/.env:**
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/orders
BROKER_URL=amqp://admin:admin@localhost:5672
PORT=3333

# OpenTelemetry
OTEL_TRACES_EXPORTER=otlp
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=orders
OTEL_NODE_ENABLED_INSTRUMENTATIONS=http,fastify,pg,amqplib
```

**app-invoices/.env:**
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/invoices
BROKER_URL=amqp://admin:admin@localhost:5672
PORT=3334

# OpenTelemetry
OTEL_TRACES_EXPORTER=otlp
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=invoices
OTEL_NODE_ENABLED_INSTRUMENTATIONS=http,fastify,pg,amqplib
```

### Database Migrations

```bash
# Orders Service
cd app-orders
pnpm run db:push   # Apply schema changes

# Invoices Service
cd app-invoices
pnpm run db:push   # Apply schema changes
```

### Code Quality

```bash
# Format code with Biome
pnpm run format

# Lint code
pnpm run lint

# Type checking
pnpm run type-check

# Run tests (if available)
pnpm run test
```

---

## 📡 Observability

### OpenTelemetry Instrumentation

Both services are auto-instrumented to track:
- **HTTP requests/responses**: Latency, status codes, headers
- **Database queries**: Execution time, statement details
- **Message publishing**: Event dispatch to RabbitMQ
- **Message consumption**: Queue processing metrics
- **Custom spans**: Application-specific operations

### Viewing Traces in Jaeger

1. Open http://localhost:16686
2. Select service from dropdown (`orders` or `invoices`)
3. Click "Find Traces"
4. Click a trace to see detailed call hierarchy
5. View metrics: latency, error rates, span details

**Example Trace Structure:**
```
POST /orders (201ms)
├── Validate input (1ms)
├── Database insert (15ms)
├── RabbitMQ publish (5ms)
└── Response serialization (2ms)
```

---

## ☁️ Cloud Deployment (AWS)

### Prerequisites

- AWS account with proper IAM permissions
- AWS CLI configured: `aws configure`
- Pulumi CLI installed: https://www.pulumi.com/docs/get-started/install/
- Pulumi account & access token: https://app.pulumi.com

### Deploy to AWS

```bash
# Navigate to infrastructure code
cd infra

# Install Pulumi dependencies
pnpm install

# Preview changes
pnpm run preview

# Apply infrastructure changes
pnpm run up

# Get deployment outputs
pulumi stack output

# View service URLs in output:
# - Orders Service URL
# - Invoices Service URL
# - Kong Gateway URL
# - RabbitMQ Management URL
```

### AWS Resources Provisioned

- **ECS Cluster**: Manages containerized services
- **Fargate Services**: Serverless compute for each microservice
- **Application Load Balancer**: Distributes HTTP traffic
- **Network Load Balancer**: Handles AMQP traffic for RabbitMQ
- **ECR Repositories**: Container image registry
- **VPC**: Isolated network with security groups
- **CloudWatch**: Logs and monitoring
- **IAM Roles**: Proper permissions for each service

See [infra/README.md](./infra/README.md) for detailed infrastructure documentation.

### Cleanup

```bash
# Destroy AWS resources
pnpm run destroy

# Remove stack from Pulumi
pulumi stack rm
```

---

## 📊 Data Models

### Orders Table

```typescript
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customerId VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### Invoices Table

```typescript
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orderId UUID NOT NULL REFERENCES orders(id),
  createdAt TIMESTAMP DEFAULT NOW()
);
```

---

## 🔍 Data Flow Walkthrough

### Request Lifecycle

```
1. CLIENT INITIATES
   curl POST http://localhost:8000/orders { amount: 100 }

2. KONG ROUTES REQUEST
   Receives on port 8000
   Routes to orders-service:3333

3. ORDERS SERVICE PROCESSES
   GET /orders (Fastify router)
   ├─ Receive JSON payload
   ├─ Validate with Zod schema
   ├─ Generate UUID for order
   ├─ Insert into PostgreSQL
   │  INSERT INTO orders (id, customerId, amount, status)
   │  VALUES ('uuid', 'customer-123', 100, 'pending')
   ├─ Publish message to RabbitMQ
   │  {
   │    "id": "550e8400-e29b-41d4-a716-446655440000",
   │    "amount": 100,
   │    "customer": { "id": "customer-123" }
   │  }
   ├─ OpenTelemetry records spans
   └─ Return 201 Created

4. RABBITMQ STORES MESSAGE
   Queue: "orders"
   Persistence: Enabled (survives broker restart)
   Status: Waiting for consumers

5. INVOICES SERVICE CONSUMES
   Poll "orders" queue (amqplib)
   ├─ Receive message
   ├─ Parse JSON
   ├─ Extract orderId
   ├─ Insert into invoices table
   │  INSERT INTO invoices (id, orderId, createdAt)
   │  VALUES ('uuid', '550e8400...', NOW())
   ├─ Send ACK to RabbitMQ (remove from queue)
   ├─ OpenTelemetry records spans
   └─ Log: "Invoice created for order: 550e8400..."

6. JAEGER BACKEND COLLECTS
   Receives OTLP traces from both services
   Stores trace data
   Creates UI visualization

7. USER OBSERVES
   Open Jaeger UI
   View complete distributed trace
   Analyze performance bottlenecks
```

---

## 📈 Scalability Patterns

### Horizontal Scaling

To handle more requests:

```yaml
# Scale Orders Service
orders-service:
  desiredCount: 3  # Increase replicas

# Load Balancer automatically distributes
GET /orders
├─ Instance 1 (may be selected)
├─ Instance 2 (may be selected)
└─ Instance 3 (may be selected)
```

### Message Queue Distribution

```
Multiple Invoices instances consume from same queue
RabbitMQ automatically load-balances messages
Each message delivered to exactly one consumer
No duplication, no message loss
```

### Database Connection Pooling

```typescript
// Drizzle ORM handles connection pooling
const db = drizzle(postgresPool)

// Reuses connections across requests
// Prevents connection exhaustion under load
```

---

## 🐛 Known Issues & TODOs

### Database Provisioning
- ❌ Pulumi does not natively support Neon database creation
- 📝 **Workaround**: Manually create databases on Neon, use connection strings in env vars
- 🔗 Neon Console: https://console.neon.tech

### Secrets Management
- ❌ Currently hardcoded in environment variables
- 📝 **Recommendation**: Use Pulumi Cloud secrets or AWS Secrets Manager
- 🔗 Pulumi Secrets: https://www.pulumi.com/docs/concepts/secrets/

### Grafana Integration
- ❌ Jaeger configured but no Grafana dashboards
- 📝 **TODO**: Add Prometheus metrics + Grafana dashboards
- 🔗 OpenTelemetry Prometheus: https://opentelemetry.io/docs/instrumentation/js/resources/

### CI/CD Pipeline
- ⚠️ GitHub Actions workflow exists but disabled
- 📝 **TODO**: Complete and enable automated deployments
- 🔗 Workflow file: `.github/workflows/deploy.yml`

---

## 🔐 Security Considerations

### Implemented
- ✅ VPC with private subnets
- ✅ Security groups restricting traffic
- ✅ No public database access
- ✅ CORS policy in Kong
- ✅ Input validation with Zod

### Recommended Additions
- [ ] TLS/HTTPS for all traffic
- [ ] API key authentication
- [ ] Rate limiting on Kong
- [ ] AWS WAF (Web Application Firewall)
- [ ] Secrets encryption with AWS KMS
- [ ] VPC Flow Logs for audit trail
- [ ] DDoS protection (AWS Shield)

---

## 📚 Learning Resources

### Event-Driven Architecture
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Saga Pattern](https://microservices.io/patterns/data/saga.html)

### Observability
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Jaeger Getting Started](https://www.jaegertracing.io/docs/getting-started/)
- [Distributed Tracing](https://opentelemetry.io/docs/concepts/observability-primer/#distributed-traces)

### Cloud Infrastructure
- [Pulumi Documentation](https://www.pulumi.com/docs/)
- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-best-practices.html)
- [Kong Gateway Docs](https://docs.konghq.com/gateway/)

### Node.js Performance
- [Fastify Documentation](https://www.fastify.io/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 📖 Documentation

- **[Infrastructure Guide](./infra/README.md)** - Detailed AWS setup and Pulumi configuration
- **[Orders Service](./app-orders/README.md)** - Service-specific documentation (if available)
- **[Invoices Service](./app-invoices/README.md)** - Service-specific documentation (if available)

---

## 🤝 Contributing

This is a study project for learning modern microservices patterns. Contributions for improvements and corrections are welcome!

### Development Guidelines
- Use TypeScript for type safety
- Follow code style with Biome (format + lint)
- Add tests for new features
- Update documentation
- Follow commit message conventions

---

## 📝 License

This project is part of Rocketseat's Node.js backend course.

---

## ✉️ Support

For questions or issues:

1. Check [Known Issues](#-known-issues--todos) section
2. Review service logs: `docker-compose logs -f service-name`
3. Test locally before reporting
4. Check infrastructure docs: [infra/README.md](./infra/README.md)
5. Open a GitHub issue with detailed information

---

## 🎓 Learning Outcomes

By studying this project, you'll understand:

✨ **Architecture**
- Event-driven microservices design
- Service decoupling and async communication
- API Gateway patterns

✨ **Implementation**
- Building REST APIs with Fastify
- Database access with Drizzle ORM
- Message queue patterns with RabbitMQ

✨ **Observability**
- Distributed tracing with OpenTelemetry
- Trace visualization with Jaeger
- Service monitoring and debugging

✨ **Deployment**
- Infrastructure as Code with Pulumi
- Container orchestration with ECS Fargate
- Cloud-native application patterns

✨ **DevOps**
- Docker containerization
- CI/CD pipelines (GitHub Actions)
- Production-grade configurations

---

**Built as a comprehensive study project for modern Node.js microservices architecture** 🚀
