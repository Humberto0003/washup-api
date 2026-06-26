import { CustomerView } from '../customers/customer.types';

export type VehicleView = {
  id: string;
  plate: string;
  normalizedPlate: string;
};

export type VehicleByPlateView = {
  vehicle: VehicleView;
  customer: CustomerView;
};

export type VehicleEntity = VehicleView & {
  customerId: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
    cpf?: string | null;
    totalVisits: number;
    loyaltyPoints: number;
    vehicles?: { plate: string }[];
  };
};
