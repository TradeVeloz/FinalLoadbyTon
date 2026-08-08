import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('demo1234', 12);

  const shipper = await prisma.user.upsert({
    where: { email: 'shipper@uaeports.ae' },
    update: {},
    create: {
      email: 'shipper@uaeports.ae',
      passwordHash,
      role: 'SHIPPER',
      isVerified: true,
      profile: {
        create: {
          companyName: 'Al-Majid Global Freight LLC',
          trnNumber: 'TRN-100293847500003',
          tradeLicenseNumber: 'CN-1029384',
          phone: '+971 4 881 2345',
          ratingAverage: 4.9,
          completedJobsCount: 142,
        },
      },
    },
  });

  const carrier = await prisma.user.upsert({
    where: { email: 'carrier@dubaidrayage.com' },
    update: {},
    create: {
      email: 'carrier@dubaidrayage.com',
      passwordHash,
      role: 'CARRIER',
      isVerified: true,
      profile: {
        create: {
          companyName: 'Emirates Overland Haulage Co.',
          trnNumber: 'TRN-200384756100009',
          tradeLicenseNumber: 'CN-8839201',
          phone: '+971 50 987 6543',
          ratingAverage: 4.85,
          completedJobsCount: 320,
        },
      },
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@loadbyton.ae' },
    update: {},
    create: {
      email: 'admin@loadbyton.ae',
      passwordHash,
      role: 'ADMIN',
      isVerified: true,
      profile: {
        create: {
          companyName: 'Loadbyton Operations',
          ratingAverage: 5,
        },
      },
    },
  });

  const falcon = await prisma.user.upsert({
    where: { email: 'falcon@containerxpress.ae' },
    update: {},
    create: {
      email: 'falcon@containerxpress.ae',
      passwordHash,
      role: 'CARRIER',
      isVerified: true,
      profile: {
        create: {
          companyName: 'Falcon Container Express LLC',
          trnNumber: 'TRN-300981234560001',
          tradeLicenseNumber: 'CN-7729031',
          phone: '+971 55 210 8890',
          ratingAverage: 4.7,
          completedJobsCount: 184,
        },
      },
    },
  });

  const job = await prisma.job.create({
    data: {
      jobCode: 'LBT-DXB-2608-4921',
      shipperId: shipper.id,
      carrierId: carrier.id,
      containerSize: 'FORTY_HC',
      containerType: 'DRY',
      containerNumber: 'MSKU9281745',
      pickupTerminal: 'JEBEL_ALI_T2',
      deliveryArea: 'JAFZA_SOUTH',
      deliveryAddress: 'Street 14, Warehouse 8B, JAFZA South, Dubai',
      readyTime: new Date(Date.now() + 3600000 * 2),
      deadline: new Date(Date.now() + 3600000 * 18),
      maxBudgetAED: 1400,
      agreedPriceAED: 1250,
      status: 'BIDDING',
    },
  });

  await prisma.bid.createMany({
    data: [
      {
        jobId: job.id,
        carrierId: carrier.id,
        amountAED: 1180,
        etaMinutes: 45,
        truckType: 'Heavy Flatbed Tri-Axle (40ft)',
        driverName: 'Mohammed Al-Rashid',
        notes: 'Trailer pre-positioned in JAFZA North.',
      },
      {
        jobId: job.id,
        carrierId: falcon.id,
        amountAED: 1220,
        etaMinutes: 30,
        truckType: 'Container Chassis Skeletal',
        driverName: 'Tariq Saeed',
      },
    ],
  });

  await prisma.message.createMany({
    data: [
      {
        jobId: job.id,
        senderId: shipper.id,
        content: 'Gate Pass DP World Jebel Ali has been issued for MSKU9281745.',
      },
      {
        jobId: job.id,
        senderId: carrier.id,
        content: 'Received Gate Pass. Driver Mohammed is queued at Gate 3 for pickup.',
        isRead: true,
      },
    ],
  });

  console.log('Seed complete.');
  console.log('Shipper:', shipper.email);
  console.log('Carrier:', carrier.email);
  console.log('Admin:  ', admin.email);
  console.log('Password for all demo accounts: demo1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
