import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
// import { MaterialRequest } from '../entities/MaterialRequest.entity';
import { ItemReturnRequestDTO } from './dto/return-request.dto';
// import { ItemRequestItem } from '../entities/itemRequestItem.entity';
// import { ItemService } from '../item/item.service';
import { ReturnItemRequest } from '../entities/returnItemRequest.entity';
import { returnRequestedItem } from '../entities/returnRequestedItem.entity';
import { MaterialAcceptDTO } from './dto/accept.dto';
import { generateRandomNumber } from 'src/utils/helper';
import {
  DepartmentType,
  InventoryType,
  MrrMenuType,
  RequestStage,
  RequestStatus,
  ReturnReasonType,
  TrackingActionType,
  TrackingType,
} from 'src/utils/constant';
import { InventoryService } from 'src/inventory/inventory.service';
import { Consumption } from 'src/entities/consumption.entity';
import { TrackingService } from 'src/tracking/tracking.service';
import { DepartmentService } from 'src/department/department.service';
import { PaginationDto, QueryDto } from './dto/query.dto';
import { mrrSearchFields } from 'src/utils/searchColumn';
import { NotificationService } from 'src/notification/notification.service';
import { ItemService } from 'src/item/item.service';
import { DepartmentUpdateDTO } from './dto/departmentReview.dto';
// import { StoreIssuedNote } from 'src/entities/storeIssueNote.entity';
// import { returnRequestedItem } from 'src/entities/returnRequestedItem.entity';

@Injectable()
export class ItemReturnRequestService {
  constructor(
    @Inject(forwardRef(() => DepartmentService))
    private readonly departmentRepo: DepartmentService,
    @InjectRepository(ReturnItemRequest)
    private readonly itemReturnRequestRepo: Repository<ReturnItemRequest>,
    @InjectRepository(Consumption)
    private consumptionRepository: Repository<Consumption>,
    @InjectRepository(returnRequestedItem)
    private readonly itemReturnRepo: Repository<returnRequestedItem>,
    @Inject(forwardRef(() => InventoryService))
    private readonly inventory: InventoryService,
    @Inject(forwardRef(() => TrackingService))
    private readonly tracking: TrackingService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notification: NotificationService,
    @Inject(forwardRef(() => ItemService))
    private readonly itemRepo: ItemService,
  ) {}

  async sendNotification(
    mrrId: string,
    approved: boolean,
    department: any,
    status: RequestStatus,
    date: Date,
    hasItemWithDepartment: boolean,
  ) {
    const { mrrApproval, id, managedBy, name } = department;
    const formattedDate = date.toLocaleString();
    !mrrId && !approved && mrrApproval
      ? this.notification.sendingNotificationToAllUsers(
          {
            message: `${name} MRR created`,
            date: formattedDate,
          },
          id,
          MrrMenuType.MRR_REVIEW,
        )
      : (!approved && id) || (approved && id)
        ? status === RequestStatus.APPROVED
          ? (this.notification.sendingNotificationToAllUsers(
              {
                message: `${name} MRR approved by HOD`,
                date: formattedDate,
              },
              id,
              MrrMenuType.MRR_GENERATE,
            ),
            this.notification.sendingNotificationToAllUsers(
              {
                message: `${name} MRR approved by HOD`,
                date: formattedDate,
              },
              managedBy.id,
              hasItemWithDepartment
                ? MrrMenuType.MIR_DEPARTMENT_REVIEW
                : MrrMenuType.MRR_ISSUE,
            ))
          : status === RequestStatus.REJECTED
            ? this.notification.sendingNotificationToAllUsers(
                {
                  message: `${name} MRR rejected by HOD`,
                  date: formattedDate,
                },
                id,
                MrrMenuType.MRR_REVIEW,
              )
            : null
        : !mrrId && !approved && !mrrApproval
          ? this.notification.sendingNotificationToAllUsers(
              {
                message: `You have received MRR request from ${name}`,
                date: formattedDate,
              },
              managedBy.id,
              MrrMenuType.MRR_ISSUE,
            )
          : null;
  }

