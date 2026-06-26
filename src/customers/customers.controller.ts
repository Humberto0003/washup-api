import { Controller, Get, Param, Post } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Post(':id/redeem-benefit')
  redeemBenefit(@Param('id') id: string) {
    return this.customersService.redeemBenefit(id);
  }
}
