import { Module } from '@nestjs/common';
import { CustomersModule } from '../customers/customers.module';
import { PrismaServiceOrdersRepository } from './prisma-service-orders.repository';
import { SERVICE_ORDERS_REPOSITORY } from './service-orders.repository';
import { ServiceOrdersController } from './service-orders.controller';
import { ServiceOrdersService } from './service-orders.service';

@Module({
  imports: [CustomersModule],
  controllers: [ServiceOrdersController],
  providers: [
    ServiceOrdersService,
    { provide: SERVICE_ORDERS_REPOSITORY, useClass: PrismaServiceOrdersRepository },
  ],
  exports: [ServiceOrdersService, SERVICE_ORDERS_REPOSITORY],
})
export class ServiceOrdersModule {}
