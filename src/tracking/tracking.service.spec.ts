import { NotFoundException } from '@nestjs/common';
import { QueueStatus, WashServiceType } from '../common/enums';
import { ServiceOrdersService } from '../service-orders/service-orders.service';
import { TrackingService } from './tracking.service';

describe('TrackingService', () => {
  let serviceOrdersService: jest.Mocked<Pick<ServiceOrdersService, 'findCurrentByPlate'>>;
  let service: TrackingService;

  beforeEach(() => {
    serviceOrdersService = {
      findCurrentByPlate: jest.fn(),
    };
    service = new TrackingService(serviceOrdersService as unknown as ServiceOrdersService);
  });

  it('busca por placa e nao retorna cpf', async () => {
    serviceOrdersService.findCurrentByPlate.mockResolvedValue({
      id: 'queue-1',
      customerName: 'Marina Costa',
      phone: '(82) 99910-1122',
      cpf: '123.456.789-00',
      plate: 'QWE4A21',
      serviceType: WashServiceType.COMPLETE,
      status: QueueStatus.WAITING,
      position: 1,
      etaMinutes: 25,
      createdAt: '2026-05-14T10:00:00.000Z',
    });

    const result = await service.findByPlate('QWE4A21');

    expect(result).toEqual({
      id: 'queue-1',
      customerName: 'Marina Costa',
      phone: '(82) 99910-1122',
      plate: 'QWE4A21',
      serviceType: WashServiceType.COMPLETE,
      status: QueueStatus.WAITING,
      position: 1,
      etaMinutes: 25,
      createdAt: '2026-05-14T10:00:00.000Z',
    });
  });

  it('retorna somente o veiculo consultado', async () => {
    serviceOrdersService.findCurrentByPlate.mockResolvedValue({
      id: 'queue-3',
      customerName: 'Bianca Torres',
      phone: '(82) 97730-5566',
      plate: 'MNB2C18',
      serviceType: WashServiceType.INTERNAL_CLEANING,
      status: QueueStatus.WASHING,
      position: 1,
      etaMinutes: 15,
      createdAt: '2026-05-14T09:40:00.000Z',
    });

    const result = await service.findByPlate('MNB2C18');

    expect(serviceOrdersService.findCurrentByPlate).toHaveBeenCalledWith('MNB2C18');
    expect(result.plate).toBe('MNB2C18');
  });

  it('retorna 404 para placa sem atendimento', async () => {
    serviceOrdersService.findCurrentByPlate.mockResolvedValue(null);

    await expect(service.findByPlate('VBN1E45')).rejects.toBeInstanceOf(NotFoundException);
  });
});
