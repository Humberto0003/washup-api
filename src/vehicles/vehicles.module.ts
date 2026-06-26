import { Module } from '@nestjs/common';
import { PrismaVehiclesRepository } from './prisma-vehicles.repository';
import { VEHICLES_REPOSITORY } from './vehicles.repository';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';

@Module({
  controllers: [VehiclesController],
  providers: [
    VehiclesService,
    { provide: VEHICLES_REPOSITORY, useClass: PrismaVehiclesRepository },
  ],
  exports: [VehiclesService, VEHICLES_REPOSITORY],
})
export class VehiclesModule {}
