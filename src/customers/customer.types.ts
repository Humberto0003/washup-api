export type CustomerView = {
  id: string;
  name: string;
  phone: string;
  cpf?: string | null;
  plate: string;
  totalVisits: number;
  loyaltyPoints: number;
};

export type CustomerEntity = {
  id: string;
  name: string;
  phone: string;
  cpf?: string | null;
  totalVisits: number;
  loyaltyPoints: number;
  vehicles?: { id?: string; plate: string; normalizedPlate?: string }[];
};
