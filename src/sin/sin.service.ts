// store-issued-note.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreIssuedNote } from 'src/entities/storeIssueNote.entity';
import { DeepPartial, Repository } from 'typeorm';
// import { CreateStoreIssuedNoteDTO } from './dto/createSin.dto';
import { SinItems } from '../entities/sinItems.entity';
import { generateRandomNumber } from 'src/utils/helper';
import { MaterialIssueDTO } from 'src/itemRequest/dto/issued.dto';
import { Consumption } from 'src/entities/consumption.entity';
import { PaginationDto, QueryDto } from './dto/query.dto';
import { ReturnItemRequest } from 'src/entities/returnItemRequest.entity';

@Injectable()
export class StoreIssuedNoteService {
  constructor(
    @InjectRepository(StoreIssuedNote)
    private storeIssuedNoteRepository: Repository<StoreIssuedNote>,
    @InjectRepository(Consumption)
    private consumptionRepository: Repository<Consumption>,
    @InjectRepository(ReturnItemRequest)
    private returnRequest: Repository<ReturnItemRequest>,
    @InjectRepository(SinItems)
    private sinItemsRepo: Repository<SinItems>,
  ) {}

  async createStoreIssuedNote(
    request: MaterialIssueDTO,
  ): Promise<StoreIssuedNote> {
    const sin = generateRandomNumber(6).toString();
    const mir = { id: request.mirlId };
    const mappedItems = request.items.map((item) => ({
      quantity: item.issuedQty,
      balance: item.balance,
      cancel: item.cancel,
      pending: item.pending,
      totalIssue: item.totalIssue,
      totalCancel: item.totalCancel,
      totalRequested: item.totalRequested,
      item: { id: item.itemId },
    }));

    const mappedItemRequestDto: DeepPartial<StoreIssuedNote> = {
      ...request,
      sinNumber: sin,
      mir,
      sinItems: mappedItems,
    };
    const newItemRequest =
      this.storeIssuedNoteRepository.create(mappedItemRequestDto);
    newItemRequest.sinItems = await Promise.all(
      mappedItems.map(async (item) => {
        const itemRequestItem = this.sinItemsRepo.create(item);
        itemRequestItem.sin = newItemRequest;
        return itemRequestItem;
      }),
    );
    const result = await this.storeIssuedNoteRepository.save(newItemRequest);
    return result;
  }

