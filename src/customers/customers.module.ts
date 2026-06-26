import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CUSTOMERS_REPOSITORY } from './customers.repository';
import { CustomersService } from './customers.service';
import { PrismaCustomersRepository } from './prisma-customers.repository';

@Module({
  controllers: [CustomersController],
  providers: [
    CustomersService,
    { provide: CUSTOMERS_REPOSITORY, useClass: PrismaCustomersRepository },
  ],
  exports: [CustomersService, CUSTOMERS_REPOSITORY],
})
export class CustomersModule {}
