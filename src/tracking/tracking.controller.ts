import { Controller, Get, Param } from '@nestjs/common';
import { TrackingService } from './tracking.service';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get(':plate')
  findByPlate(@Param('plate') plate: string) {
    return this.trackingService.findByPlate(plate);
  }
}