  async getItemsBySin(sin: string) {
    const items = await this.storeIssuedNoteRepository
      .createQueryBuilder('store_issued_note')
      .leftJoinAndSelect('store_issued_note.mir', 'mir')
      .leftJoinAndSelect('mir.toDepartment', 'toDepartment')
      .leftJoinAndSelect('store_issued_note.sinItems', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .where('store_issued_note.id = :sinId', { sinId: sin })
      .andWhere('store_issued_note.isArchived = :isArchived', {
        isArchived: false,
      })
      .select([
        'store_issued_note',
        'mir',
        'toDepartment',
        'items.quantity',
        'items.balance',
        'items.pending',
        'items.cancel',
        'items.totalIssue',
        'items.totalCancel',
        'items.totalRequested',
        'item.id',
        'item.name',
        'item.itemCode',
        'item.description',
      ])
      .getOne();
    const consumptions = await this.consumptionRepository
      .createQueryBuilder('consumption')
      .leftJoinAndSelect('consumption.itemsConsumption', 'itemsConsumption')
      .leftJoinAndSelect('itemsConsumption.item', 'item')
      .where('consumption.isArchived = :isArchived', { isArchived: false })
      .andWhere('consumption.sin = :id', { id: sin })
      .getMany();
    const mrr = await this.returnRequest
      .createQueryBuilder('return_item_request')
      .leftJoinAndSelect('return_item_request.items', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .where('return_item_request.isArchived = :isArchived', {
        isArchived: false,
      })
      .andWhere('items.sin = :id', { id: sin })
      .getMany();
    let total = 0;
    let returnQty = 0;

    for (const item of items.sinItems) {
      consumptions.map((con) => {
        const consumed = con.itemsConsumption.find(
          (entity) => entity.item.id === item?.item?.id,
        );
        consumed?.consumeQty ? (total = total + consumed.consumeQty) : total;
      });
      for (const mrrItem of mrr) {
        mrrItem?.items.map((con) => {
          if (con.item.id === item?.item?.id) {
            con.returnQuantity
              ? (returnQty = returnQty + con.returnQuantity)
              : returnQty;
          }
        });
      }
      item['consumptionQty'] = total ?? 0;
      item['mrrReturnQty'] = returnQty ?? 0;
    }
    items['toDepartment'] = items?.mir?.toDepartment?.name;
    delete items.mir;
    return items;
  }

  async getSinListByMir(mirId: string) {
    const items = await this.storeIssuedNoteRepository.find({
      where: { mir: { id: mirId } },
    });

    return items;
  }

  async getSinListByLoction(
    locationId: string,
    query: QueryDto,
    pagination: PaginationDto,
  ) {
    const { sinNumber, mirNumber, generatedDate } = query;
    const { page, limit } = pagination;
    const skip = ((page ?? 1) - 1) * (limit ?? 10);

    // Start building the query
    const queryBuilder = this.storeIssuedNoteRepository
      .createQueryBuilder('store_issued_note')
      .leftJoinAndSelect('store_issued_note.mir', 'mir')
      .leftJoinAndSelect('mir.fromDepartment', 'fromDepartment')
      .where('fromDepartment.id = :id', { id: locationId })
      .andWhere('store_issued_note.isArchived = :isArchived', {
        isArchived: false,
      })
      .select(['store_issued_note', 'mir.id', 'mir.mirNumber'])
      .orderBy('store_issued_note.createDateTime', 'DESC');

    // Apply filters if they exist
    if (sinNumber) {
      queryBuilder.andWhere('store_issued_note.sinNumber ILIKE :sinNumber', {
        sinNumber: `%${sinNumber}%`,
      });
    }
    if (mirNumber) {
      queryBuilder.andWhere('mir.mirNumber ILIKE :mirNumber', {
        mirNumber: `%${mirNumber}%`,
      });
    }
    if (generatedDate) {
      const createDateTimeFormatted = `${generatedDate}T00:00:00.000Z`;
      queryBuilder.andWhere(
        `DATE(store_issued_note.createDateTime) = DATE(:createDateTime)`,
        {
          createDateTime: createDateTimeFormatted,
        },
      );
    }
    const totalRows = await queryBuilder.getCount();
    // Apply pagination
    if (page !== undefined && limit !== undefined) {
      queryBuilder.offset(skip).limit(limit);
    }

    // Execute query and return results
    const list = await queryBuilder.getMany();
    return { totalRows, list };
  }

  async getSinListByToLoction(
    locationId: string,
    query: QueryDto,
    pagination: PaginationDto,
  ) {
    const { mirNumber, sinNumber, generatedDate } = query;
    const { page, limit } = pagination;
    const skip = ((page ?? 1) - 1) * (limit ?? 10);
    const queryBuilder = await this.storeIssuedNoteRepository
      .createQueryBuilder('store_issued_note')
      .leftJoinAndSelect('store_issued_note.mir', 'mir')
      .leftJoinAndSelect('mir.toDepartment', 'toDepartment')
      .where('toDepartment.id = :id', { id: locationId })
      .andWhere('store_issued_note.isArchived = :isArchived', {
        isArchived: false,
      })
      .select(['store_issued_note', 'mir.id', 'mir.mirNumber'])
      .orderBy('store_issued_note.createDateTime', 'DESC');
    // Apply filters if they exist
    if (sinNumber) {
      queryBuilder.andWhere('store_issued_note.sinNumber ILIKE :sinNumber', {
        sinNumber: `%${sinNumber}%`,
      });
    }
    if (mirNumber) {
      queryBuilder.andWhere('mir.mirNumber ILIKE :mirNumber', {
        mirNumber: `%${mirNumber}%`,
      });
    }

    if (generatedDate) {
      const createDateTimeFormatted = `${generatedDate}T00:00:00.000Z`;
      queryBuilder.andWhere(
        `DATE(store_issued_note.createDateTime) = DATE(:createDateTime)`,
        {
          createDateTime: createDateTimeFormatted,
        },
      );
    }
    const totalRows = await queryBuilder.getCount();
    // Apply pagination
    if (page !== undefined && limit !== undefined) {
      queryBuilder.offset(skip).limit(limit);
    }

    // Execute query and return results
    const list = await queryBuilder.getMany();
    return { totalRows, list };
  }
}
