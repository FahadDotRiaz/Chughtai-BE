// purchase-order.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PurchaseOrder } from '../entities/purchaseOrder.entity';
import { CreatePurchaseOrderDto } from './dto/purchase-order.dto';
import { PurchaseOrderItem } from 'src/entities/purchaseOrderItem.entity';
import { Vendor } from 'src/entities/vendor.entity';
import { generateRandomNumber } from 'src/utils/helper';
import { UpdatePurchaseOrderDto } from './dto/update.dto';
import { PaginationDto, QueryDto } from './dto/query.dto';
import { purchaseOrderFields } from 'src/utils/searchColumn';
import { getPurchaseOrderResponseDto } from './dto/response.dto';
import { Grn } from 'src/entities/grn.entity';

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private readonly purchaseOrderItemRepository: Repository<PurchaseOrderItem>,
    @InjectRepository(Grn)
    private readonly grnRepo: Repository<Grn>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
  ) {}

  async getConsumptionById(id: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { id: id, isArchived: false },
    });
    if (!purchaseOrder) {
      throw new NotFoundException(`purchaseOrder with ID ${id} not found`);
    }

    return purchaseOrder;
  }
  async createPurchaseOrderWithItems(
    createPurchaseOrderDto: CreatePurchaseOrderDto | UpdatePurchaseOrderDto,
    id: string | null,
  ): Promise<PurchaseOrder> {
    const updatePO = id && (await this.getPoItems(id));
    const { vendorId, ...purchaseOrderData } = createPurchaseOrderDto;

    const vendor = await this.vendorRepository.findOne({
      where: {
        id: vendorId,
      },
    });
    if (!vendor) {
      throw new NotFoundException(`Vendor with id not found`);
    }
    let mappedItems;
    if (updatePO) {
      mappedItems = updatePO.items.map((item) => {
        const matchingItem = (createPurchaseOrderDto.items || []).find(
          (dtoItem) => dtoItem.itemId === item.item.id,
        );
        if (matchingItem) {
          return {
            ...item,
            quantity: matchingItem.quantity,
            remarks: matchingItem.remarks,
            federalTax: matchingItem.federalTax,
            salesTax: matchingItem.salesTax,
            discount: matchingItem.discount,
            deliveryDate: matchingItem.deliveryDate,
          };
        } else {
          return item;
        }
      });
    } else {
      mappedItems = createPurchaseOrderDto.items.map((item) => ({
        quantity: item.quantity,
        remarks: item.remarks,
        federalTax: item.federalTax,
        salesTax: item.salesTax,
        discount: item.discount,
        deliveryDate: item.deliveryDate,
        item: { id: item.itemId },
      }));
    }

    const department = { id: createPurchaseOrderDto.departmentId };
    const purchaseOrderCode = !id
      ? generateRandomNumber(6).toString()
      : updatePO?.poCode;

    const mappedPurchaseOrderDto: DeepPartial<PurchaseOrder> = {
      ...purchaseOrderData,
      vendor,
      department,
      poCode: purchaseOrderCode,
      items: mappedItems,
    };

    const savedPurchaseOrder = updatePO
      ? await this.purchaseOrderRepository.save(mappedPurchaseOrderDto)
      : await this.purchaseOrderRepository.create(mappedPurchaseOrderDto);
    if (!updatePO) {
      return await this.purchaseOrderRepository.save(savedPurchaseOrder);
    }
    return savedPurchaseOrder;
  }

  async getAllPurchaseOrders(
    department: string,
    query: QueryDto,
    pagination: PaginationDto,
  ): Promise<any> {
    const { poCode, status, remarks, vendor, search } = query;
    const { page, limit } = pagination;
    const skip = ((page ?? 1) - 1) * (limit ?? 10);
    let queryBuilder = this.purchaseOrderRepository
      .createQueryBuilder('purchase_order')
      .leftJoinAndSelect('purchase_order.vendor', 'vendor')
      .leftJoinAndSelect('purchase_order.grn', 'grn')
      .leftJoinAndSelect('purchase_order.department', 'department')
      .leftJoinAndSelect('department.location', 'location')
      .leftJoinAndSelect('purchase_order.items', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .where('purchase_order.isArchived = :isArchived', { isArchived: false })
      .andWhere('purchase_order.department = :department', {
        department: department,
      });

    // Applying filters
    if (poCode) {
      queryBuilder = queryBuilder.andWhere(
        'purchase_order.poCode ILIKE :poCode',
        { poCode: `%${poCode}%` },
      );
    }
    if (status) {
      queryBuilder = queryBuilder.andWhere('grn.status = :status', { status });
    }
    if (remarks) {
      queryBuilder = queryBuilder.andWhere(
        'purchase_order.comments ILIKE :remarks',
        { remarks: `%${remarks}%` },
      );
    }
    if (vendor) {
      queryBuilder = queryBuilder.andWhere('vendor.id = :id', {
        id: `%${vendor}%`,
      });
    }
    if (search && purchaseOrderFields.length > 0) {
      const whereConditions = purchaseOrderFields
        .map((field) => {
          // if (field === 'type') {
          //   return `gate_pass.${field}::text ILIKE :search`;
          // } else {
          return `purchase_order.${field} ILIKE :search`;
          // }
        })
        .join(' OR ');

      queryBuilder.andWhere(`(${whereConditions})`, {
        search: `%${search}%`,
      });
    }

    // Applying pagination
    const totalRows = await queryBuilder.getCount();

    queryBuilder = queryBuilder
      .orderBy('purchase_order.createDateTime', 'DESC')
      .skip(skip)
      .take(limit)
      .select([
        'purchase_order',
        'vendor.id',
        'vendor.name',
        'grn.status',
        'grn.remarks',
        'department.name',
        'department.id',
        'location',
        'items',
        'item',
      ]);

    const response = await queryBuilder.getMany();
    const list = response.map(
      (entity) => new getPurchaseOrderResponseDto(entity),
    );
    return { totalRows, list };
  }

  async getPoItems(id: string): Promise<any> {
    const po = await this.purchaseOrderRepository
      .createQueryBuilder('purchase_order')
      .leftJoinAndSelect('purchase_order.vendor', 'vendor')
      .leftJoinAndSelect('purchase_order.department', 'department')
      .leftJoinAndSelect('purchase_order.gatePass', 'gatePass')
      .leftJoinAndSelect('department.location', 'location')
      .leftJoinAndSelect('purchase_order.items', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .where('purchase_order.isArchived = :isArchived', { isArchived: false })
      .andWhere('purchase_order.id = :po', { po: id })
      .orderBy('purchase_order.createDateTime', 'DESC')
      .select([
        'purchase_order',
        'vendor.id',
        'vendor.name',
        'department.name',
        'department.id',
        'location',
        'gatePass',
        'items',
        'item',
      ])
      .getOne();
    const grn = await this.grnRepo
      .createQueryBuilder('grn')
      .leftJoinAndSelect('grn.items', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .where('grn.isArchived = :isArchived', { isArchived: false })
      .andWhere('grn.po = :id', { id: po.id })
      .getMany();
    for (const item of po.items) {
      let totalCanceled = 0;
      let totalRequested = 0;
      let totalGrnQty = 0;
      grn.map((con) => {
        const consumed = con.items.find(
          (entity) => entity.item.id === item?.item?.id,
        );
        consumed?.cancelQty
          ? (totalCanceled = totalCanceled + consumed.cancelQty)
          : totalCanceled;
        totalRequested = consumed?.requestedQty;

        consumed?.grnQty
          ? (totalGrnQty = totalGrnQty + consumed.grnQty)
          : totalGrnQty;
      });
      item['totalCancelQty'] = totalCanceled ?? 0;
      item['totalPendingQty'] =
        totalRequested - (totalGrnQty + totalCanceled) ?? 0;
      item['totalGrnQty'] = totalGrnQty ?? 0;
    }
    // return items;
    return po;
  }
}
