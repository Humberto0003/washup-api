import { CustomerEntity, CustomerView } from './customer.types';

export function toCustomerView(customer: CustomerEntity): CustomerView {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    cpf: customer.cpf ?? undefined,
    plate: customer.vehicles?.[0]?.plate ?? '',
    totalVisits: customer.totalVisits,
    loyaltyPoints: customer.loyaltyPoints,
  };
}
