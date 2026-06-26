import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomerEntity } from './customer.types';
import { CustomersRepository, UpsertCustomerData } from './customers.repository';

@Injectable()
export class PrismaCustomersRepository implements CustomersRepository {
  constructor(private readonly prisma: PrismaService) {}

  private includeVehicle = { vehicles: { orderBy: { createdAt: 'asc' as const }, take: 1 } };

  findAll(): Promise<CustomerEntity[]> {
    return this.prisma.customer.findMany({
      include: this.includeVehicle,
      orderBy: { name: 'asc' },
    });
  }

  findById(id: string): Promise<CustomerEntity | null> {
    return this.prisma.customer.findUnique({ where: { id }, include: this.includeVehicle });
  }

  async findByPlate(normalizedPlate: string): Promise<CustomerEntity | null> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { normalizedPlate },
      include: { customer: { include: this.includeVehicle } },
    });

    return vehicle?.customer ?? null;
  }

  async upsertFromOrder(data: UpsertCustomerData): Promise<CustomerEntity> {
    const existingVehicle = await this.prisma.vehicle.findUnique({
      where: { normalizedPlate: data.normalizedPlate },
      include: { customer: true },
    });

    if (existingVehicle) {
      return this.prisma.customer.update({
        where: { id: existingVehicle.customerId },
        data: {
          name: data.name,
          phone: data.phone,
          cpf: data.cpf ?? null,
          vehicles: {
            update: {
              where: { id: existingVehicle.id },
              data: { plate: data.plate, normalizedPlate: data.normalizedPlate },
            },
          },
        },
        include: this.includeVehicle,
      });
    }

    return this.prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone,
        cpf: data.cpf ?? null,
        totalVisits: 0,
        loyaltyPoints: 0,
        vehicles: {
          create: {
            plate: data.plate,
            normalizedPlate: data.normalizedPlate,
          },
        },
      },
      include: this.includeVehicle,
    });
  }

  incrementLoyalty(id: string): Promise<CustomerEntity> {
    return this.prisma.customer.update({
      where: { id },
      data: {
        totalVisits: { increment: 1 },
        loyaltyPoints: { increment: 1 },
      },
      include: this.includeVehicle,
    });
  }

  redeemBenefit(id: string): Promise<CustomerEntity> {
    return this.prisma.customer.update({
      where: { id },
      data: { loyaltyPoints: { decrement: 10 } },
      include: this.includeVehicle,
    });
  }
}
