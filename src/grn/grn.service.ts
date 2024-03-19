import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CreateGrnDTO } from './dto/create.dto';
import { Grn } from 'src/entities/grn.entity';
import { generateRandomNumber } from 'src/utils/helper';
import { ItemGrn } from 'src/entities/grnItems.entity';
import { InventoryService } from 'src/inventory/inventory.service';
import { PaginationDto, QueryDto } from './dto/query.dto';
import { grnSearchFields } from 'src/utils/searchColumn';
import {
  GrnStatus,
  InventoryType,
  TrackingActionType,
  TrackingType,
} from 'src/utils/constant';
import { TrackingService } from 'src/tracking/tracking.service';
import { DepartmentService } from 'src/department/department.service';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class GrnService {
  constructor(
    @InjectRepository(Grn)
    private readonly grnRepo: Repository<Grn>,
    @InjectRepository(ItemGrn)
    private readonly itemGrnRepo: Repository<ItemGrn>,
    @Inject(forwardRef(() => InventoryService))
    private readonly inventory: InventoryService,
    @Inject(forwardRef(() => TrackingService))
    private readonly track: TrackingService,
    @Inject(forwardRef(() => DepartmentService))
    private readonly departmentRepo: DepartmentService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notification: NotificationService,
  ) {}

  async getGrnById(id: string): Promise<Grn> {
    const consumption = await this.grnRepo.findOne({
      where: { id: id, isArchived: false },
      relations: ['items', 'items.item'],
    });
    if (!consumption) {
      throw new NotFoundException(`Consumption with ID ${id} not found`);
    }

    return consumption;
  }
  async createItemGrn(
    createDto: CreateGrnDTO | any,
    userId: string,
    id: string | null = undefined,
  ): Promise<any> {
    try {
      const getLocation = await this.departmentRepo.getDepartmentById(
        createDto.department,
      );
      const grnApproval = getLocation.grnApproval;
      const grn = id && (await this.getGrnById(id));
      const po = { id: createDto.po };
      const grnCode = !id
        ? generateRandomNumber(6).toString()
        : createDto.grnCode;
      let status = !id ? GrnStatus.PENDING : createDto.status;
      const partial = [];
      const mappedItems = createDto.items.map((item) => {
        if (createDto.status == GrnStatus.HOD_APPROVED && id) {
          status =
            item.remainingQty > 0
              ? GrnStatus.PARTIAL_COMPLETE
              : GrnStatus.COMPLETED;
        }
        if (!grnApproval) {
          item.remainingQty > 0 && partial.push('partial');
          if (partial.length > 0 && item.remainingQty === 0) {
            partial.push('partial');
          }
        }
        return {
          requestedQty: item.requestedQty,
          item: { id: item.itemId },
          grnQty: item.grnQty,
          cancelQty: item.cancelQty,
          balance: item.balance,
          remainingQty: item.remainingQty,
        };
      });
      if (!grnApproval) {
        status =
          partial.length === createDto.items.length
            ? GrnStatus.PARTIAL_COMPLETE
            : GrnStatus.COMPLETED;
      }
      const mappedGrnDto: DeepPartial<Grn> = {
        ...createDto,
        po,
        grnCode,
        itemsConsumption: mappedItems,
        remarks: createDto.remarks,
        status: status,
      };
      const newGrnRequest = grn
        ? this.grnRepo.merge(grn, mappedGrnDto)
        : this.grnRepo.create(mappedGrnDto);
      newGrnRequest.items = await Promise.all(
        mappedItems.map(async (item) => {
          // const alreadyExist = await this.itemGrnRepo.findOne({
          //   where: {
          //     item: { id: item.item.id },
          //     grn: { id: newGrnRequest.id },
          //   },
          // });
          const alreadyExist = await this.itemGrnRepo
            .createQueryBuilder('item_grn')
            .leftJoinAndSelect('item_grn.item', 'item')
            .where('item.id = :id', { id: item.item.id })
            .andWhere('item_grn.grn = :grn', { grn: newGrnRequest.id })
            .getOne();
          const itemGrnItem: any = alreadyExist
            ? this.itemGrnRepo.merge(alreadyExist, item)
            : this.itemGrnRepo.create(item);
          if (!alreadyExist && createDto.status === GrnStatus.HOD_APPROVED) {
            await this.inventory.addItemToStoreInventory(
              [
                {
                  itemId: item.item.id,
                  issuedQty: item.grnQty,
                },
              ],
              createDto.department,
              InventoryType.STORAGE,
            );
          }
          itemGrnItem.grn = newGrnRequest;

          return itemGrnItem;
        }),
      );
      const result = await this.grnRepo.save(newGrnRequest);
      if (result && createDto.status == GrnStatus.HOD_APPROVED && id) {
        const formattedDate = result.createDateTime.toLocaleString();
        await this.notification.sendingNotificationToAllUsers(
          {
            message: `GRN approved`,
            date: formattedDate,
          },
          createDto.department,
          'goods_receiving_notes',
        );
      }
      await this.track.create({
        userId: userId,
        action: id
          ? createDto.status === GrnStatus.HOD_APPROVED
            ? TrackingActionType.HOD_APPROVED
            : createDto.status === GrnStatus.HOD_REJECTED
              ? TrackingActionType.HOD_REJECTED
              : TrackingActionType.USER_UPDATED
          : TrackingActionType.USER_CREATED,
        type: TrackingType.GRN,
        grnId: result.id,
        isReview: grnApproval,
      });
      return result;
    } catch (err) {
      throw err;
    }
  }

  async deleteGrn(id: string): Promise<any> {
    const grn = await this.getGrnById(id);

    if (grn) {
      grn.isArchived = true;
      await this.grnRepo.save(grn);
    }

    return grn;
  }

  async getGrnViewById(id: string): Promise<Grn> {
    const grn = await this.grnRepo
      .createQueryBuilder('grn')
      .leftJoinAndSelect('grn.items', 'items')
      .leftJoinAndSelect('grn.po', 'po')
      .leftJoinAndSelect('po.vendor', 'vendor')
      .leftJoinAndSelect('po.department', 'department')
      .leftJoinAndSelect('po.gatePass', 'gatePass')
      .leftJoinAndSelect('items.item', 'item')
      .where('grn.isArchived = :isArchived', { isArchived: false })
      .andWhere('grn.id = :grn', { grn: id })
      .orderBy('grn.createDateTime', 'DESC')
      .select([
        'grn',
        'po.id',
        'po.poCode',
        'vendor.id',
        'vendor.name',
        'gatePass',
        'department.id',
        'department.name',
        'items.grnQty',
        'items.cancelQty',
        'items.remainingQty',
        'items.requestedQty',
        'items.balance',
        'item.id',
        'item.itemCode',
        'item.name',
        'item.description',
      ])
      .getOne();
    const grns = await this.grnRepo
      .createQueryBuilder('grn')
      .leftJoinAndSelect('grn.items', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .where('grn.isArchived = :isArchived', { isArchived: false })
      .andWhere('grn.po = :id', { id: grn.po.id })
      .getMany();
    for (const item of grn.items) {
      let totalCanceled = 0;
      let totalRequested = 0;
      let totalGrnQty = 0;
      grns.map((con) => {
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
    return grn;
  }

  async getGrnRequests(
    department: string,
    query: QueryDto,
    pagination: PaginationDto,
  ): Promise<any> {
    const {
      status,
      remarks,
      poCode,
      grnCode,
      vendorName,
      createDateTime,
      vendorId,
      search,
    } = query;
    const { page, limit } = pagination;
    const skip = ((page ?? 1) - 1) * (limit ?? 10);

    const queryBuilder = this.grnRepo
      .createQueryBuilder('grn')
      .leftJoinAndSelect('grn.items', 'items')
      .leftJoinAndSelect('grn.po', 'po')
      .leftJoinAndSelect('po.department', 'department')
      .leftJoinAndSelect('po.vendor', 'vendor')
      .leftJoinAndSelect('po.gatePass', 'gatePass')
      .leftJoinAndSelect('items.item', 'item')
      .where('grn.isArchived = :isArchived', { isArchived: false })
      .andWhere('po.department = :department', { department: department });

    if (status) {
      queryBuilder.andWhere('grn.status = :status', {
        status: status.toUpperCase(),
      });
    }
    if (remarks) {
      queryBuilder.andWhere('grn.remarks ILIKE :remarks', {
        remarks: `%${remarks}%`,
      });
    }
    if (poCode) {
      queryBuilder.andWhere('po.poCode ILIKE :poCode', {
        poCode: `%${poCode}%`,
      });
    }
    if (grnCode) {
      queryBuilder.andWhere('grn.grnCode ILIKE :grnCode', {
        grnCode: `%${grnCode}%`,
      });
    }
    if (vendorName) {
      queryBuilder.andWhere('vendor.name ILIKE :vendorName', {
        vendorName: `%${vendorName}%`,
      });
    }
    if (vendorId) {
      queryBuilder.andWhere('vendor.id = :vendorId', {
        vendorId,
      });
    }
    if (createDateTime) {
      const createDateTimeFormatted = `${createDateTime}T00:00:00.000Z`;
      queryBuilder.andWhere(
        `DATE(grn.createDateTime) = DATE(:createDateTime)`,
        {
          createDateTime: createDateTimeFormatted,
        },
      );
    }

    if (search && grnSearchFields.length > 0) {
      const whereConditions = grnSearchFields
        .map((field) => {
          if (field === 'status') {
            return `grn.${field}::text ILIKE :search`;
          } else if (field === 'poCode') {
            return `po.${field} ILIKE :search`;
          } else {
            return `grn.${field} ILIKE :search`;
          }
        })
        .join(' OR ');

      queryBuilder.andWhere(`(${whereConditions})`, { search: `%${search}%` });
    }
    const totalRows = await queryBuilder.getCount();
    const list = await queryBuilder
      .orderBy('grn.createDateTime', 'DESC')
      .select([
        'grn',
        'po.id',
        'po.poCode',
        'vendor.id',
        'vendor.name',
        'gatePass',
        'department.id',
        'department.name',
        'items.grnQty',
        'items.cancelQty',
        'items.remainingQty',
        'items.requestedQty',
        'item.id',
        'item.itemCode',
        'item.name',
        'item.description',
      ])
      .skip(skip)
      .take(limit)
      .getMany();
    const data = { totalRows, list };
    return data;
  }
}
