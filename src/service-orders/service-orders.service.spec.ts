import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PriorityDirection, QueueStatus, WashServiceType } from '../common/enums';
import { CustomersRepository } from '../customers/customers.repository';
import { ServiceOrderEntity } from './service-order.types';
import { ServiceOrdersRepository } from './service-orders.repository';
import { ServiceOrdersService } from './service-orders.service';

const baseOrder: ServiceOrderEntity = {
  id: 'queue-1',
  customerName: 'Marina Costa',
  phone: '(82) 99910-1122',
  cpf: '123.456.789-00',
  plate: 'QWE4A21',
  normalizedPlate: 'QWE4A21',
  serviceType: WashServiceType.COMPLETE,
  status: QueueStatus.WAITING,
  position: 1,
  etaMinutes: 25,
  customerId: 'customer-1',
  vehicleId: 'vehicle-1',
  createdAt: new Date('2026-05-14T10:00:00.000Z'),
};

describe('ServiceOrdersService', () => {
  let ordersRepository: jest.Mocked<ServiceOrdersRepository>;
  let customersRepository: jest.Mocked<CustomersRepository>;
  let service: ServiceOrdersService;

  beforeEach(() => {
    ordersRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findCurrentByPlate: jest.fn(),
      findActiveByPlate: jest.fn(),
      findByStatus: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
    };
    customersRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByPlate: jest.fn(),
      upsertFromOrder: jest.fn(),
      incrementLoyalty: jest.fn(),
      redeemBenefit: jest.fn(),
    };
    service = new ServiceOrdersService(ordersRepository, customersRepository);
  });

  it('cria atendimento em WAITING', async () => {
    ordersRepository.findActiveByPlate.mockResolvedValue(null);
    ordersRepository.findByStatus.mockResolvedValue([baseOrder]);
    customersRepository.upsertFromOrder.mockResolvedValue({
      id: 'customer-1',
      name: 'Marina Costa',
      phone: '(82) 99910-1122',
      cpf: '123.456.789-00',
      totalVisits: 8,
      loyaltyPoints: 8,
      vehicles: [{ id: 'vehicle-1', plate: 'QWE4A21', normalizedPlate: 'QWE4A21' }],
    });
    ordersRepository.create.mockResolvedValue({ ...baseOrder, id: 'queue-2', position: 2, etaMinutes: 45 });

    const result = await service.create({
      customerName: 'Marina Costa',
      phone: '(82) 99910-1122',
      cpf: '123.456.789-00',
      plate: 'qwe-4a21',
      serviceType: WashServiceType.COMPLETE,
    });

    expect(result.position).toBe(2);
    expect(result.etaMinutes).toBe(45);
    expect(ordersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ normalizedPlate: 'QWE4A21', status: QueueStatus.WAITING }),
    );
  });

  it('bloqueia atendimento ativo duplicado', async () => {
    ordersRepository.findActiveByPlate.mockResolvedValue(baseOrder);

    await expect(
      service.create({
        customerName: 'Marina Costa',
        phone: '(82) 99910-1122',
        plate: 'QWE4A21',
        serviceType: WashServiceType.SIMPLE,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('lista atendimentos normalizados', async () => {
    ordersRepository.findAll.mockResolvedValue([
      { ...baseOrder, id: 'queue-2', position: 2 },
      { ...baseOrder, id: 'queue-1', position: 1 },
    ]);

    const result = await service.findAll();

    expect(result.map((item) => item.id)).toEqual(['queue-1', 'queue-2']);
  });

  it('atualiza atendimento', async () => {
    ordersRepository.findById.mockResolvedValue(baseOrder);
    ordersRepository.update.mockResolvedValue({ ...baseOrder, serviceType: WashServiceType.POLISHING });

    const result = await service.update('queue-1', { serviceType: WashServiceType.POLISHING });

    expect(result.serviceType).toBe(WashServiceType.POLISHING);
    expect(ordersRepository.update).toHaveBeenCalledWith(
      'queue-1',
      expect.objectContaining({ serviceType: WashServiceType.POLISHING }),
    );
  });

  it('muda status por avanco', async () => {
    const washing = { ...baseOrder, status: QueueStatus.WASHING, position: 1, etaMinutes: 15 };
    ordersRepository.findById.mockResolvedValueOnce(baseOrder).mockResolvedValueOnce(baseOrder).mockResolvedValueOnce(washing);
    ordersRepository.findByStatus.mockResolvedValue([]);
    ordersRepository.updateMany.mockResolvedValue([washing]);

    const result = await service.advance('queue-1');

    expect(result.finished).toBe(false);
    expect(result.item.status).toBe(QueueStatus.WASHING);
    expect(ordersRepository.updateMany).toHaveBeenCalled();
  });

  it('reordena e evita posicoes duplicadas', async () => {
    const order2 = { ...baseOrder, id: 'queue-2', position: 2 };
    ordersRepository.findAll.mockResolvedValueOnce([baseOrder, order2]).mockResolvedValueOnce([order2, baseOrder]);
    ordersRepository.updateMany.mockResolvedValue([]);

    const result = await service.reorder({
      items: [
        { id: 'queue-1', status: QueueStatus.WAITING, position: 1 },
        { id: 'queue-2', status: QueueStatus.WAITING, position: 1 },
      ],
    });

    expect(ordersRepository.updateMany).toHaveBeenCalledWith([
      { id: 'queue-1', data: { status: QueueStatus.WAITING, position: 1, etaMinutes: 25 } },
      { id: 'queue-2', data: { status: QueueStatus.WAITING, position: 2, etaMinutes: 45 } },
    ]);
    expect(result).toHaveLength(2);
  });

  it('altera prioridade em WAITING', async () => {
    const order2 = { ...baseOrder, id: 'queue-2', position: 2 };
    ordersRepository.findById.mockResolvedValueOnce(order2).mockResolvedValueOnce({ ...order2, position: 1 });
    ordersRepository.findByStatus.mockResolvedValue([baseOrder, order2]);
    ordersRepository.updateMany.mockResolvedValue([]);

    const result = await service.changePriority('queue-2', PriorityDirection.UP);

    expect(result.position).toBe(1);
  });

  it('rejeita prioridade fora de WAITING', async () => {
    ordersRepository.findById.mockResolvedValue({ ...baseOrder, status: QueueStatus.WASHING });

    await expect(service.changePriority('queue-1', PriorityDirection.UP)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('retorna 404 para atendimento inexistente', async () => {
    ordersRepository.findById.mockResolvedValue(null);

    await expect(service.update('missing', { serviceType: WashServiceType.POLISHING })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
