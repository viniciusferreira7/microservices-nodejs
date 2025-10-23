import * as pulumi from "@pulumi/pulumi";
import { invoicesService } from "./src/services/invoices";
import { kongService } from "./src/services/kong";
import { appLoadBalancer } from "./src/services/load-balancer";
import { ordersService } from "./src/services/orders";
import { rabbitMQService } from "./src/services/rabbitmq";

export const ordersId = ordersService.service.id;

export const invoicesId = invoicesService.service.id;

export const rabbitMQId = rabbitMQService.service.id;
export const rabbitMQAdminUrl = pulumi.interpolate`http://${appLoadBalancer.listeners[0].endpoint.hostname}:15672`;

export const kongId = kongService.service.id;
