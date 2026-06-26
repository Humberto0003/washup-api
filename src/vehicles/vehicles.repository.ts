import { VehicleEntity } from './vehicle.types';

export const VEHICLES_REPOSITORY = Symbol('VEHICLES_REPOSITORY');

export interface VehiclesRepository {
  findByPlate(normalizedPlate: string): Promise<VehicleEntity | null>;
}
