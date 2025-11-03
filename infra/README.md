# 🚀 Microservices Infrastructure on AWS with Pulumi

Orchestration of scalable microservices architecture with Node.js on AWS using **Pulumi Infrastructure as Code (IaC)** and **ECS Fargate** with focus on asynchronous service communication via **RabbitMQ** and observability with **OpenTelemetry**.

## 📋 Project Overview

This project implements an order and invoice processing system demonstrating professional patterns for:

- ✅ **Event-Driven Architecture** (Pub/Sub pattern)
- ✅ **Service Decoupling** via message broker
- ✅ **API Gateway** for centralized routing
- ✅ **Distributed Observability** with tracing
- ✅ **Scalable Deployment** on container orchestration
- ✅ **Infrastructure as Code** for reproducibility

### High-Level Architecture

```
┌──────────────────────────────────────┐
│    Kong API Gateway (Port 8000)      │
│  (Proxy, Admin API, Admin UI)        │
└──────────────┬───────────────────────┘
               │
   ┌───────────┴───────────┐
   │                       │
   ▼                       ▼
┌─────────────┐      ┌──────────────┐
│   Orders    │      │   Invoices   │
│ Fastify API │      │ Fastify API  │
│ PostgreSQL  │      │ PostgreSQL   │
└──────┬──────┘      └──────┬───────┘
       │ publishes           │ consumes
       └───────────┬─────────┘
               │
               ▼
        ┌─────────────────┐
        │   RabbitMQ      │
        │ Message Broker  │
        └─────────────────┘

  ┌──────────────────────────────┐
  │   Jaeger + OpenTelemetry     │
  │   (Observability/Tracing)    │
  └──────────────────────────────┘
```

---

## 🏗️ AWS Resources Provisioned

### Compute
- **ECS Cluster** with multi-availability zone support
- **Fargate Services** (serverless compute):
  - Orders Service (256 CPU, 512MB RAM)
  - Invoices Service (256 CPU, 512MB RAM)
  - Kong Gateway (256 CPU, 512MB RAM)
  - RabbitMQ Broker (256 CPU, 512MB RAM)

### Load Balancing
- **Application Load Balancer (ALB)**: HTTP/HTTPS traffic
  - Health checks on `/health`
  - Listeners for each service
- **Network Load Balancer (NLB)**: AMQP (TCP) protocol for RabbitMQ

### Container Registry
- **ECR Repositories** for each service:
  - `orders-ecr`
  - `invoices-ecr`
  - `kong-ecr`

### Networking
- **VPC** with public and private subnets
- **Security Groups** with firewall rules
- **Internet Gateway** for external access

---

## 🔄 Service Communication Pattern

### Event-Driven with RabbitMQ

```
Orders Service (Publisher)
    │
    ├─ Create new order
    ├─ Save to PostgreSQL
    └─ Publish "order-created" event
       │
       ▼
    RabbitMQ (Queue: "orders")
       │
       ▼
    Invoices Service (Subscriber)
       ├─ Monitor queue continuously
       ├─ Receive order event
       ├─ Create corresponding invoice
       └─ Acknowledge consumption
```

### Message Contract

```typescript
// contracts/messages/order-created-message.ts
interface OrderCreatedMessage {
  id: string              // Order UUID
  amount: number          // Order amount
  customer: {
    id: string            // Customer ID
  }
}
```

### Pattern Benefits

- 🔌 **Decoupling**: Services are independent
- 📈 **Scalability**: Add consumers without modifying publisher
- 🔄 **Resilience**: Persistent queues retain messages
- ⏱️ **Asynchronism**: Non-blocking HTTP requests

---

## 🔧 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | 22.18.0 | JavaScript server-side |
| **HTTP Framework** | Fastify | 5.5.0 | High-performance REST APIs |
| **ORM** | Drizzle ORM | 0.44.5 | Type-safe database queries |
| **Database** | PostgreSQL | Latest | Data persistence |
| **Message Broker** | RabbitMQ | 3.x | Asynchronous messaging |
| **API Gateway** | Kong | 3.9 | Request routing & policies |
| **Validation** | Zod | 4.1.3 | Schema validation |
| **IaC** | Pulumi | 3.113.0 | Infrastructure as code |
| **Observability** | OpenTelemetry | 1.9.0 | Distributed tracing |
| **Tracing Backend** | Jaeger | 1.57 | Trace visualization |
| **Container Orchestration** | ECS Fargate | Latest | AWS serverless containers |
| **Containerization** | Docker | 20.10+ | Application packaging |

