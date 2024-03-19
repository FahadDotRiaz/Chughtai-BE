import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Consumption } from '../entities/consumption.entity';
import { DeepPartial, Repository } from 'typeorm';
import { CreateConsumptionDTO } from './dto/create.dto';
import { ItemConsumption } from '../entities/itemConsumption.entity';
import { InventoryService } from '../inventory/inventory.service';
import { UpdateConsumptionDto } from './dto/update.dto';
import { generateRandomNumber } from 'src/utils/helper';
import {
  DepartmentPaginationDto,
  PaginationDto,
  QueryDto,
} from './dto/query.dto';
import { consumptionSearchFields } from 'src/utils/searchColumn';
import { InventoryType } from 'src/utils/constant';

@Injectable()
export class ConsumptionService {
  constructor(
    @InjectRepository(Consumption)
    private readonly consumptionRepository: Repository<Consumption>,
    @InjectRepository(ItemConsumption)
    private readonly itemConsumption: Repository<ItemConsumption>,
    @Inject(forwardRef(() => InventoryService))
    private readonly inventory: InventoryService,
  ) {}

  async getConsumptionById(id: string): Promise<Consumption> {
    const consumption = await this.consumptionRepository.findOne({
      where: { id: id, isArchived: false },
      relations: [
        'itemsConsumption',
        'department',
        'sin',
        'itemsConsumption.item',
      ],
    });
    if (!consumption) {
      throw new NotFoundException(`Consumption with ID ${id} not found`);
    }

    return consumption;
  }

  async createConsumption(
    createConsumptionDto: CreateConsumptionDTO | UpdateConsumptionDto,
    id: string | null,
  ): Promise<Consumption> {
    try {
      const consumption = id && (await this.getConsumptionById(id));
      const department = { id: createConsumptionDto.departmentId };
      const sin = { id: createConsumptionDto.sin };
      const consumptionCode = !id
        ? generateRandomNumber(6).toString()
        : createConsumptionDto.consumptionCode;
      const mappedItems = createConsumptionDto.items.map((item) => ({
        consumeQty: item.consumeQty,
        sinTotal: item.sinTotal,
        item: { id: item.itemId },
        patients: item.patients,
        total: 0,
      }));
      const mappedItemRequestDto: DeepPartial<Consumption> = {
        ...createConsumptionDto,
        department,
        sin,
        consumptionCode,
        itemsConsumption: mappedItems,
        remarks: createConsumptionDto.remarks,
      };
      const newItemRequest = consumption
        ? this.consumptionRepository.merge(consumption, mappedItemRequestDto)
        : this.consumptionRepository.create(mappedItemRequestDto);
      newItemRequest.itemsConsumption = await Promise.all(
        mappedItems.map(async (item) => {
          const alreadyExist = item?.item.id
            ? await this.itemConsumption
                .createQueryBuilder('item_consumption')
                .leftJoinAndSelect('item_consumption.item', 'item')
                .leftJoinAndSelect(
                  'item_consumption.consumption',
                  'consumption',
                )
                .where('item.id = :itemId', { itemId: item?.item?.id })
                .andWhere('consumption.id =:id', { id: consumption?.id })
                .getOne()
            : undefined;
          const itemRequestItem = alreadyExist
            ? this.itemConsumption.merge(alreadyExist, item)
            : this.itemConsumption.create(item);
          try {
            if (item.consumeQty > itemRequestItem.consumeQty) {
              const inventoryData = await this.inventory.reduceInventory(
                item.item.id,
                item.consumeQty - itemRequestItem.consumeQty,
                createConsumptionDto.departmentId,
                InventoryType.SELF,
              );
              itemRequestItem.total = inventoryData.quantity;
            }
            if (item.consumeQty < itemRequestItem.consumeQty) {
              await this.inventory.addItemToStoreInventory(
                [
                  {
                    itemId: item.item.id,
                    issuedQty: itemRequestItem.consumeQty - item.consumeQty,
                  },
                ],
                createConsumptionDto.departmentId,
                InventoryType.SELF,
              );

              itemRequestItem.total =
                itemRequestItem.total +
                (itemRequestItem.consumeQty - item.consumeQty);
            }
            if (alreadyExist) {
              itemRequestItem.consumeQty = item.consumeQty;
              itemRequestItem.patients = item?.patients;
            }
            itemRequestItem.consumption = newItemRequest;
          } catch (err) {
            throw err;
          }
          return itemRequestItem;
        }),
      );
      const result = await this.consumptionRepository.save(newItemRequest);
      return result;
    } catch (err) {
      throw err;
    }
  }

