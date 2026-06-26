import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { VehiclesRepository } from './vehicles.repository';
import { VehiclesService } from './vehicles.service';

describe('VehiclesService', () => {
  let repository: jest.Mocked<VehiclesRepository>;
  let service: VehiclesService;

  beforeEach(() => {
    repository = {
      findByPlate: jest.fn(),
    };
    service = new VehiclesService(repository);
  });

  it('normaliza placa', () => {
    expect(service.normalizePlate('qwe-4a21')).toBe('QWE4A21');
  });

  it('busca cadastro por placa', async () => {
    repository.findByPlate.mockResolvedValue({
      id: 'vehicle-1',
      plate: 'QWE4A21',
      normalizedPlate: 'QWE4A21',
      customerId: 'customer-1',
      customer: {
        id: 'customer-1',
        name: 'Marina Costa',
        phone: '(82) 99910-1122',
        cpf: '123.456.789-00',
        totalVisits: 8,
        loyaltyPoints: 8,
        vehicles: [{ plate: 'QWE4A21' }],
      },
    });

    await expect(service.findByPlate('qwe-4a21')).resolves.toEqual({
      vehicle: { id: 'vehicle-1', plate: 'QWE4A21', normalizedPlate: 'QWE4A21' },
      customer: {
        id: 'customer-1',
        name: 'Marina Costa',
        phone: '(82) 99910-1122',
        cpf: '123.456.789-00',
        plate: 'QWE4A21',
        totalVisits: 8,
        loyaltyPoints: 8,
      },
    });
    expect(repository.findByPlate).toHaveBeenCalledWith('QWE4A21');
  });

  it('retorna 404 para placa inexistente', async () => {
    repository.findByPlate.mockResolvedValue(null);

    await expect(service.findByPlate('AAA1A11')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejeita placa invalida', async () => {
    await expect(service.findByPlate('AAA111')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('propaga conflito de placa duplicada vindo do repository', async () => {
    repository.findByPlate.mockRejectedValue(new ConflictException('Placa duplicada.'));

    await expect(service.findByPlate('QWE4A21')).rejects.toBeInstanceOf(ConflictException);
  });
});
