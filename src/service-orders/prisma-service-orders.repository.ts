import { Injectable } from '@nestjs/common';
import { QueueStatus } from '../common/enums';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceOrdersRepository } from './service-orders.repository';
import {
  CreateServiceOrderData,
  ServiceOrderEntity,
  UpdateServiceOrderData,
} from './service-order.types';

@Injectable()
export class PrismaServiceOrdersRepository implements ServiceOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  private orderBy = [
    { status: 'asc' as const },
    { position: 'asc' as const },
    { createdAt: 'asc' as const },
  ];

  findAll(): Promise<ServiceOrderEntity[]> {
    return this.prisma.serviceOrder.findMany({ orderBy: this.orderBy });
  }

  findById(id: string): Promise<ServiceOrderEntity | null> {
    return this.prisma.serviceOrder.findUnique({ where: { id } });
  }

  findCurrentByPlate(normalizedPlate: string): Promise<ServiceOrderEntity | null> {
    return this.prisma.serviceOrder.findFirst({
      where: { normalizedPlate },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  findActiveByPlate(normalizedPlate: string): Promise<ServiceOrderEntity | null> {
    return this.prisma.serviceOrder.findFirst({
      where: { normalizedPlate, status: { not: QueueStatus.DONE } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByStatus(status: QueueStatus): Promise<ServiceOrderEntity[]> {
    return this.prisma.serviceOrder.findMany({
      where: { status },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });
  }

  create(data: CreateServiceOrderData): Promise<ServiceOrderEntity> {
    return this.prisma.serviceOrder.create({ data });
  }

  update(id: string, data: UpdateServiceOrderData): Promise<ServiceOrderEntity> {
    return this.prisma.serviceOrder.update({ where: { id }, data });
  }

  delete(id: string): Promise<ServiceOrderEntity> {
    return this.prisma.serviceOrder.delete({ where: { id } });
  }

  updateMany(items: { id: string; data: UpdateServiceOrderData }[]): Promise<ServiceOrderEntity[]> {
    return this.prisma.$transaction(
      items.map((item) =>
        this.prisma.serviceOrder.update({
          where: { id: item.id },
          data: item.data,
        }),
      ),
    );
  }
}
