import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";
import { cluster } from "../cluster";
import { invoicesAdminHttpListener } from "./invoices";
import { ordersAdminHttpListener } from "./orders";

export const kongService = new awsx.classic.ecs.FargateService("fargate-kong", {
	cluster: cluster,
	desiredCount: 1,
	waitForSteadyState: false,
	taskDefinitionArgs: {
		container: {
			image: "kong:3-management",
			cpu: 256,
			memory: 512,
			environment: [
				{ name: "KONG_DATABASE", value: "off" },
				{ name: "KONG_ADMIN_LISTEN", value: "0.0.0.0:8001" },
				{
					name: "ORDERS_SERVICE_URL",
					value: pulumi.interpolate`http://${ordersAdminHttpListener.endpoint.hostname}:${ordersAdminHttpListener.endpoint.port}`,
				}, //FIXME: add value using pulumi cloud
				{
					name: "INVOICES_SERVICE_URL",
					value: pulumi.interpolate`http://${invoicesAdminHttpListener.endpoint.hostname}:${invoicesAdminHttpListener.endpoint.port}`,
				}, //FIXME: add value using pulumi cloud
			],
		},
	},
});