  async getConsumptionRequests(
    department: string,
    query: QueryDto,
    pagination: PaginationDto,
  ): Promise<any> {
    const { page, limit } = pagination;
    const { consumptionCode, remarks, createDateTime, search } = query;
    const skip = ((page ?? 1) - 1) * (limit ?? 10);

    // Create the initial query builder
    const queryBuilder = this.consumptionRepository
      .createQueryBuilder('consumption')
      .leftJoinAndSelect('consumption.itemsConsumption', 'itemsConsumption')
      .leftJoinAndSelect('itemsConsumption.item', 'item')
      .where('consumption.isArchived = :isArchived', { isArchived: false })
      .andWhere('consumption.department = :department', {
        department: department,
      })
      .orderBy('consumption.createDateTime', 'DESC');

    if (remarks) {
      queryBuilder.andWhere('consumption.remarks ILIKE :remarks', {
        remarks,
      });
    }
    if (consumptionCode) {
      queryBuilder.andWhere(
        'consumption.consumptionCode ILIKE :consumptionCode',
        {
          consumptionCode,
        },
      );
    }

    if (createDateTime) {
      const createDateTimeFormatted = `${createDateTime}T00:00:00.000Z`;
      queryBuilder.andWhere(
        `DATE(consumption.createDateTime) = DATE(:createDateTime)`,
        {
          createDateTime: createDateTimeFormatted,
        },
      );
    }

    if (search && consumptionSearchFields.length > 0) {
      const whereConditions = consumptionSearchFields
        .map((field) => {
          return `consumption.${field} ILIKE :search`;
        })
        .join(' OR ');

      queryBuilder.andWhere(`(${whereConditions})`, { search: `%${search}%` });
    }
    // Get total count without applying skip and limit
    const totalRows = await queryBuilder.getCount();
    await queryBuilder.skip(skip).take(limit);
    // Apply skip and take
    const list = await queryBuilder.getMany();

    // Return data along with metadata
    return { totalRows, list };
  }

  async getDepartmentConsumption(
    id: string,
    query: DepartmentPaginationDto,
    pagination: PaginationDto,
  ): Promise<any> {
    const {
      storeId,
      name,
      consumptionCode,
      remarks,
      createDateTime,
      search,
      type,
    } = query;
    const { page, limit } = pagination;
    const skip = ((page ?? 1) - 1) * (limit ?? 10);
    const queryBuilder = this.consumptionRepository
      .createQueryBuilder('consumption')
      .leftJoinAndSelect('consumption.sin', 'sin')
      .leftJoinAndSelect('consumption.itemsConsumption', 'itemsConsumption')
      .leftJoinAndSelect('consumption.department', 'department')
      .leftJoinAndSelect('itemsConsumption.item', 'item')
      .where('department.managedBy = :id', { id })
      .andWhere('consumption.isArchived = :isArchived', { isArchived: false })
      .orderBy('consumption.createDateTime', 'DESC');

    if (storeId) {
      queryBuilder.andWhere('department.id = :storeId', {
        storeId,
      });
    }
    if (consumptionCode) {
      queryBuilder.andWhere('consumption.consumptionCode = :consumptionCode', {
        consumptionCode,
      });
    }
    if (remarks) {
      queryBuilder.andWhere('consumption.remarks ILIKE :remarks', {
        remarks,
      });
    }
    if (name) {
      queryBuilder.andWhere('department.name ILIKE :name', {
        name,
      });
    }

    if (type) {
      queryBuilder.andWhere('department.type = :type', {
        type,
      });
    }
    if (createDateTime) {
      const createDateTimeFormatted = `${createDateTime}T00:00:00.000Z`;
      queryBuilder.andWhere(
        `DATE(consumption.createDateTime) = DATE(:createDateTime)`,
        {
          createDateTime: createDateTimeFormatted,
        },
      );
    }
    if (search && consumptionSearchFields.length > 0) {
      const whereConditions = consumptionSearchFields
        .map((field) => {
          if (field === 'type' || field === 'name') {
            return `department.${field}::text ILIKE :search`;
          } else {
            return `consumption.${field} ILIKE :search`;
          }
        })
        .join(' OR ');

      queryBuilder.andWhere(`(${whereConditions})`, { search: `%${search}%` });
    }
    const totalRows = await queryBuilder.getCount();
    const list = await queryBuilder.skip(skip).take(limit).getMany();

    return { totalRows, list };
  }

  async deleteConsumption(id: string): Promise<any> {
    const consumption = await this.getConsumptionById(id);

    if (consumption) {
      consumption.isArchived = true;
      await this.consumptionRepository.save(consumption);
    }

    return consumption;
  }
}