  async createItemReturnRequest(
    itemReturnRequestDto: ItemReturnRequestDTO,
    userId: string,
    id: string = null,
    approved = false,
  ) {
    const existingMRR = id
      ? await this.itemReturnRequestRepo.findOne({
          where: { id: id },
          relations: ['items', 'items.item'],
        })
      : undefined;
    const fromDepartment = { id: itemReturnRequestDto.fromDepartment };
    const getDepartment = await this.departmentRepo.getDepartmentById(
      itemReturnRequestDto.fromDepartment,
    );
    const mrrApproval = getDepartment.mrrApproval;
    const mrrItemReview = getDepartment.mirItemReview;
    let toDepartment = {};
    if (getDepartment.type == DepartmentType.Store) {
      toDepartment = { id: getDepartment.id };
    } else {
      toDepartment = { id: getDepartment.managedBy.id };
    }
    const finalMappedItems: returnRequestedItem[] = [];
    const hasItemWithDepartment = await this.itemRepo.hasItemWithDepartment(
      itemReturnRequestDto.items,
    );
    // for (const sin of itemReturnRequestDto.sinItems) {
    const mappedItems = await Promise.all(
      itemReturnRequestDto.items.map(async (item) => {
        const newItem: any = await this.itemReturnRepo.create({
          returnQuantity: item.returnQuantity,
          totalQuantity: item.totalQuantity,
          type: item.type,
          returnReason: item.returnReason,
          estimatedPrice: item.estimatedPrice,
          item: { id: item.itemId },
          sin: { id: item.sinId },
          images: item.images ? item.images.map((image) => image.file) : [],
        });

        return newItem;
      }),
    );

    finalMappedItems.push(...mappedItems);
    // }
    const mappedItemRequestDto: DeepPartial<ReturnItemRequest> = {
      ...itemReturnRequestDto,
      mrrCode: id ? existingMRR.mrrCode : generateRandomNumber(6).toString(),
      fromDepartment: fromDepartment,
      toDepartment: toDepartment,
      items: finalMappedItems,
      isReview: mrrApproval,
      stage:
        id && !approved
          ? existingMRR.stage
          : !approved && mrrApproval
            ? RequestStage.HOD_APPROVAL
            : approved && itemReturnRequestDto.status === RequestStatus.REJECTED
              ? existingMRR.stage
              : hasItemWithDepartment && mrrItemReview
                ? RequestStage.DEPARTMENT_APPROVAL
                : RequestStage.STORE_APPROVAL,
      proofOfDisposal: itemReturnRequestDto.proofOfDisposal
        ? itemReturnRequestDto.proofOfDisposal.map((image) => image.file)
        : [],
    };
    if (approved && itemReturnRequestDto.status) {
      mappedItemRequestDto['status'] =
        itemReturnRequestDto.status === RequestStatus.APPROVED
          ? RequestStatus.PENDING
          : RequestStatus.REJECTED;
    }
    // if (approved && !id) {
    //   mappedItemRequestDto.stage = RequestStage.HOD_APPROVAL;
    // } else if (!approved && !id) {
    //   mappedItemRequestDto.stage = RequestStage.STORE_APPROVAL;
    // }

    const newItemRequest = existingMRR
      ? this.itemReturnRequestRepo.merge(existingMRR, mappedItemRequestDto)
      : this.itemReturnRequestRepo.create(mappedItemRequestDto);
    newItemRequest.items = await Promise.all(
      finalMappedItems.map(async (item) => {
        const alreadyExist = item?.item?.id
          ? await this.itemReturnRepo
              .createQueryBuilder('return_request_items')
              .leftJoinAndSelect('return_request_items.item', 'item')
              .leftJoinAndSelect(
                'return_request_items.returnItemRequest',
                'returnItemRequest',
              )
              .where('item.id = :itemId', { itemId: item?.item?.id })
              .andWhere('returnItemRequest.id =:id', { id: existingMRR?.id })
              .andWhere('return_request_items.sin =:id', { id: item.sin?.id })
              .getOne()
          : undefined;
        const itemRequestItem = alreadyExist
          ? this.itemReturnRepo.merge(alreadyExist, item)
          : this.itemReturnRepo.create(item);
        itemRequestItem.returnItemRequest = newItemRequest;
        return itemRequestItem;
      }),
    );
    const result = await this.itemReturnRequestRepo.save(newItemRequest);
    const action = !existingMRR
      ? TrackingActionType.USER_CREATED
      : approved
        ? existingMRR.status === 'REJECTED'
          ? TrackingActionType.HOD_REJECTED
          : TrackingActionType.HOD_APPROVED
        : TrackingActionType.USER_UPDATED;

    this.sendNotification(
      id,
      approved,
      getDepartment,
      itemReturnRequestDto.status,
      result.createDateTime,
      hasItemWithDepartment,
    );
    await this.tracking.create({
      userId: userId,
      action,
      type: TrackingType.MRR,
      mrrId: result.id,
      isReview: mrrApproval,
    });
    return result;
  }

