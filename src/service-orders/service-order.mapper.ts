import { ServiceOrderEntity, ServiceOrderView } from './service-order.types';

export function toServiceOrderView(order: ServiceOrderEntity): ServiceOrderView {
  return {
    id: order.id,
    customerName: order.customerName,
    phone: order.phone,
    cpf: order.cpf ?? undefined,
    plate: order.plate,
    serviceType: order.serviceType as ServiceOrderView['serviceType'],
    status: order.status,
    position: order.position,
    etaMinutes: order.etaMinutes,
    createdAt: order.createdAt.toISOString(),
  };
}
