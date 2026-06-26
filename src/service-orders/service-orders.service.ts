import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { calculateEtaMinutes } from '../common/order-rules';
import { isValidPlate, normalizePlate } from '../common/plate';
import {
  CUSTOMERS_REPOSITORY,
  CustomersRepository,
} from '../customers/customers.repository';
import { QueueStatus, PriorityDirection } from '../common/enums';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { MoveServiceOrderDto } from './dto/move-service-order.dto';
import { ReorderServiceOrdersDto } from './dto/reorder-service-orders.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { toServiceOrderView } from './service-order.mapper';
import { ServiceOrderEntity, ServiceOrderView, UpdateServiceOrderData } from './service-order.types';
import {
  SERVICE_ORDERS_REPOSITORY,
  ServiceOrdersRepository,
} from './service-orders.repository';

@Injectable()
export class ServiceOrdersService {
  constructor(
    @Inject(SERVICE_ORDERS_REPOSITORY)
    private readonly serviceOrdersRepository: ServiceOrdersRepository,
    @Inject(CUSTOMERS_REPOSITORY)
    private readonly customersRepository: CustomersRepository,
  ) {}

  async findAll(): Promise<ServiceOrderView[]> {
    const orders = await this.serviceOrdersRepository.findAll();
    return this.normalizeForResponse(orders).map(toServiceOrderView);
  }

  async create(dto: CreateServiceOrderDto): Promise<ServiceOrderView> {
    const normalizedPlate = this.getValidNormalizedPlate(dto.plate);
    const activeOrder = await this.serviceOrdersRepository.findActiveByPlate(normalizedPlate);

    if (activeOrder) {
      throw new ConflictException('Ja existe atendimento ativo para esta placa.');
    }

    const customer = await this.customersRepository.upsertFromOrder({
      name: dto.customerName,
      phone: dto.phone,
      cpf: dto.cpf ?? null,
      plate: normalizedPlate,
      normalizedPlate,
    });
    const vehicle = customer.vehicles?.[0];

    if (!vehicle?.id) {
      throw new BadRequestException('Veiculo nao encontrado para o cliente.');
    }

    const waitingOrders = await this.serviceOrdersRepository.findByStatus(QueueStatus.WAITING);
    const position = waitingOrders.length + 1;
    const order = await this.serviceOrdersRepository.create({
      customerName: dto.customerName,
      phone: dto.phone,
      cpf: dto.cpf ?? null,
      plate: normalizedPlate,
      normalizedPlate,
      serviceType: dto.serviceType,
      status: QueueStatus.WAITING,
      position,
      etaMinutes: calculateEtaMinutes(QueueStatus.WAITING, position),
      customerId: customer.id,
      vehicleId: vehicle.id,
    });

    return toServiceOrderView(order);
  }

  async update(id: string, dto: UpdateServiceOrderDto): Promise<ServiceOrderView> {
    const current = await this.getExisting(id);
    const normalizedPlate = dto.plate ? this.getValidNormalizedPlate(dto.plate) : current.normalizedPlate;
    let customerId = current.customerId;
    let vehicleId = current.vehicleId;

    if (dto.customerName || dto.phone || dto.cpf !== undefined || dto.plate) {
      const customer = await this.customersRepository.upsertFromOrder({
        name: dto.customerName ?? current.customerName,
        phone: dto.phone ?? current.phone,
        cpf: dto.cpf ?? current.cpf ?? null,
        plate: normalizedPlate,
        normalizedPlate,
      });
      const vehicle = customer.vehicles?.[0];
      customerId = customer.id;
      vehicleId = vehicle?.id ?? current.vehicleId;
    }

    const updated = await this.serviceOrdersRepository.update(id, {
      customerName: dto.customerName,
      phone: dto.phone,
      cpf: dto.cpf ?? undefined,
      plate: dto.plate ? normalizedPlate : undefined,
      normalizedPlate: dto.plate ? normalizedPlate : undefined,
      serviceType: dto.serviceType,
      customerId,
      vehicleId,
    });

    return toServiceOrderView(updated);
  }

  async advance(id: string): Promise<{ item: ServiceOrderView; finished: boolean }> {
    const current = await this.getExisting(id);

    if (current.status === QueueStatus.DONE) {
      return { item: toServiceOrderView(current), finished: true };
    }

    const nextStatus = current.status === QueueStatus.WAITING ? QueueStatus.WASHING : QueueStatus.DONE;
    const moved = await this.move(id, { status: nextStatus });

    if (nextStatus === QueueStatus.DONE) {
      await this.customersRepository.incrementLoyalty(current.customerId);
    }

    return { item: moved, finished: nextStatus === QueueStatus.DONE };
  }