---

## 📁 Project Structure

```
microservices-nodejs/
├── app-orders/                    # Order Service
│   ├── src/
│   │   ├── http/                 # HTTP server (Fastify)
│   │   ├── broker/               # Event publishing
│   │   │   ├── messages/         # Event dispatch
│   │   │   └── channels/         # Channel configuration
│   │   ├── db/                   # Database schema
│   │   └── tracer/               # OpenTelemetry setup
│   ├── Dockerfile
│   └── package.json
│
├── app-invoices/                  # Invoice Service
│   ├── src/
│   │   ├── http/                 # HTTP server (Fastify)
│   │   ├── broker/               # Event consumption
│   │   │   ├── subscriber.ts     # Queue listener
│   │   │   └── channels/
│   │   └── db/                   # Database schema
│   ├── Dockerfile
│   └── package.json
│
├── infra/                         # 👈 Infrastructure as Code (Pulumi)
│   ├── src/
│   │   ├── index.ts              # Entry point
│   │   ├── cluster.ts            # ECS Cluster
│   │   ├── services/             # Service definitions
│   │   │   ├── orders.ts
│   │   │   ├── invoices.ts
│   │   ├── kong.ts
│   │   │   └── rabbitmq.ts
│   │   ├── images/               # ECR image builders
│   │   │   ├── orders.ts
│   │   │   ├── invoices.ts
│   │   │   └── kong.ts
│   │   └── load-balancer.ts
│   ├── Pulumi.yaml               # Pulumi project config
│   ├── Pulumi.dev.yaml           # Stack-specific config
│   ├── package.json
│   └── README.md                 # ← You are here
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
├── docker-compose.yml             # Local orchestration
└── README.md                      # Project overview
```

---

## 📊 Core Services

### Orders Service (Publisher)

**Responsibilities:**
- Receive HTTP requests to create orders
- Persist orders in PostgreSQL
- Publish "order-created" events to RabbitMQ
- Provide request tracing

**Endpoints:**
```bash
POST   /orders      # Create new order
GET    /health      # Health check
```

**Database Schema:**
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customerId TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status ENUM ('pending', 'paid', 'canceled') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### Invoices Service (Subscriber)

**Responsibilities:**
- Consume order events from RabbitMQ
- Create invoices when orders are created
- Persist invoice data in PostgreSQL

**Database Schema:**
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orderId UUID NOT NULL REFERENCES orders(id),
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### Kong API Gateway

**Responsibilities:**
- Route requests to appropriate services
- Apply CORS policies
- Serve admin UI for management
- Load balance between instances

**Ports:**
- `8000`: HTTP Proxy
- `8001`: Admin API
- `8002`: Admin UI

**Routes:**
```yaml
/orders   → http://orders-service:3333
/invoices → http://invoices-service:3334
```

### RabbitMQ Message Broker

**Responsibilities:**
- Store messages in persistent queues
- Ensure reliable event delivery
- Allow consumer scale-out

**Ports:**
- `5672`: AMQP protocol
- `15672`: Management UI
- Default Credentials: `admin:admin`

**Queues:**
- `orders`: Order creation events

---

## 🚀 Prerequisites

### Local Development
- **Node.js** >= 22.0
- **Docker** & **Docker Compose**
- **PNPM** (package manager)
- **Pulumi CLI** >= 3.0: https://www.pulumi.com/docs/get-started/install/

### AWS Deployment
- **AWS Account** with IAM permissions:
  - ECS (Elastic Container Service)
  - ECR (Elastic Container Registry)
  - EC2 (VPC, Security Groups, Load Balancers)
  - CloudFormation (for Pulumi)
- **AWS CLI** configured: `aws configure`
- **Pulumi Access Token**: https://app.pulumi.com/account/tokens

### Database
- **PostgreSQL** (developed with Neon)
  - Database URL provided during setup
  - Recommended: Serverless options (Neon, AWS RDS)

---

## ⚙️ Environment Variables

### App-Orders (.env)
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/orders

# Message Broker
BROKER_URL=amqp://admin:admin@localhost:5672

# Server
PORT=3333

