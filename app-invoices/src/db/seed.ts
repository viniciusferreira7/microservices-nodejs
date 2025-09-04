// seed.ts
import { faker } from '@faker-js/faker';
import { drizzle } from 'drizzle-orm/node-postgres';
import { schema } from './schema/index.ts'
import { env } from '../../env.ts';
import { sql } from 'drizzle-orm';

const db = drizzle(env.DATABASE_URL, {schema, casing: 'snake_case'});

await db.execute(sql.raw('TRUNCATE TABLE orders RESTART IDENTITY CASCADE'));
await db.execute(sql.raw('TRUNCATE TABLE customers RESTART IDENTITY CASCADE'));

console.log('✔️ Database was reset!')

async function seedCustomers(count: number) {
  const data = Array.from({ length: count }).map(() => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    address: faker.location.streetAddress(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode(),
    country: faker.location.country(),
    dateOfBirth: faker.date.birthdate({ min: 18, max: 70, mode: 'age' }),
  }));

  await db.insert(schema.customers).values(data);
  
  return data;
}

async function seedOrders(count: number, customerIds: string[]) {
  const data = Array.from({ length: count }).map(() => ({
    id: faker.string.uuid(),
    customerId: faker.helpers.arrayElement(customerIds),
    amount: faker.number.int({ min: 10, max: 1000 }),
    status: faker.helpers.arrayElement(schema.orderStatus.enumValues),
    createdAt: faker.date.past(),
  }));

  await db.insert(schema.orders).values(data);
}

async function main() {
  const numCustomers = 10;
  const numOrders = 20;

  console.log(`🌱 Seeding ${numCustomers} customers and ${numOrders} orders...`);

  const createdCustomers = await seedCustomers(numCustomers);
  const customerIds = createdCustomers.map((c) => c.id);

  await seedOrders(numOrders, customerIds);

  console.log('✅ Seeding completed!');
  process.exit(0)
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
