import { CustomerEntity } from './customer.types';

export const CUSTOMERS_REPOSITORY = Symbol('CUSTOMERS_REPOSITORY');

export type UpsertCustomerData = {
  name: string;
  phone: string;
  cpf?: string | null;
  plate: string;
  normalizedPlate: string;
};

export interface CustomersRepository {
  findAll(): Promise<CustomerEntity[]>;
  findById(id: string): Promise<CustomerEntity | null>;
  findByPlate(normalizedPlate: string): Promise<CustomerEntity | null>;
  upsertFromOrder(data: UpsertCustomerData): Promise<CustomerEntity>;
  incrementLoyalty(id: string): Promise<CustomerEntity>;
  redeemBenefit(id: string): Promise<CustomerEntity>;
}
