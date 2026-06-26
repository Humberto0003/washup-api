import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ServiceOrdersModule } from './service-orders/service-orders.module';
import { TrackingModule } from './tracking/tracking.module';
import { VehiclesModule } from './vehicles/vehicles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CustomersModule,
    VehiclesModule,
    ServiceOrdersModule,
    TrackingModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
