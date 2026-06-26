import { QueueStatus } from '../common/enums';
import {
  CreateServiceOrderData,
  ServiceOrderEntity,
  UpdateServiceOrderData,
} from './service-order.types';

export const SERVICE_ORDERS_REPOSITORY = Symbol('SERVICE_ORDERS_REPOSITORY');

export interface ServiceOrdersRepository {
  findAll(): Promise<ServiceOrderEntity[]>;
  findById(id: string): Promise<ServiceOrderEntity | null>;
  findCurrentByPlate(normalizedPlate: string): Promise<ServiceOrderEntity | null>;
  findActiveByPlate(normalizedPlate: string): Promise<ServiceOrderEntity | null>;
  findByStatus(status: QueueStatus): Promise<ServiceOrderEntity[]>;
  create(data: CreateServiceOrderData): Promise<ServiceOrderEntity>;
  update(id: string, data: UpdateServiceOrderData): Promise<ServiceOrderEntity>;
  delete(id: string): Promise<ServiceOrderEntity>;
  updateMany(items: { id: string; data: UpdateServiceOrderData }[]): Promise<ServiceOrderEntity[]>;
}
