import { PrismaClient, QueueStatus } from '@prisma/client';

const prisma = new PrismaClient();

const customers = [
  {
    id: 'customer-1',
    name: 'Marina Costa',
    phone: '(82) 99910-1122',
    cpf: '123.456.789-00',
    plate: 'QWE4A21',
    totalVisits: 8,
    loyaltyPoints: 8,
  },
  {
    id: 'customer-2',
    name: 'Rafael Lima',
    phone: '(82) 98820-3344',
    plate: 'HJK7B92',
    totalVisits: 3,
    loyaltyPoints: 3,
  },
  {
    id: 'customer-3',
    name: 'Bianca Torres',
    phone: '(82) 97730-5566',
    cpf: '987.654.321-00',
    plate: 'MNB2C18',
    totalVisits: 11,
    loyaltyPoints: 11,
  },
  {
    id: 'customer-4',
    name: 'Carlos Freire',
    phone: '(82) 96640-7788',
    plate: 'RTY9D33',
    totalVisits: 15,
    loyaltyPoints: 15,
  },
  {
    id: 'customer-5',
    name: 'Aline Rocha',
    phone: '(82) 95550-9900',
    plate: 'VBN1E45',
    totalVisits: 6,
    loyaltyPoints: 6,
  },
];

const orders = [
  {
    id: 'queue-1',
    customerId: 'customer-1',
    vehicleId: 'vehicle-1',
    customerName: 'Marina Costa',
    phone: '(82) 99910-1122',
    cpf: '123.456.789-00',
    plate: 'QWE4A21',
    serviceType: 'Lavagem completa',
    status: QueueStatus.WAITING,
    position: 1,
    etaMinutes: 25,
    createdAt: new Date('2026-05-14T10:00:00.000Z'),
  },
  {
    id: 'queue-2',
    customerId: 'customer-2',
    vehicleId: 'vehicle-2',
    customerName: 'Rafael Lima',
    phone: '(82) 98820-3344',
    plate: 'HJK7B92',
    serviceType: 'Lavagem simples',
    status: QueueStatus.WAITING,
    position: 2,
    etaMinutes: 45,
    createdAt: new Date('2026-05-14T10:10:00.000Z'),
  },
  {
    id: 'queue-3',
    customerId: 'customer-3',
    vehicleId: 'vehicle-3',
    customerName: 'Bianca Torres',
    phone: '(82) 97730-5566',
    cpf: '987.654.321-00',
    plate: 'MNB2C18',
    serviceType: 'Higienizacao interna',
    status: QueueStatus.WASHING,
    position: 1,
    etaMinutes: 18,
    createdAt: new Date('2026-05-14T09:40:00.000Z'),
  },
  {
    id: 'queue-4',
    customerId: 'customer-4',
    vehicleId: 'vehicle-4',
    customerName: 'Carlos Freire',
    phone: '(82) 96640-7788',
    plate: 'RTY9D33',
    serviceType: 'Polimento',
    status: QueueStatus.DONE,
    position: 0,
    etaMinutes: 0,
    createdAt: new Date('2026-05-14T08:50:00.000Z'),
  },
];

async function main() {
  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { id: customer.id },
      update: {
        name: customer.name,
        phone: customer.phone,
        cpf: customer.cpf ?? null,
        totalVisits: customer.totalVisits,
        loyaltyPoints: customer.loyaltyPoints,
      },
      create: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        cpf: customer.cpf ?? null,
        totalVisits: customer.totalVisits,
        loyaltyPoints: customer.loyaltyPoints,
      },
    });

    await prisma.vehicle.upsert({
      where: { normalizedPlate: customer.plate },
      update: {
        id: `vehicle-${customer.id.split('-')[1]}`,
        plate: customer.plate,
        customerId: customer.id,
      },
      create: {
        id: `vehicle-${customer.id.split('-')[1]}`,
        plate: customer.plate,
        normalizedPlate: customer.plate,
        customerId: customer.id,
      },
    });
  }

  for (const order of orders) {
    await prisma.serviceOrder.upsert({
      where: { id: order.id },
      update: {
        customerName: order.customerName,
        phone: order.phone,
        cpf: order.cpf ?? null,
        plate: order.plate,
        normalizedPlate: order.plate,
        serviceType: order.serviceType,
        status: order.status,
        position: order.position,
        etaMinutes: order.etaMinutes,
        customerId: order.customerId,
        vehicleId: order.vehicleId,
        createdAt: order.createdAt,
      },
      create: {
        ...order,
        normalizedPlate: order.plate,
        cpf: order.cpf ?? null,
      },
    });
  }

  console.log('Seed concluido. Placas disponiveis para teste:');
  for (const customer of customers) {
    console.log(`- ${customer.plate}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
