import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { toCustomerView } from './customer.mapper';
import { CustomerView } from './customer.types';
import { CUSTOMERS_REPOSITORY, CustomersRepository } from './customers.repository';

@Injectable()
export class CustomersService {
  constructor(
    @Inject(CUSTOMERS_REPOSITORY)
    private readonly customersRepository: CustomersRepository,
  ) {}

  async findAll(): Promise<CustomerView[]> {
    const customers = await this.customersRepository.findAll();
    return customers.map(toCustomerView);
  }

  async redeemBenefit(id: string): Promise<CustomerView> {
    const customer = await this.customersRepository.findById(id);

    if (!customer) {
      throw new NotFoundException('Cliente nao encontrado.');
    }

    if (customer.loyaltyPoints < 10) {
      throw new BadRequestException('Cliente nao possui pontos suficientes.');
    }

    const updated = await this.customersRepository.redeemBenefit(id);
    return toCustomerView(updated);
  }
}
