import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { toCustomerView } from '../customers/customer.mapper';
import { normalizePlate, isValidPlate } from '../common/plate';
import { VEHICLES_REPOSITORY, VehiclesRepository } from './vehicles.repository';
import { VehicleByPlateView } from './vehicle.types';

@Injectable()
export class VehiclesService {
  constructor(
    @Inject(VEHICLES_REPOSITORY)
    private readonly vehiclesRepository: VehiclesRepository,
  ) {}

  normalizePlate(plate: string): string {
    return normalizePlate(plate);
  }

  async findByPlate(plate: string): Promise<VehicleByPlateView> {
    const normalizedPlate = normalizePlate(plate);

    if (!isValidPlate(normalizedPlate)) {
      throw new BadRequestException('Placa invalida.');
    }

    const vehicle = await this.vehiclesRepository.findByPlate(normalizedPlate);

    if (!vehicle || !vehicle.customer) {
      throw new NotFoundException('Veiculo nao encontrado.');
    }

    return {
      vehicle: {
        id: vehicle.id,
        plate: vehicle.plate,
        normalizedPlate: vehicle.normalizedPlate,
      },
      customer: toCustomerView({
        ...vehicle.customer,
        vehicles: vehicle.customer.vehicles?.length
          ? vehicle.customer.vehicles
          : [{ plate: vehicle.plate }],
      }),
    };
  }
}