# OpenTelemetry (observability)
OTEL_TRACES_EXPORTER=otlp
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=orders
OTEL_NODE_ENABLED_INSTRUMENTATIONS=http,fastify,pg,amqplib
```

### App-Invoices (.env)
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/invoices

# Message Broker
BROKER_URL=amqp://admin:admin@localhost:5672

# Server
PORT=3334

# OpenTelemetry
OTEL_TRACES_EXPORTER=otlp
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=invoices
OTEL_NODE_ENABLED_INSTRUMENTATIONS=http,fastify,pg,amqplib
```

---

## 🛠️ How to Use

### 1️⃣ Local Development (Docker Compose)

```bash
# Install dependencies
pnpm install

# Start infrastructure services (RabbitMQ, Jaeger)
docker-compose up -d

# Terminal 1: Start Orders Service
cd app-orders
pnpm run dev

# Terminal 2: Start Invoices Service
cd app-invoices
pnpm run dev
```

**Available Services:**
- API Gateway: http://localhost:8000
- Kong Admin UI: http://localhost:8002
- RabbitMQ UI: http://localhost:15672
- Jaeger UI: http://localhost:16686

### 2️⃣ Test Communication

```bash
# Create a new order
curl -X POST http://localhost:8000/orders \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'

# Expected response:
# {
#   "id": "550e8400-e29b-41d4-a716-446655440000",
#   "customerId": "customer-123",
#   "amount": 100,
#   "status": "pending",
#   "createdAt": "2025-11-03T10:30:00Z"
# }

# Health check
curl http://localhost:8000/orders/health
curl http://localhost:8000/invoices/health

# Check RabbitMQ queue
# Visit http://localhost:15672 (admin/admin)
# Section: Queues → orders → Get messages
```

### 3️⃣ Deploy to AWS with Pulumi

```bash
# Enter infrastructure directory
cd infra

# View planned changes
pnpm run preview

# Apply infrastructure changes
pnpm run up

# Get deployment outputs (service URLs)
pulumi stack output

# Destroy infrastructure (when no longer needed)
pnpm run destroy
```

---

## 📡 Observability with OpenTelemetry + Jaeger

### What Is Traced?

- **HTTP Requests**: Request/response latency and status codes
- **Database Queries**: PostgreSQL execution time
- **Message Publishing**: Event dispatch to RabbitMQ
- **Message Consumption**: Queue processing metrics
- **Custom Spans**: Application-specific operations

### Viewing Traces in Jaeger

1. Open http://localhost:16686
2. Select service from dropdown (orders, invoices)
3. Click "Find Traces"
4. Explore the event cascade for each request

**Example Trace:**
```
POST /orders (200ms)
├── Database insert order (15ms)
├── RabbitMQ publish event (5ms)
└── Response serialization (2ms)
```

---

## 🔍 Complete Data Flow

```
1. Client makes request
   ↓
   POST http://localhost:8000/orders
   { amount: 100 }
   ↓
2. Kong (API Gateway)
   Route: /orders → orders-service:3333
   ↓
3. Orders Service
   ├─ Validate payload with Zod
   ├─ Insert order into PostgreSQL
   │  INSERT INTO orders (customerId, amount, status)
   │  VALUES ('customer-123', 100, 'pending')
   ├─ Publish event to RabbitMQ
   │  {
   │    "id": "uuid-here",
   │    "amount": 100,
   │    "customer": { "id": "customer-123" }
   │  }
   └─ Return 201 Created
   ↓
4. RabbitMQ (Persistent Message Broker)
   Store message in "orders" queue
   ↓
5. Invoices Service (continuously consuming)
   ├─ Detect new message
   ├─ Parse and validate
   ├─ Insert invoice into PostgreSQL
   │  INSERT INTO invoices (orderId)
   │  VALUES ('uuid-from-order')
   ├─ Acknowledge consumption (remove from queue)
   └─ Log: "Invoice created for order: uuid"
   ↓
6. Observability (Jaeger)
   Collect and visualize traces from entire operation
   Total time: ~50ms distributed across services
```

---

## 📚 Pulumi Code Structure

### Main File: `src/index.ts`

```typescript
// 1. Export outputs (service URLs)
export const ordersServiceUrl = ordersService.mainLoadBalancerDns
export const invoicesServiceUrl = invoicesService.mainLoadBalancerDns
export const kongServiceUrl = kongService.mainLoadBalancerDns

// 2. Export resource permissions
[ecsCluster, ecsService].forEach((r) => {
  // resources are exported from the stack
})
```

