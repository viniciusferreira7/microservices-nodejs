import * as awsx from "@pulumi/awsx";
import { cluster } from "../cluster";

export const rabbitmqService = new awsx.classic.ecs.FargateService(
	"fargate-rabbitmq",
	{
		cluster: cluster,
		desiredCount: 1,
		waitForSteadyState: false,
		taskDefinitionArgs: {
			container: {
				image: "rabbitmq:3-management",
				cpu: 256,
				memory: 512,
				environment: [
					{ name: "RABBITMQ_DEFAULT_USER", value: "admin" },
					{ name: "RABBITMQ_DEFAULT_PASS", value: "admin" }, //FIXME: add value using pulumi cloud
				],
			},
		},
	},
);
