import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";
import { cluster } from "../cluster";
import { ordersDockerImage } from "../images/orders";
import { appLoadBalancer } from "./load-balancer";
import { amqpListener } from "./rabbitmq";

export const ordersTargetGroup = appLoadBalancer.createTargetGroup(
	"orders-admin-target",
	{
		port: 3333,
		protocol: "HTTP",
		healthCheck: {
			path: "/health",
			protocol: "HTTP",
		},
	},
);

export const ordersAdminHttpListener = appLoadBalancer.createListener(
	"orders-admin-listener",
	{
		port: 3333,
		protocol: "HTTP",
		targetGroup: ordersTargetGroup,
	},
);

export const ordersService = new awsx.classic.ecs.FargateService(
	"fargate-orders",
	{
		cluster: cluster,
		desiredCount: 1,
		waitForSteadyState: false,
		taskDefinitionArgs: {
			container: {
				image: ordersDockerImage.ref,
				cpu: 256,
				memory: 512,
				portMappings: [ordersAdminHttpListener],
				environment: [
					{
						name: "BROKER_URL",
						value: pulumi.interpolate`amqp://admin:admin@${amqpListener.endpoint.hostname}:${amqpListener.endpoint.port}`,
					},
					{
						name: "DATABASE_URL",
						value: "", //FIXME: Create database using neon, pulumi doesn`t have native config to create it on neon
					},
					{ name: "OTEL_TRACES_EXPORTER", value: "otlp" }, //FIXME: It`s necessary create grafana project
					{
						name: "OTEL_EXPORTER_OTLP_ENDPOINT",
						value: "http://localhost:4318",
					}, //FIXME: It`s necessary create grafana project
					{ name: "OTEL_SERVICE_NAME", value: "orders" }, //FIXME: It`s necessary create grafana project
					{
						name: "OTEL_NODE_ENABLED_INSTRUMENTATIONS",
						value: "http,fastify,pg,amqplib",
					}, //FIXME: It`s necessary create grafana project
				],
			},
		},
	},
);
