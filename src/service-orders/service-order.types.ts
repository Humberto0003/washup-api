import { QueueStatus, WashServiceType } from '../common/enums';

export type ServiceOrderView = {
  id: string;
  customerName: string;
  phone: string;
  cpf?: string | null;
  plate: string;
  serviceType: WashServiceType;
  status: QueueStatus;
  position: number;
  etaMinutes: number;
  createdAt: string;
};

export type ServiceOrderEntity = {
  id: string;
  customerName: string;
  phone: string;
  cpf?: string | null;
  plate: string;
  normalizedPlate: string;
  serviceType: string;
  status: QueueStatus;
  position: number;
  etaMinutes: number;
  createdAt: Date;
  customerId: string;
  vehicleId: string;
};

export type CreateServiceOrderData = {
  customerName: string;
  phone: string;
  cpf?: string | null;
  plate: string;
  normalizedPlate: string;
  serviceType: WashServiceType;
  status: QueueStatus;
  position: number;
  etaMinutes: number;
  customerId: string;
  vehicleId: string;
};

export type UpdateServiceOrderData = Partial<
  Pick<
    ServiceOrderEntity,
    | 'customerName'
    | 'phone'
    | 'cpf'
    | 'plate'
    | 'normalizedPlate'
    | 'serviceType'
    | 'status'
    | 'position'
    | 'etaMinutes'
    | 'customerId'
    | 'vehicleId'
  >
>;
