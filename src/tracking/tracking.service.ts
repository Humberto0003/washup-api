import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceOrderView } from '../service-orders/service-order.types';
import { ServiceOrdersService } from '../service-orders/service-orders.service';

@Injectable()
export class TrackingService {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  async findByPlate(plate: string): Promise<Omit<ServiceOrderView, 'cpf'>> {
    const order = await this.serviceOrdersService.findCurrentByPlate(plate);

    if (!order) {
      throw new NotFoundException('Atendimento nao encontrado para esta placa.');
    }

    const { cpf: _cpf, ...safeOrder } = order;
    return safeOrder;
  }
}
