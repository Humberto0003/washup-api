import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { PriorityDirection } from '../common/enums';
import { ChangePriorityDto } from './dto/change-priority.dto';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { MoveServiceOrderDto } from './dto/move-service-order.dto';
import { ReorderServiceOrdersDto } from './dto/reorder-service-orders.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { ServiceOrdersService } from './service-orders.service';

@Controller('service-orders')
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Get()
  findAll() {
    return this.serviceOrdersService.findAll();
  }

  @Post()
  create(@Body() dto: CreateServiceOrderDto) {
    return this.serviceOrdersService.create(dto);
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderServiceOrdersDto) {
    return this.serviceOrdersService.reorder(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceOrderDto) {
    return this.serviceOrdersService.update(id, dto);
  }

  @Patch(':id/advance')
  advance(@Param('id') id: string) {
    return this.serviceOrdersService.advance(id);
  }

  @Patch(':id/status')
  move(@Param('id') id: string, @Body() dto: MoveServiceOrderDto) {
    return this.serviceOrdersService.move(id, dto);
  }

  @Patch(':id/priority')
  changePriority(@Param('id') id: string, @Body() dto: ChangePriorityDto) {
    return this.serviceOrdersService.changePriority(id, dto.direction as PriorityDirection);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.serviceOrdersService.delete(id);
  }
}
