import { Module } from '@nestjs/common';
import { ServiceOrdersModule } from '../service-orders/service-orders.module';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';

@Module({
  imports: [ServiceOrdersModule],
  controllers: [TrackingController],
  providers: [TrackingService],
})
export class TrackingModule {}