  async departmentUpdate(
    id: string,
    request: DepartmentUpdateDTO,
    userId: string,
  ): Promise<any> {
    const mrr = await this.itemReturnRequestRepo
      .createQueryBuilder('return_item_request')
      .leftJoinAndSelect('return_item_request.fromDepartment', 'fromDepartment')
      .where('return_item_request.id = :id', { id: id })
      .andWhere('return_item_request.isArchived =:isArchived', {
        isArchived: false,
      })
      .getOne();

    const getLocation = await this.departmentRepo.getDepartmentById(
      mrr.fromDepartment.id,
    );

    const mrrItemReview = getLocation.mrrItemReview;

    const item = await this.itemReturnRepo
      .createQueryBuilder('return_request_items')
      .leftJoinAndSelect('return_request_items.item', 'item')
      .leftJoinAndSelect(
        'return_request_items.returnItemRequest',
        'returnItemRequest',
      )
      .where('item.id = :itemId', { itemId: request.itemId })
      .andWhere('returnItemRequest.id =:id', { id: id })
      .getOne();
    this.tracking.create({
      action: TrackingActionType.ITEM_HOD_REVIEWED,
      userId: userId,
      mirId: mrr.id,
      type: TrackingType.MRR,
      isItemReview: mrrItemReview,
    });
    const formattedDate = new Date().toLocaleString();
    this.notification.sendingNotificationToAllUsers(
      {
        message: `${mrr.fromDepartment.name} mrr approved by Item depertment HOD`,
        date: formattedDate,
      },
      id,
      MrrMenuType.MRR_GENERATE,
    ),
      this.notification.sendingNotificationToAllUsers(
        {
          message: `${mrr.fromDepartment.name} mrr approved by Item depertment HOD`,
          date: formattedDate,
        },
        userId,
        MrrMenuType.MRR_ISSUE,
      );
    item.suggestedQty = request.suggestedQty;
    item.suggestedType = request.suggestedReason;
    mrr.stage = RequestStage.STORE_APPROVAL;
    await this.itemReturnRequestRepo.save(mrr);
    return await this.itemReturnRepo.save(item);
  }

