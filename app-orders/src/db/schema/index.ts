import { customers } from './customers.ts';
import { orders, statusEnum } from './orders.ts';

export const schema = { orders, orderStatus: statusEnum, customers };
