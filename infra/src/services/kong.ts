import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";
import { cluster } from "../cluster";
import { invoicesAdminHttpListener } from "./invoices";
import { appLoadBalancer } from "./load-balancer";

export const proxyTargetGroup = appLoadBalancer.createTargetGroup(
	"proxy-target",
	{
		port: 8000,
		protocol: "HTTP",
		healthCheck: {
			path: "/orders/health",
			protocol: "HTTP",
		},
	},
);

export const proxyHttpListener = appLoadBalancer.createListener(
	"proxy-listener",
	{
		port: 80,
		protocol: "HTTP",
		targetGroup: proxyTargetGroup,
	},
);

export const adminAPITargetGroup = appLoadBalancer.createTargetGroup(
	"admin-api-target",
	{
		port: 8001,
		protocol: "HTTP",
		healthCheck: {
			path: "/",
			protocol: "HTTP",
		},
	},
);

export const adminAPIHttpListener = appLoadBalancer.createListener(
	"admin-api-listener",
	{
		port: 8002,
		protocol: "HTTP",
		targetGroup: adminAPITargetGroup,
	},
);

export const adminTargetGroup = appLoadBalancer.createTargetGroup(
	"admin-target",
	{
		port: 8000,
		protocol: "HTTP",
		healthCheck: {
			path: "/",
			protocol: "HTTP",
		},
	},
);

export const adminHttpListener = appLoadBalancer.createListener(
	"admin-listener",
	{
		port: 8002,
		protocol: "HTTP",
		targetGroup: adminTargetGroup,
	},
);

export const kongService = new awsx.classic.ecs.FargateService("fargate-kong", {
	cluster: cluster,
	desiredCount: 1,
	waitForSteadyState: false,
	taskDefinitionArgs: {
		container: {
			image: "kong:3-management",
			cpu: 256,
			memory: 512,
			portMappings: [
				proxyHttpListener,
				adminAPIHttpListener,
				adminHttpListener,
			],
			environment: [
				{ name: "KONG_DATABASE", value: "off" },
				{ name: "KONG_ADMIN_LISTEN", value: "0.0.0.0:8001" },
				{
					name: "proxy_SERVICE_URL",
					value: pulumi.interpolate`http://${proxyHttpListener.endpoint.hostname}:${proxyHttpListener.endpoint.port}`,
				}, //FIXME: add value using pulumi cloud
				{
					name: "INVOICES_SERVICE_URL",
					value: pulumi.interpolate`http://${invoicesAdminHttpListener.endpoint.hostname}:${invoicesAdminHttpListener.endpoint.port}`,
				}, //FIXME: add value using pulumi cloud
			],
		},
	},
});
