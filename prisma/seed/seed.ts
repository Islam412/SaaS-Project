import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. Create Tenant
  const tenant = await prisma.tenant.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      name: 'My Company',
      email: 'admin@company.com',
      phone: '+1234567890',
      address: '123 Main St',
    },
  });

  console.log('✅ Tenant created:', tenant.id);

  // 2. Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@company.com',
      password: '$2b$10$j8LupH3Vb5TaetgumKx1e.8xAizKC.GCfHOdKuBuyyk5NHtgWUtf6', 
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  console.log('✅ Admin user created:', admin.id);

  // 3. Create Accounts (Chart of Accounts)
  const accounts = await prisma.account.createMany({
    data: [
      {
        code: '1000',
        name: 'Cash',
        type: 'ASSET',
        balance: 0,
        tenantId: tenant.id,
      },
      {
        code: '1100',
        name: 'Accounts Receivable',
        type: 'ASSET',
        balance: 0,
        tenantId: tenant.id,
      },
      {
        code: '2000',
        name: 'Deferred Revenue',
        type: 'LIABILITY',
        balance: 0,
        tenantId: tenant.id,
      },
      {
        code: '4000',
        name: 'Subscription Revenue',
        type: 'REVENUE',
        balance: 0,
        tenantId: tenant.id,
      },
    ],
  });

  console.log(`✅ ${accounts.count} accounts created`);

  // 4. Create Subscription Plans
  const plans = await prisma.subscriptionPlan.createMany({
    data: [
      {
        name: 'Bronze Plan',
        description: 'Basic plan for small businesses',
        price: 100,
        currency: 'USD',
        billingCycle: 'MONTHLY',
        tenantId: tenant.id,
      },
      {
        name: 'Silver Plan',
        description: 'Standard plan for growing businesses',
        price: 250,
        currency: 'USD',
        billingCycle: 'MONTHLY',
        tenantId: tenant.id,
      },
      {
        name: 'Gold Plan',
        description: 'Premium plan for large businesses',
        price: 500,
        currency: 'USD',
        billingCycle: 'MONTHLY',
        tenantId: tenant.id,
      },
    ],
  });

  console.log(`✅ ${plans.count} subscription plans created`);

  // 5. Create Customers
  const customers = await prisma.customer.createMany({
    data: [
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+123456789',
        address: '456 Elm St',
        tenantId: tenant.id,
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+987654321',
        address: '789 Oak St',
        tenantId: tenant.id,
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        phone: '+5551234567',
        address: '321 Pine St',
        tenantId: tenant.id,
      },
    ],
  });

  console.log(`✅ ${customers.count} customers created`);

  // 6. Create Subscriptions
  // Get customer IDs and plan IDs
  const allCustomers = await prisma.customer.findMany({
    where: { tenantId: tenant.id },
  });

  const allPlans = await prisma.subscriptionPlan.findMany({
    where: { tenantId: tenant.id },
  });

  if (allCustomers.length > 0 && allPlans.length > 0) {
    const subscriptions = await prisma.subscription.createMany({
      data: allCustomers.map((customer, index) => ({
        customerId: customer.id,
        planId: allPlans[index % allPlans.length].id,
        tenantId: tenant.id,
        startDate: new Date(),
        status: 'ACTIVE',
        autoRenew: true,
      })),
    });

    console.log(`✅ ${subscriptions.count} subscriptions created`);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });