import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";
import { cluster } from "../cluster";
import { invoicesDockerImage } from "../images/invoices";
import { appLoadBalancer } from "./load-balancer";
import { amqpListener } from "./rabbitmq";

export const invoicesTargetGroup = appLoadBalancer.createTargetGroup(
	"invoices-admin-target",
	{
		port: 3333,
		protocol: "HTTP",
		healthCheck: {
			path: "/health",
			protocol: "HTTP",
		},
	},
);

export const invoicesAdminHttpListener = appLoadBalancer.createListener(
	"invoices-admin-listener",
	{
		port: 3333,
		protocol: "HTTP",
		targetGroup: invoicesTargetGroup,
	},
);

export const invoicesService = new awsx.classic.ecs.FargateService(
	"fargate-invoices",
	{
		cluster: cluster,
		desiredCount: 1,
		waitForSteadyState: false,
		taskDefinitionArgs: {
			container: {
				image: invoicesDockerImage.ref,
				cpu: 256,
				memory: 512,
				portMappings: [invoicesAdminHttpListener],
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
					{ name: "OTEL_SERVICE_NAME", value: "invoices" }, //FIXME: It`s necessary create grafana project
					{
						name: "OTEL_NODE_ENABLED_INSTRUMENTATIONS",
						value: "http,fastify,pg,amqplib",
					}, //FIXME: It`s necessary create grafana project
				],
			},
		},
	},
);

//TODO: 53:38