  async move(id: string, dto: MoveServiceOrderDto): Promise<ServiceOrderView> {
    const current = await this.getExisting(id);
    const targetColumn = await this.serviceOrdersRepository.findByStatus(dto.status);
    const withoutCurrent = targetColumn.filter((item) => item.id !== id);
    const desiredIndex =
      dto.position === undefined || dto.status === QueueStatus.DONE
        ? withoutCurrent.length
        : Math.max(0, Math.min(dto.position - 1, withoutCurrent.length));
    const moved = { ...current, status: dto.status };
    const normalizedTarget = this.normalizeColumn([
      ...withoutCurrent.slice(0, desiredIndex),
      moved,
      ...withoutCurrent.slice(desiredIndex),
    ]);

    const sourceUpdates =
      current.status === dto.status
        ? []
        : this.normalizeColumn(
            (await this.serviceOrdersRepository.findByStatus(current.status)).filter(
              (item) => item.id !== id,
            ),
          );

    await this.serviceOrdersRepository.updateMany([
      ...sourceUpdates.map((item) => ({ id: item.id, data: this.pickOrderState(item) })),
      ...normalizedTarget.map((item) => ({ id: item.id, data: this.pickOrderState(item) })),
    ]);

    const updated = await this.getExisting(id);
    return toServiceOrderView(updated);
  }

  async reorder(dto: ReorderServiceOrdersDto): Promise<ServiceOrderView[]> {
    const currentOrders = await this.serviceOrdersRepository.findAll();
    const byId = new Map(currentOrders.map((order) => [order.id, order]));
    const unknown = dto.items.find((item) => !byId.has(item.id));

    if (unknown) {
      throw new NotFoundException('Atendimento nao encontrado.');
    }

    const merged = currentOrders.map((order) => {
      const incoming = dto.items.find((item) => item.id === order.id);
      return incoming ? { ...order, status: incoming.status, position: incoming.position } : order;
    });
    const normalized = this.normalizeForResponse(merged);

    await this.serviceOrdersRepository.updateMany(
      normalized.map((item) => ({ id: item.id, data: this.pickOrderState(item) })),
    );

    return (await this.serviceOrdersRepository.findAll()).map(toServiceOrderView);
  }

  async changePriority(id: string, direction: PriorityDirection): Promise<ServiceOrderView> {
    const current = await this.getExisting(id);

    if (current.status !== QueueStatus.WAITING) {
      throw new BadRequestException('Prioridade so pode ser alterada em WAITING.');
    }

    const waiting = await this.serviceOrdersRepository.findByStatus(QueueStatus.WAITING);
    const index = waiting.findIndex((item) => item.id === id);
    const targetIndex = direction === PriorityDirection.UP ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= waiting.length) {
      return toServiceOrderView(current);
    }

    const reordered = [...waiting];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    const normalized = this.normalizeColumn(reordered);
    await this.serviceOrdersRepository.updateMany(
      normalized.map((item) => ({ id: item.id, data: this.pickOrderState(item) })),
    );

    return toServiceOrderView(await this.getExisting(id));
  }

  async delete(id: string): Promise<string> {
    await this.getExisting(id);
    await this.serviceOrdersRepository.delete(id);
    const all = await this.serviceOrdersRepository.findAll();
    const normalized = this.normalizeForResponse(all);
    await this.serviceOrdersRepository.updateMany(
      normalized.map((item) => ({ id: item.id, data: this.pickOrderState(item) })),
    );
    return id;
  }

  async findCurrentByPlate(plate: string): Promise<ServiceOrderView | null> {
    const normalizedPlate = this.getValidNormalizedPlate(plate);
    const order = await this.serviceOrdersRepository.findCurrentByPlate(normalizedPlate);
    return order ? toServiceOrderView(order) : null;
  }

  private async getExisting(id: string): Promise<ServiceOrderEntity> {
    const order = await this.serviceOrdersRepository.findById(id);

    if (!order) {
      throw new NotFoundException('Atendimento nao encontrado.');
    }

    return order;
  }

  private getValidNormalizedPlate(plate: string): string {
    const normalizedPlate = normalizePlate(plate);

    if (!isValidPlate(normalizedPlate)) {
      throw new BadRequestException('Placa invalida.');
    }

    return normalizedPlate;
  }

  private normalizeForResponse(orders: ServiceOrderEntity[]): ServiceOrderEntity[] {
    const statusOrder = [QueueStatus.WAITING, QueueStatus.WASHING, QueueStatus.DONE];
    return statusOrder.flatMap((status) =>
      this.normalizeColumn(
        orders
          .filter((order) => order.status === status)
          .sort((a, b) => a.position - b.position || a.createdAt.getTime() - b.createdAt.getTime()),
      ),
    );
  }

  private normalizeColumn(orders: ServiceOrderEntity[]): ServiceOrderEntity[] {
    return orders.map((order, index) => {
      const position = order.status === QueueStatus.DONE ? 0 : index + 1;
      return {
        ...order,
        position,
        etaMinutes: calculateEtaMinutes(order.status, position),
      };
    });
  }

  private pickOrderState(order: ServiceOrderEntity): UpdateServiceOrderData {
    return {
      status: order.status,
      position: order.position,
      etaMinutes: order.etaMinutes,
    };
  }
}
