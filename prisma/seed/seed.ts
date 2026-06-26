import { PrismaClient, AccountType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. Create or update Tenant
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

  console.log('✅ Tenant created/updated:', tenant.id);

  // 2. Create or update Admin User
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

  console.log('✅ Admin user created/updated:', admin.id);

  // 3. Create Accounts (Chart of Accounts) - using upsert for each
  const accountData: { code: string; name: string; type: AccountType }[] = [
    { code: '1000', name: 'Cash', type: AccountType.ASSET },
    { code: '1100', name: 'Accounts Receivable', type: AccountType.ASSET },
    { code: '2000', name: 'Deferred Revenue', type: AccountType.LIABILITY },
    { code: '4000', name: 'Subscription Revenue', type: AccountType.REVENUE },
  ];

  for (const acc of accountData) {
    await prisma.account.upsert({
      where: { 
        code: acc.code 
      },
      update: {},
      create: {
        code: acc.code,
        name: acc.name,
        type: acc.type,
        balance: 0,
        tenantId: tenant.id,
      },
    });
  }

  console.log(`✅ ${accountData.length} accounts created/updated`);

  // 4. Create Subscription Plans
  const planData = [
    { name: 'Bronze Plan', description: 'Basic plan for small businesses', price: 100 },
    { name: 'Silver Plan', description: 'Standard plan for growing businesses', price: 250 },
    { name: 'Gold Plan', description: 'Premium plan for large businesses', price: 500 },
  ];

  for (const plan of planData) {
    await prisma.subscriptionPlan.upsert({
      where: { 
        name_tenantId: {
          name: plan.name,
          tenantId: tenant.id
        }
      },
      update: {},
      create: {
        name: plan.name,
        description: plan.description,
        price: plan.price,
        currency: 'USD',
        billingCycle: 'MONTHLY',
        tenantId: tenant.id,
      },
    });
  }

  console.log(`✅ ${planData.length} subscription plans created/updated`);

  // 5. Create Customers
  const customerData = [
    { name: 'John Doe', email: 'john@example.com', phone: '+123456789', address: '456 Elm St' },
    { name: 'Jane Smith', email: 'jane@example.com', phone: '+987654321', address: '789 Oak St' },
    { name: 'Bob Johnson', email: 'bob@example.com', phone: '+5551234567', address: '321 Pine St' },
  ];

  for (const cust of customerData) {
    await prisma.customer.upsert({
      where: { 
        email_tenantId: {
          email: cust.email,
          tenantId: tenant.id
        }
      },
      update: {},
      create: {
        ...cust,
        tenantId: tenant.id,
      },
    });
  }

  console.log(`✅ ${customerData.length} customers created/updated`);

  // 6. Create Subscriptions
  const allCustomers = await prisma.customer.findMany({
    where: { tenantId: tenant.id },
  });

  const allPlans = await prisma.subscriptionPlan.findMany({
    where: { tenantId: tenant.id },
  });

  if (allCustomers.length > 0 && allPlans.length > 0) {
    for (let i = 0; i < allCustomers.length; i++) {
      const customer = allCustomers[i];
      const plan = allPlans[i % allPlans.length];
      
      // Check if subscription exists
      const existingSub = await prisma.subscription.findFirst({
        where: {
          customerId: customer.id,
          planId: plan.id,
          tenantId: tenant.id,
        },
      });

      if (!existingSub) {
        await prisma.subscription.create({
          data: {
            customerId: customer.id,
            planId: plan.id,
            tenantId: tenant.id,
            startDate: new Date(),
            status: 'ACTIVE',
            autoRenew: true,
          },
        });
      }
    }
    console.log(`✅ ${allCustomers.length} subscriptions created/updated`);
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