  async getItemRequests(
    userId: string,
    department: string,
    review: boolean,
    query: QueryDto,
    pagination: PaginationDto,
    hodReview = false,
    departmentReview = false,
  ): Promise<any> {
    const { status, stage, mrrCode, search, fromDepartment, createDateTime } =
      query;
    const { page, limit } = pagination;
    const skip = (Number(page ?? 1) - 1) * Number(limit ?? 10) ?? 10;
    const uppercaseStatus = status ? status.toUpperCase() : null;
    const uppercaseStage = stage ? stage.toUpperCase() : null;
    const queryBuilder = await this.itemReturnRequestRepo
      .createQueryBuilder('return_item_request')
      .leftJoinAndSelect('return_item_request.fromDepartment', 'fromDepartment')
      .leftJoinAndSelect('fromDepartment.location', 'fromLocation')
      .leftJoinAndSelect('return_item_request.toDepartment', 'toDepartment')
      .leftJoinAndSelect('toDepartment.location', 'toLocation')
      .leftJoinAndSelect('return_item_request.items', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .leftJoinAndSelect('items.sin', 'sin')
      .leftJoinAndSelect('sin.mir', 'mir')
      .where('return_item_request.isArchived = :isArchived', {
        isArchived: false,
      })
      .select([
        'return_item_request',
        'fromDepartment.name',
        'fromLocation',
        'toDepartment.name',
        'toLocation',
        'items',
        'item.id',
        'item.name',
        'item.description',
        'item.itemCode',
        'sin.id',
        'sin.sinNumber',
        'mir.id',
        'mir.mirNumber',
      ])
      .orderBy('return_item_request.createDateTime', 'DESC');

    if (!review || hodReview) {
      queryBuilder.andWhere('fromDepartment.id = :id', { id: department });
    } else {
      queryBuilder.andWhere('toDepartment.id = :id', { id: department });
      queryBuilder.andWhere(
        '(return_item_request.stage = :storeApproval OR return_item_request.stage = :complete)',
        {
          storeApproval: RequestStage.STORE_APPROVAL,
          complete: RequestStage.COMPLETED,
        },
      );
    }

    if (fromDepartment) {
      queryBuilder.andWhere('fromDepartment.id = :id', { id: fromDepartment });
    }

    if (status) {
      queryBuilder.andWhere('return_item_request.status = :status', {
        status: uppercaseStatus,
      });
    }
    if (hodReview) {
      queryBuilder.andWhere('return_item_request.isReview = :isReview', {
        isReview: true,
      });
    }
    if (stage) {
      queryBuilder.andWhere('return_item_request.stage = :stage', {
        stage: uppercaseStage,
      });
    }
    if (createDateTime) {
      const createDateTimeFormatted = `${createDateTime}T00:00:00.000Z`;
      queryBuilder.andWhere(
        `DATE(return_item_request.createDateTime) = DATE(:createDateTime)`,
        {
          createDateTime: createDateTimeFormatted,
        },
      );
    }
    if (mrrCode) {
      queryBuilder.andWhere('return_item_request.mrrCode ILIKE :mrrCode', {
        mrrCode: `%${mrrCode}%`,
      });
    }

    if (search && mrrSearchFields.length > 0) {
      const whereConditions = mrrSearchFields
        .map((field) => {
          if (field === 'status' || field === 'stage') {
            return `return_item_request.${field}::text ILIKE :search`;
          } else {
            return `return_item_request.${field} ILIKE :search`;
          }
        })
        .join(' OR ');

      queryBuilder.andWhere(`(${whereConditions})`, { search: `%${search}%` });
    }

    const totalRows = await queryBuilder.getCount();
    const returnRequest = await queryBuilder.skip(skip).take(limit).getMany();
    const list = returnRequest.filter((request) => !!request);
    list.forEach((item) => {
      item?.items?.forEach(async (entity, entityIndex) => {
        if (departmentReview) {
          const departmentItem = await this.itemRepo.hasItemWithDepartment([
            entity.item,
          ]);
          if (!departmentItem) {
            item.items.splice(entityIndex, 1);
          }
        }
      });
    });
    return { totalRows, list };
  }

  async getItemApprovedRequests(
    userId: string,
    department: string,
    review: boolean,
    query: QueryDto,
    pagination: PaginationDto,
  ): Promise<any> {
    const { status, stage, mrrCode, search, createDateTime } = query;
    const { page, limit } = pagination;
    const skip = (Number(page ?? 1) - 1) * Number(limit ?? 10) ?? 10;
    const uppercaseStatus = status ? status.toUpperCase() : null;
    const uppercaseStage = stage ? stage.toUpperCase() : null;
    const queryBuilder = await this.itemReturnRequestRepo
      .createQueryBuilder('return_item_request')
      .leftJoinAndSelect('return_item_request.fromDepartment', 'fromDepartment')
      .leftJoinAndSelect('fromDepartment.location', 'fromLocation')
      .leftJoinAndSelect('return_item_request.toDepartment', 'toDepartment')
      .leftJoinAndSelect('toDepartment.location', 'toLocation')
      .leftJoinAndSelect('return_item_request.items', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .leftJoinAndSelect('items.sin', 'sin')
      .leftJoinAndSelect('sin.mir', 'mir')
      .where('return_item_request.isArchived = :isArchived', {
        isArchived: false,
      })
      .andWhere('return_item_request.status = :status', {
        status: RequestStatus.APPROVED,
      })
      .select([
        'return_item_request',
        'fromDepartment.name',
        'fromLocation',
        'toDepartment.name',
        'toLocation',
        'items',
        'item.id',
        'item.name',
        'item.description',
        'item.itemCode',
        'sin.id',
        'sin.sinNumber',
        'mir.id',
        'mir.mirNumber',
      ])
      .orderBy('return_item_request.createDateTime', 'DESC');

    if (!review) {
      queryBuilder.andWhere('fromDepartment.id = :id', { id: department });
    } else {
      queryBuilder.andWhere('toDepartment.id = :id', { id: department });
    }

    if (status) {
      queryBuilder.andWhere('return_item_request.status = :status', {
        status: uppercaseStatus,
      });
    }
    if (stage) {
      queryBuilder.andWhere('return_item_request.stage = :stage', {
        stage: uppercaseStage,
      });
    }
    if (createDateTime) {
      const createDateTimeFormatted = `${createDateTime}T00:00:00.000Z`;
      queryBuilder.andWhere(
        `DATE(return_item_request.createDateTime) = DATE(:createDateTime)`,
        {
          createDateTime: createDateTimeFormatted,
        },
      );
    }
    if (mrrCode) {
      queryBuilder.andWhere('return_item_request.mrrCode ILIKE :mrrCode', {
        mrrCode: `%${mrrCode}%`,
      });
    }

    if (search && mrrSearchFields.length > 0) {
      const whereConditions = mrrSearchFields
        .map((field) => {
          if (field === 'status' || field === 'stage') {
            return `return_item_request.${field}::text ILIKE :search`;
          } else {
            return `return_item_request.${field} ILIKE :search`;
          }
        })
        .join(' OR ');

      queryBuilder.andWhere(`(${whereConditions})`, { search: `%${search}%` });
    }

    const totalRows = await queryBuilder.getCount();

    const returnRequest = await queryBuilder.skip(skip).take(limit).getMany();

    const list = returnRequest.filter((request) => !!request);
    return { totalRows, list };
  }

  async deleteMrrById(id: string) {
    const returnRequest = await this.itemReturnRequestRepo.findOne({
      where: {
        id: id,
      },
    });

    if (returnRequest) {
      returnRequest.isArchived = true;
      await this.itemReturnRequestRepo.save(returnRequest);
    }

    return returnRequest;
  }

  async getMrrById(id: string) {
    const materialRequest = await this.itemReturnRequestRepo
      .createQueryBuilder('return_item_request')
      .leftJoinAndSelect('return_item_request.fromDepartment', 'fromDepartment')
      .leftJoinAndSelect('fromDepartment.location', 'fromLocation')
      .leftJoinAndSelect('return_item_request.toDepartment', 'toDepartment')
      .leftJoinAndSelect('toDepartment.location', 'toLocation')
      .leftJoinAndSelect('return_item_request.items', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .leftJoinAndSelect('items.sin', 'sin')
      .leftJoinAndSelect('sin.mir', 'mir')
      .where('return_item_request.isArchived = :isArchived', {
        isArchived: false,
      })
      .andWhere('return_item_request.id = :id', {
        id: id,
      })
      .select([
        'return_item_request',
        'fromDepartment.name',
        'fromLocation',
        'toDepartment.name',
        'toLocation',
        'items',
        'item.id',
        'item.name',
        'item.description',
        'item.itemCode',
        'sin.id',
        'sin.sinNumber',
        'mir.id',
        'mir.mirNumber',
      ])
      .getOne();

    for (const item of materialRequest.items) {
      const consumptions = await this.consumptionRepository
        .createQueryBuilder('consumption')
        .leftJoinAndSelect('consumption.itemsConsumption', 'itemsConsumption')
        .leftJoinAndSelect('itemsConsumption.item', 'item')
        .where('consumption.isArchived = :isArchived', { isArchived: false })
        .andWhere('consumption.sin = :id', { id: item?.sin?.id })
        .getMany();
      let total = 0;
      consumptions.map((con) => {
        const consumed = con.itemsConsumption.find(
          (entity) => entity.item.id === item?.item?.id,
        );
        consumed?.consumeQty ? (total = total + consumed.consumeQty) : total;
      });
      item['consumptionQty'] = total ?? 0;
    }
    return materialRequest;
  }

  async returnItems(data: MaterialAcceptDTO, userId: string) {
    const materialRequest = await this.itemReturnRequestRepo.findOne({
      where: {
        id: data.mrrlId,
        isArchived: false,
      },
      relations: ['toDepartment', 'fromDepartment'],
    });
    if (materialRequest) {
      for (const item of data.items) {
        // const itemData = await this.itemReturnRepo.findOne({
        //   where: {
        //     item: { id: item.itemId },
        //     returnItemRequest: { id: materialRequest.id },
        //   },
        // });
        const itemData = await this.itemReturnRepo
          .createQueryBuilder('return_request_items')
          .leftJoinAndSelect('return_request_items.item', 'item')
          .leftJoinAndSelect(
            'return_request_items.returnItemRequest',
            'returnItemRequest',
          )
          .where('item.id = :itemId', { itemId: item.itemId })
          .andWhere('returnItemRequest.id =:id', { id: materialRequest.id })
          .getOne();
        itemData.returnQuantity = item.returnQty;
        itemData.estimatedPrice = item.estimatedPrice;
        await this.itemReturnRepo.save(itemData);
        await this.inventory.reduceInventory(
          item.itemId,
          item.returnQty,
          materialRequest.fromDepartment.id,
          InventoryType.SELF,
        );
        if (itemData.returnReason === ReturnReasonType.RETURN) {
          await this.inventory.addItemToStoreInventory(
            data.items,
            materialRequest.toDepartment.id,
            InventoryType.STORAGE,
          );
        }
      }
      materialRequest.stage = RequestStage.COMPLETED;
      materialRequest.status = RequestStatus.APPROVED;
      await this.itemReturnRequestRepo.save(materialRequest);
    }
    await this.tracking.create({
      userId: userId,
      action: TrackingActionType.STORE_ACCEPT,
      type: TrackingType.MRR,
      mrrId: materialRequest.id,
    });
    return materialRequest;
  }
}
