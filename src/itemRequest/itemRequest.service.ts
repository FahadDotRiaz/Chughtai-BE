import {
  ForbiddenException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { MaterialRequest } from '../entities/MaterialRequest.entity';
import { ItemRequestDTO } from './dto/item.request.dto';
import { ItemRequestItem } from '../entities/itemRequestItem.entity';
import { ItemService } from '../item/item.service';
import { UserService } from 'src/users/user.service';
import {
  TrackingActionType,
  TrackingType,
  CustomItemStatus,
  InventoryType,
  RequestStage,
  RequestStatus,
  MirMenuType,
  DepartmentType,
} from 'src/utils/constant';
import { InventoryService } from 'src/inventory/inventory.service';
import {
  generateFormatDate,
  generateRandomNumber,
  generateTimeFormat,
} from 'src/utils/helper';
import { MaterialIssueDTO, StatusDto } from './dto/issued.dto';
import { StoreIssuedNote } from '../entities/storeIssueNote.entity';
import { StoreIssuedNoteService } from 'src/sin/sin.service';
import { Consumption } from 'src/entities/consumption.entity';
import { PaginationDto, QueryDto, SinQueryDto } from './dto/query.dto';
import { mirSearchFields } from 'src/utils/searchColumn';
import { TrackingService } from 'src/tracking/tracking.service';
import { Item } from 'src/entities/item.entity';
import { DepartmentService } from 'src/department/department.service';
import { NotificationService } from 'src/notification/notification.service';
import { DepartmentUpdateDTO } from './dto/departmentReview.dto';

@Injectable()
export class ItemRequestService {
  constructor(
    @Inject(forwardRef(() => DepartmentService))
    private readonly departmentRepo: DepartmentService,
    @InjectRepository(MaterialRequest)
    private readonly itemRequestRepository: Repository<MaterialRequest>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(ItemRequestItem)
    private readonly itemRequestItemRepository: Repository<ItemRequestItem>,
    @InjectRepository(StoreIssuedNote)
    private readonly sinRepo: Repository<StoreIssuedNote>,
    @InjectRepository(Consumption)
    private readonly consumption: Repository<Consumption>,
    @Inject(forwardRef(() => ItemService))
    private readonly itemRepo: ItemService,
    @Inject(forwardRef(() => UserService))
    private readonly userRepo: UserService,
    @Inject(forwardRef(() => InventoryService))
    private readonly inventory: InventoryService,
    @Inject(forwardRef(() => StoreIssuedNoteService))
    private readonly sin: StoreIssuedNoteService,
    @Inject(forwardRef(() => TrackingService))
    private readonly tracking: TrackingService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notification: NotificationService,
  ) {}

  async sendNotification(
    mirId: string,
    approved: boolean,
    department: any,
    status: RequestStatus,
    date: Date,
    hasItemWithDepartment: boolean,
  ) {
    const { id, name, managedBy, mirApproval } = department;
    const formattedDate = date.toLocaleString();
    !mirId && !approved && mirApproval
      ? this.notification.sendingNotificationToAllUsers(
          {
            message: `${name} MIR created`,
            date: formattedDate,
          },
          id,
          MirMenuType.MIR_REVIEW,
        )
      : (!approved && mirId) || (approved && mirId)
        ? status === RequestStatus.APPROVED
          ? (this.notification.sendingNotificationToAllUsers(
              {
                message: `${name} mir approved by HOD`,
                date: formattedDate,
              },
              id,
              MirMenuType.MIR_GENERATE,
            ),
            this.notification.sendingNotificationToAllUsers(
              {
                message: `${name} mir approved by HOD`,
                date: formattedDate,
              },
              managedBy.id,
              hasItemWithDepartment
                ? MirMenuType.MIR_DEPARTMENT_REVIEW
                : MirMenuType.MIR_ISSUE,
            ))
          : status === RequestStatus.REJECTED
            ? this.notification.sendingNotificationToAllUsers(
                {
                  message: `${name} mir rejected by HOD`,
                  date: formattedDate,
                },
                id,
                MirMenuType.MIR_GENERATE,
              )
            : null
        : !mirId && !approved && !mirApproval
          ? this.notification.sendingNotificationToAllUsers(
              {
                message: `You have received mir request from ${name}`,
                date: formattedDate,
              },
              managedBy.id,
              MirMenuType.MIR_ISSUE,
            )
          : null;
  }

  async createItemRequest(
    itemRequestDto: ItemRequestDTO,
    userId: string,
    id: string = null,
    approved = false,
  ) {
    const existingMIR = id
      ? await this.itemRequestRepository.findOne({
          where: { id: id, isArchived: false },
          relations: ['items', 'items.item'],
        })
      : undefined;
    const fromDepartment = { id: itemRequestDto.fromDepartment };
    const getLocation = await this.departmentRepo.getDepartmentById(
      itemRequestDto.fromDepartment,
    );
    const mirApproval = getLocation.mirApproval;
    const mirItemReview = getLocation.mirItemReview;
    let toDepartment = {};
    if (getLocation.type == DepartmentType.Store) {
      toDepartment = { id: getLocation.id };
    } else {
      toDepartment = { id: getLocation.managedBy.id };
    }
    const createdBy = { id: userId };
    // const inventory = await this.inventory.viewInventory(toDepartment.id);
    const mappedItems = itemRequestDto.items.map((item) => ({
      quantity: item.quantity,
      pending: item.quantity,
      issuedQuantity: 0,
      approvedQuantity: approved ? 0 : item.approvedQuantity,
      item: { id: item.itemId },
    }));
    const mappedCustomItems = itemRequestDto.customItems?.map(
      async (customItem) => {
        const mappedItem: any = {
          description: customItem.description,
          images: customItem.images.map((image) => image.file),
          remarks: customItem.remarks,
        };
        if (!id) {
          mappedItem.itemId = generateRandomNumber(6);
          mappedItem.suggestedStatus = CustomItemStatus.PENDING;
        } else {
          mappedItem.suggestedStatus = customItem.status;
          mappedItem.itemId = generateRandomNumber(6);
          if (customItem?.acceptedItemId) {
            mappedItem.acceptedItem = { id: customItem.acceptedItemId };
          }
          if (
            customItem.suggestedItems &&
            customItem.suggestedItems.length > 0
          ) {
            mappedItem.suggestedItems = await Promise.all(
              customItem.suggestedItems.map(async (id) => {
                return await this.itemRepository.findOne({
                  where: {
                    id: id,
                    isArchived: false,
                  },
                });
              }),
            );
          }
        }
        return mappedItem;
      },
    );

    const hasItemWithDepartment = await this.itemRepo.hasItemWithDepartment(
      itemRequestDto.items,
    );
    const mappedItemRequestDto: DeepPartial<MaterialRequest> = {
      ...itemRequestDto,
      mirNumber: id
        ? existingMIR.mirNumber
        : generateRandomNumber(6).toString(),
      reqNo: id ? existingMIR.reqNo : generateRandomNumber(5).toString(),
      fromDepartment: fromDepartment,
      toDepartment: toDepartment,
      items: mappedItems,
      customItems: await Promise.all(mappedCustomItems),
      createdBy: createdBy,
      isReview: id ? existingMIR.isReview : mirApproval,
      stage:
        id && !approved
          ? existingMIR.stage
          : !approved && mirApproval
            ? RequestStage.HOD_APPROVAL
            : approved && itemRequestDto.status === RequestStatus.REJECTED
              ? existingMIR.stage
              : hasItemWithDepartment && mirItemReview
                ? RequestStage.DEPARTMENT_APPROVAL
                : RequestStage.STORE_APPROVAL,
    };
    if (approved && itemRequestDto.status) {
      mappedItemRequestDto['status'] =
        itemRequestDto.status === RequestStatus.APPROVED
          ? RequestStatus.PENDING
          : RequestStatus.REJECTED;
    }

    const newItemRequest = existingMIR
      ? this.itemRequestRepository.merge(existingMIR, mappedItemRequestDto)
      : this.itemRequestRepository.create(mappedItemRequestDto);

    newItemRequest.items = await Promise.all(
      mappedItems.map(async (item) => {
        const alreadyExist = item?.item?.id
          ? await this.itemRequestItemRepository
              .createQueryBuilder('item_request_items')
              .leftJoinAndSelect('item_request_items.item', 'item')
              .leftJoinAndSelect(
                'item_request_items.materialRequest',
                'materialRequest',
              )
              .where('item.id = :itemId', { itemId: item?.item?.id })
              .andWhere('materialRequest.id =:id', { id: existingMIR?.id })
              .getOne()
          : undefined;
        const itemRequestItem = alreadyExist
          ? this.itemRequestItemRepository.merge(alreadyExist, item)
          : this.itemRequestItemRepository.create(item);
        itemRequestItem.materialRequest = newItemRequest;
        return itemRequestItem;
      }),
    );
    const result = await this.itemRequestRepository.save(newItemRequest);
    this.sendNotification(
      id,
      approved,
      getLocation,
      itemRequestDto.status,
      result.createDateTime,
      hasItemWithDepartment,
    );
    const action = !existingMIR
      ? TrackingActionType.USER_CREATED
      : approved
        ? existingMIR.status === 'REJECTED'
          ? TrackingActionType.HOD_REJECTED
          : TrackingActionType.HOD_APPROVED
        : TrackingActionType.USER_UPDATED;
    this.tracking.create({
      action: action,
      userId: userId,
      mirId: result.id,
      type: TrackingType.MIR,
      isReview: mirApproval,
    });
    return result;
  }

  async departmentUpdate(
    id: string,
    request: DepartmentUpdateDTO,
    userId: string,
  ): Promise<any> {
    const mir = await this.itemRequestRepository
      .createQueryBuilder('item_request')
      .leftJoinAndSelect('item_request_items.fromDepartment', 'fromDepartment')
      .where('item_request.id = :id', { id: id })
      .andWhere('item_request.isArchived =:isArchived', { isArchived: false })
      .getOne();

    const getLocation = await this.departmentRepo.getDepartmentById(
      mir.fromDepartment.id,
    );

    const mirItemReview = getLocation.mirItemReview;

    const item = await this.itemRequestItemRepository
      .createQueryBuilder('item_request_items')
      .leftJoinAndSelect('item_request_items.item', 'item')
      .leftJoinAndSelect(
        'item_request_items.materialRequest',
        'materialRequest',
      )
      .where('item.id = :itemId', { itemId: request.itemId })
      .andWhere('materialRequest.id =:id', { id: id })
      .getOne();
    const suggestedItem = await this.itemRepository.findOne({
      where: { id: request.suggestedItemId, isArchived: false },
    });
    this.tracking.create({
      action: TrackingActionType.ITEM_HOD_REVIEWED,
      userId: userId,
      mirId: mir.id,
      type: TrackingType.MIR,
      isItemReview: mirItemReview,
    });
    const formattedDate = new Date().toLocaleString();
    this.notification.sendingNotificationToAllUsers(
      {
        message: `${mir.fromDepartment.name} mir approved by Item depertment HOD`,
        date: formattedDate,
      },
      id,
      MirMenuType.MIR_GENERATE,
    ),
      this.notification.sendingNotificationToAllUsers(
        {
          message: `${mir.fromDepartment.name} mir approved by Item depertment HOD`,
          date: formattedDate,
        },
        userId,
        MirMenuType.MIR_ISSUE,
      );
    item.suggestedQty = request.suggestedQty;
    item.suggestedItem = suggestedItem;
    mir.stage = RequestStage.STORE_APPROVAL;
    await this.itemRequestRepository.save(mir);
    return await this.itemRequestItemRepository.save(item);
  }
  async getItemRequests(
    userId: string,
    location: string,
    review: boolean,
    query: QueryDto,
    pagination: PaginationDto,
    hodReview = false,
    departmentReview = false,
  ): Promise<any> {
    const currentDate = generateFormatDate();
    const currentTime = generateTimeFormat();
    const {
      status,
      stage,
      mirNumber,
      toDepartment,
      fromDepartment,
      search,
      createDateTime,
      isSuggested,
    } = query;
    const { page, limit } = pagination;
    const skip = (Number(page ?? 1) - 1) * Number(limit ?? 10) ?? 10;
    const uppercaseStatus = status ? status.toUpperCase() : null;
    const uppercaseStage = stage ? stage.toUpperCase() : null;
    const queryBuilder = this.itemRequestRepository
      .createQueryBuilder('item_request')
      .leftJoinAndSelect('item_request.fromDepartment', 'fromDepartment')
      .leftJoinAndSelect('fromDepartment.location', 'fromLocation')
      .leftJoinAndSelect('item_request.toDepartment', 'toDepartment')
      .leftJoinAndSelect('toDepartment.location', 'toLocation')
      .leftJoinAndSelect('item_request.items', 'items')
      .leftJoinAndSelect('items.item', 'itemDepartment')
      .where('item_request.isArchived = :isArchived', {
        isArchived: false,
      })
      .orderBy('item_request.createDateTime', 'DESC');
    if (isSuggested) {
      queryBuilder.andWhere('JSON_ARRAY_LENGTH(item_request.customItems) > 0');
      queryBuilder.andWhere(
        'item_request."customItems"::text LIKE \'%"suggestedDate":%\'',
      );
    }
    if (!review) {
      queryBuilder.andWhere('fromDepartment.id = :id', { id: location });
    } else {
      if (hodReview) {
        queryBuilder.andWhere('fromDepartment.id = :id', { id: location });
        queryBuilder.andWhere(
          '(item_request.stage = :storeApproval OR item_request.stage = :complete OR item_request.stage = :hodApproval)',
          {
            storeApproval: RequestStage.STORE_APPROVAL,
            complete: RequestStage.COMPLETED,
            hodApproval: RequestStage.HOD_APPROVAL,
          },
        );
        queryBuilder.andWhere('item_request.isReview = :isReview', {
          isReview: true,
        });
      } else {
        queryBuilder.andWhere('toDepartment.id = :id', { id: location });
        queryBuilder.andWhere(
          '(item_request.stage = :storeApproval OR item_request.stage = :complete)',
          {
            storeApproval: RequestStage.STORE_APPROVAL,
            complete: RequestStage.COMPLETED,
          },
        );
      }
      queryBuilder.andWhere(
        '(item_request.scheduledDate <= :currentDate OR item_request.isScheduled = :isScheduled)',
        {
          currentDate: currentDate,
          isScheduled: false,
        },
      );
      queryBuilder.andWhere(
        '(item_request.scheduledTime <= :currentTime OR item_request.isScheduled = :isScheduled)',
        {
          currentTime: currentTime,
          isScheduled: false,
        },
      );
    }
    if (status) {
      queryBuilder.andWhere('item_request.status = :status', {
        status: uppercaseStatus,
      });
    }
    if (stage) {
      queryBuilder.andWhere('item_request.stage = :stage', {
        stage: uppercaseStage,
      });
    }
    if (createDateTime) {
      const createDateTimeFormatted = `${createDateTime}T00:00:00.000Z`;
      queryBuilder.andWhere(
        `DATE(item_request.createDateTime) = DATE(:createDateTime)`,
        {
          createDateTime: createDateTimeFormatted,
        },
      );
    }
    if (mirNumber) {
      queryBuilder.andWhere('item_request.mirNumber ILIKE :mirNumber', {
        mirNumber: `%${mirNumber}%`,
      });
    }
    if (toDepartment) {
      queryBuilder.andWhere('toDepartment.name = :name', {
        name: toDepartment,
      });
    }
    if (fromDepartment) {
      queryBuilder.andWhere('fromDepartment.name = :name', {
        name: fromDepartment,
      });
    }
    if (createDateTime) {
      const createDateTimeFormatted = `${createDateTime}T00:00:00.000Z`;
      queryBuilder.andWhere('item_request.createDateTime >= :createDateTime', {
        createDateTime: createDateTimeFormatted,
      });
    }
    if (search && mirSearchFields.length > 0) {
      const whereConditions = mirSearchFields
        .map((field) => {
          if (field === 'status' || field === 'stage') {
            return `item_request.${field}::text ILIKE :search`;
          } else {
            return `item_request.${field} ILIKE :search`;
          }
        })
        .join(' OR ');

      queryBuilder.andWhere(`(${whereConditions})`, { search: `%${search}%` });
    }

    // Get total count without applying skip and limit
    const totalRows = await queryBuilder.getCount();

    // Get the data
    const list = await queryBuilder.skip(skip).take(limit).getMany();

    const inventoryPromises = list.map(async (item) => {
      const inventory = await this.inventory.viewInventoryView(
        item.toDepartment.id,
      );
      return inventory;
    });
    const inventories = await Promise.all(inventoryPromises);

    list.forEach((item, index) => {
      const inventory = inventories[index];
      item?.items?.forEach(async (entity, entityIndex) => {
        if (departmentReview) {
          const departmentItem = await this.itemRepo.hasItemWithDepartment([
            entity.item,
          ]);
          if (!departmentItem) {
            item.items.splice(entityIndex, 1);
          }
        } else {
          entity.totalInventoryQty = inventory?.inventoryItems?.find(
            (itemEntity) => itemEntity.item.id === entity.item.id,
          )?.quantity;
        }
      });
    });
    return { totalRows, list };
  }
  async hodApproval(id: string) {
    const materialRequest = await this.itemRequestRepository.findOne({
      where: {
        id: id,
        isArchived: false,
      },
    });
    if (materialRequest) {
      materialRequest.stage = RequestStage.STORE_APPROVAL;
      await this.itemRequestRepository.save(materialRequest);
    }
    return materialRequest;
  }

  async issuedItems(data: MaterialIssueDTO, userId: string) {
    const materialRequest = await this.itemRequestRepository.findOne({
      where: {
        id: data.mirlId,
        isArchived: false,
      },
      relations: ['toDepartment', 'fromDepartment'],
    });
    if (materialRequest.stage != RequestStage.STORE_APPROVAL) {
      throw new ForbiddenException('Need Approval by HOD');
    }

    const { customItems } = data;
    let update = null;
    for (const customItem of customItems) {
      update = materialRequest?.customItems?.find(
        (item) => item?.itemId === customItem?.itemId,
      );
      for (const suggestion of customItem.suggestedItems) {
        const item = await this.itemRepository.findOne({
          where: {
            id: suggestion,
            isArchived: false,
          },
        });
        if (update) {
          if (!update['suggestedItems']) {
            update['suggestedItems'] = [];
          }
          update['suggestedItems'].push(item);
          update['suggestedDate'] = new Date();
        }
      }
    }

    const partial = [];
    if (materialRequest) {
      for (const item of data.items) {
        const itemData = await this.itemRequestItemRepository.findOne({
          where: {
            item: { id: item.itemId },
            materialRequest: { id: materialRequest.id },
          },
        });
        // itemData.issuedQuantity = item.issuedQty ?? itemData.quantity;
        if (item.issuedQty && item.issuedQty > 0) {
          try {
            const inventory = await this.inventory.reduceInventory(
              item.itemId,
              item.issuedQty,
              materialRequest.toDepartment.id,
              InventoryType.STORAGE,
            );
            item.totalIssue = itemData.issuedQuantity + item.issuedQty;
            item.totalRequested = itemData?.quantity;
            item.totalCancel = itemData?.cancel
              ? itemData.cancel + item.cancel
              : item.cancel;
            itemData.totalInventoryQty = inventory?.quantity || 0;
            itemData.issuedQuantity = itemData.issuedQuantity + item.issuedQty;
            itemData.cancel = itemData?.cancel
              ? itemData.cancel + item.cancel
              : item.cancel;
            itemData.pending =
              itemData?.pending &&
              itemData.pending - (item.issuedQty + item.cancel);
            itemData.balance = item?.balance;
            if (itemData.pending == 0) {
              partial.push('partial');
            }
            await this.itemRequestItemRepository.save(itemData);
          } catch (err) {
            throw err;
          }
        }
        if (item.issuedQty == 0) {
          partial.push('partial');
        }
      }
      await this.inventory.addItemToStoreInventory(
        data.items,
        materialRequest.fromDepartment.id,
        InventoryType.SELF,
      );
      if (partial.length === data.items.length) {
        materialRequest.stage = RequestStage.COMPLETED;
        materialRequest.status = RequestStatus.ISSUED;
      } else {
        materialRequest.status = RequestStatus.PARTIAL_ISSUED;
      }
      await this.sin.createStoreIssuedNote(data);
      const mergedMaterialRequest = { ...materialRequest, ...update };
      await this.itemRequestRepository.save(mergedMaterialRequest);
    }
    if (materialRequest.status === RequestStatus.PARTIAL_ISSUED) {
      await this.notification.sendingNotificationToAllUsers(
        {
          message: 'MIR Partially issued',
          date: new Date().toLocaleString(),
        },
        materialRequest.fromDepartment.id,
        'item_requisition_form_issue',
      );
    }
    if (materialRequest.status === RequestStatus.APPROVED) {
      await this.notification.sendingNotificationToAllUsers(
        {
          message: 'MIR Approved by store',
          date: new Date().toLocaleString(),
        },
        materialRequest.fromDepartment.id,
        'item_requisition_form_issue',
      );
    }
    this.tracking.create({
      action: TrackingActionType.STORE_ISSUED,
      userId: userId,
      mirId: materialRequest.id,
      type: TrackingType.MIR,
    });
    return materialRequest;
  }

  async customItemActions(data: StatusDto) {
    const { mirId, customItemId, itemId } = data;
    const materialRequest = await this.itemRequestRepository.findOne({
      where: {
        id: mirId,
        isArchived: false,
      },
      relations: ['toDepartment', 'fromDepartment'],
    });
    const customItem = materialRequest.customItems.find(
      (item) => item.itemId === customItemId,
    );
    const acceptedItem = customItem.suggestedItems.find(
      (item) => item.id === itemId,
    );

    if (acceptedItem) {
      customItem.acceptedItem = acceptedItem;
      customItem.suggestedStatus = CustomItemStatus.APPROVED;
    } else {
      customItem.suggestedStatus = CustomItemStatus.REJECT;
    }
    const mergedMaterialRequest = { ...materialRequest, ...customItem };
    await this.itemRequestRepository.save(mergedMaterialRequest);
    return materialRequest;
  }

  async getMirById(id: string) {
    const materialRequest = await this.itemRequestRepository
      .createQueryBuilder('item_request')
      .leftJoinAndSelect('item_request.toDepartment', 'toDepartment')
      .leftJoinAndSelect('toDepartment.location', 'toLocation')
      .leftJoinAndSelect('item_request.fromDepartment', 'fromDepartment')
      .leftJoinAndSelect('fromDepartment.location', 'fromLocation')
      .leftJoinAndSelect('item_request.items', 'items')
      // .leftJoinAndSelect('item_request.customItems.suggestedItems', 'suggestedItems')
      .leftJoinAndSelect('items.item', 'itemDepartment')
      .where('item_request.id = :id', { id: id })
      .andWhere('item_request.isArchived = :isArchived', { isArchived: false })
      .getOne();

    const inventory = await this.inventory.viewInventoryView(
      materialRequest.toDepartment.id,
    );
    materialRequest?.items?.forEach((entity) => {
      entity.totalInventoryQty =
        inventory?.inventoryItems?.find(
          (itemEntity) => itemEntity.item.id === entity.item.id,
        )?.quantity || 0;
    });
    return materialRequest;
  }
  async deleteMirById(id: string) {
    const materialRequest = await this.itemRequestRepository.findOne({
      where: {
        id: id,
      },
    });

    if (materialRequest) {
      materialRequest.status = RequestStatus.CANCELLED;
      await this.itemRequestRepository.save(materialRequest);
    }
    return materialRequest;
  }

  async verionHistory(mirId: string, query: SinQueryDto) {
    const { sinId } = query;
    let materialRequestQuery = this.itemRequestRepository
      .createQueryBuilder('item_request')
      .leftJoinAndSelect('item_request.items', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .leftJoinAndSelect('item_request.sin', 'sin')
      .leftJoinAndSelect('sin.sinItems', 'sinItems')
      .leftJoinAndSelect('sinItems.item', 'sinItem')
      .andWhere('item_request.id = :id', { id: mirId })
      .andWhere('item_request.isArchived = :isArchived', { isArchived: false })
      .orderBy('item_request.createDateTime', 'DESC');

    if (sinId) {
      materialRequestQuery = materialRequestQuery.andWhere('sin.id = :sinId', {
        sinId,
      });
    }

    const materialRequest = await materialRequestQuery.getOne();

    return materialRequest;
  }

  async getItemDetails(itemId: string, departmentId: string) {
    const materialRequest = await this.itemRequestRepository
      .createQueryBuilder('item_request')
      .leftJoinAndSelect('item_request.toDepartment', 'toDepartment')
      .leftJoinAndSelect('toDepartment.location', 'toLocation')
      .leftJoinAndSelect('item_request.items', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .andWhere('item.id = :itemId', { itemId })
      .andWhere('item_request.isArchived = :isArchived', { isArchived: false })
      .andWhere('toDepartment.id = :id', { id: departmentId })
      .select(['item_request', 'items.quantity', 'item'])
      .getMany();
    materialRequest.filter((entity) => {
      entity.items.find((item) => item.item.id == itemId)[0];
    });

    const sinsItems = await this.sinRepo
      .createQueryBuilder('store_issued_note')
      .leftJoinAndSelect('store_issued_note.sinItems', 'sinItems')
      .leftJoinAndSelect('sinItems.item', 'item')
      .andWhere('item.id = :itemId', { itemId })
      .andWhere('store_issued_note.isArchived = :isArchived', {
        isArchived: false,
      })
      .select(['store_issued_note', 'sinItems.quantity', 'item'])
      .getMany();

    sinsItems.filter((entity) => {
      entity.sinItems.find((item) => item.item.id == itemId)[0];
    });

    const consumptionItems = await this.consumption
      .createQueryBuilder('consumption')
      .leftJoinAndSelect('consumption.itemsConsumption', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .andWhere('item.id = :itemId', { itemId })
      .select(['consumption', 'items.consumeQty', 'item'])
      .getMany();
    consumptionItems.filter((entity) => {
      entity.itemsConsumption.find((item) => item.item.id == itemId)[0];
    });

    return {
      mirItems: materialRequest,
      sinItems: sinsItems,
      consumptionItems: consumptionItems,
    };
  }
}