### Create ECR Image: `src/images/orders.ts`

```typescript
// Build and push Docker image to ECR
const image = new awsx.ecr.Image("orders-image", {
  path: "../app-orders",
})
```

### Define ECS Service: `src/services/orders.ts`

```typescript
// Create Fargate task definition and service
const ordersService = new awsx.ecs.FargateService("orders", {
  cluster,
  taskRoleArn: taskRole.arn,
  desiredCount: 1,
  deploymentStrategy: {
    maximumPercent: 200,
    minimumHealthyPercent: 50,
  },
  containers: {
    orders: {
      image: ordersImage,
      memory: 512,
      cpu: 256,
      essential: true,
      portMappings: [{ containerPort: 3333 }],
      environment: [
        { name: "DATABASE_URL", value: config.requireSecret("databaseUrl") },
        { name: "PORT", value: "3333" },
        // ... other variables
      ],
    },
  },
})
```

### Load Balancer: `src/load-balancer.ts`

```typescript
// ALB for distributing HTTP traffic
const alb = new awsx.lb.ApplicationLoadBalancer("main", {
  external: true,
  securityGroups: [securityGroup],
})

// Listeners for each service
const ordersListener = alb.createListener("orders", {
  port: 8000,
  protocol: "HTTP",
  targets: [ordersService],
})
```

---

## 🐛 Known Issues & FIXMEs

### 1. Database Provisioning
```typescript
// FIXME: Create database using neon
// Pulumi lacks native support for Neon database creation
// Solution: Manually create database in Neon Console
```

**How to resolve:**
1. Visit https://console.neon.tech/
2. Create two projects: `orders-db` and `invoices-db`
3. Copy connection strings to `.env`
4. Run `pnpm run migrate` to create tables

### 2. Secrets Management
```typescript
// FIXME: Use Pulumi Cloud for secret management
// Currently credentials are hardcoded in environment variables
```

**Best practice:**
```typescript
const rabbitMqPassword = config.requireSecret("rabbitmqPassword")
```

### 3. Observability (Grafana)
```typescript
// FIXME: Create Grafana dashboards
// Jaeger is configured but Grafana is not integrated
```

**Next steps:**
- Configure Prometheus for metrics
- Create Grafana dashboards
- Integrate alerts

---

## 📈 Scalability

### Pattern: Horizontal Scaling

```yaml
# Increase service replicas
orders-service:
  desiredCount: 3  # Before: 1

# ALB automatically distributes requests
GET /orders
├─ ALB selects instance 1 or 2 or 3
└─ All share same database and message queue
```

### Load Management

- **RabbitMQ**: Distributes messages among multiple consumers
- **PostgreSQL**: Shared connections via connection pooling
- **ALB**: Round-robin among healthy instances

### Current Limitations

- Single database (no replication)
- Single RabbitMQ instance (no clustering)
- No distributed cache (Redis)

---

## 🔐 Security

### Implemented

- ✅ VPC with private subnets
- ✅ Security Groups with restrictive rules
- ✅ CORS policy in Kong
- ✅ No public database access

### Recommended Additions

- [ ] TLS/HTTPS for all traffic
- [ ] API Key authentication
- [ ] Rate limiting on Kong
- [ ] DDoS protection (AWS Shield)
- [ ] Secrets encryption with AWS KMS
- [ ] VPC Flow Logs for audit trail
- [ ] WAF (Web Application Firewall)

---

## 📖 References

- [Pulumi Documentation](https://www.pulumi.com/docs/)
- [Pulumi AWSX Components](https://www.pulumi.com/docs/reference/pkg/awsx/)
- [ECS Fargate Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html)
- [RabbitMQ Patterns](https://www.rabbitmq.com/getstarted.html)
- [OpenTelemetry Node.js](https://opentelemetry.io/docs/instrumentation/js/)
- [Kong Deployment](https://docs.konghq.com/gateway/latest/install/docker/)
- [Fastify Performance](https://www.fastify.io/)

---

## ✉️ Support

For questions or issues:

1. Check [Known Issues & FIXMEs](#-known-issues--fixmes) section
2. Review logs: `pulumi logs -f`
3. Test locally: `docker-compose up`
4. Open a GitHub issue with detailed information

---

**Built as a comprehensive study project for modern Node.js microservices architecture** 🎓
