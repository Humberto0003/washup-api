import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VehiclesRepository } from './vehicles.repository';
import { VehicleEntity } from './vehicle.types';

@Injectable()
export class PrismaVehiclesRepository implements VehiclesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByPlate(normalizedPlate: string): Promise<VehicleEntity | null> {
    return this.prisma.vehicle.findUnique({
      where: { normalizedPlate },
      include: {
        customer: {
          include: { vehicles: { orderBy: { createdAt: 'asc' }, take: 1 } },
        },
      },
    });
  }
}
