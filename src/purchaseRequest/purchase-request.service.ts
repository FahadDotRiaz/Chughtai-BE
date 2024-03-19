// purchase-request.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PurchaseRequest } from '../entities/purchaseRequest.entity';
import { DeepPartial, Repository } from 'typeorm';
import { CreatePurchaseRequestDto } from './dto/create.dto';
import { PurchaseRequestItem } from '../entities/purchaseRequestItem.entity';
import { generateRandomNumber } from 'src/utils/helper';
import { UpdatePurchaseRequestDto } from './dto/update.dto';
import { PaginationDto, QueryDto } from './dto/query.dto';
import { purchaseRequestSearchFields } from 'src/utils/searchColumn';

@Injectable()
export class PurchaseRequestService {
  constructor(
    @InjectRepository(PurchaseRequest)
    private readonly purchaseRequestRepository: Repository<PurchaseRequest>,
    @InjectRepository(PurchaseRequestItem)
    private readonly purchaseRequestItemRepository: Repository<PurchaseRequestItem>,
  ) {}

  async getPurchaseRequestById(id: string): Promise<PurchaseRequest> {
    const PurchaseRequest = await this.purchaseRequestRepository.findOne({
      where: { id: id, isArchived: false },
      relations: ['items', 'items.item', 'store', 'store.location'],
    });
    if (!PurchaseRequest) {
      throw new NotFoundException(`Purchase Request not found`);
    }
    return PurchaseRequest;
  }

  async createPurchaseRequest(
    createPurchaseRequestDto:
      | CreatePurchaseRequestDto
      | UpdatePurchaseRequestDto,
    id: string | null,
  ): Promise<PurchaseRequest> {
    const purchaseRequest = id && (await this.getPurchaseRequestById(id));
    let requestCode;

    if (id) {
      requestCode = purchaseRequest?.requestCode;
    }

    const store = { id: createPurchaseRequestDto.requester };

    const newRequestCode =
      id == null ? generateRandomNumber(6).toString() : requestCode;

    const mappedItems = createPurchaseRequestDto.items.map((item) => ({
      quantity: item?.quantity,
      remarks: item?.remarks,
      federalTax: item?.fedralTax,
      salesTax: item?.salesTax,
      discount: item?.discount,
      deliveryDate: item?.delivaryDate,
      item: { id: item?.itemId },
    }));
    const mappedItemRequestDto: DeepPartial<PurchaseRequest> = {
      ...createPurchaseRequestDto,
      comments: createPurchaseRequestDto?.comments,
      store,
      requestCode: newRequestCode,
      items: mappedItems,
    };
    const purchaseRequestValue = purchaseRequest
      ? this.purchaseRequestRepository.merge(
          purchaseRequest,
          mappedItemRequestDto,
        )
      : this.purchaseRequestRepository.create(mappedItemRequestDto);
    return this.purchaseRequestRepository.save(purchaseRequestValue);
  }

  async getAllPurchaseRequests(
    query: QueryDto,
    pagination: PaginationDto,
  ): Promise<any> {
    const { search, store, comments, requestCode } = query;
    const { page, limit } = pagination;

    // Calculate skip based on page and limit
    const skip = ((page ?? 1) - 1) * (limit ?? 10);

    // Create a query builder
    const queryBuilder = await this.purchaseRequestRepository
      .createQueryBuilder('purchase_request')
      .leftJoinAndSelect('purchase_request.store', 'store')
      .leftJoinAndSelect('purchase_request.createdBy', 'createdBy')
      .leftJoinAndSelect('purchase_request.items', 'items')
      .leftJoinAndSelect('items.item', 'item')
      .where('purchase_request.isArchived = :isArchived', {
        isArchived: false,
      });

    // Apply filters if provided
    if (search && purchaseRequestSearchFields.length > 0) {
      const whereConditions = purchaseRequestSearchFields
        .map((field) => {
          return `purchase_request.${field} ILIKE :search`;
        })
        .join(' OR ');

      queryBuilder.andWhere(`(${whereConditions})`, { search: `%${search}%` });
    }

    if (store) {
      queryBuilder.andWhere('store.name = :store', { store });
    }

    if (comments) {
      queryBuilder.andWhere('purchase_request.comments = :comments', {
        comments,
      });
    }

    if (requestCode) {
      queryBuilder.andWhere('purchase_request.requestCode = :requestCode', {
        requestCode,
      });
    }

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    // Order the results
    queryBuilder.orderBy('purchase_request.createDateTime', 'DESC');

    // Select specific fields
    queryBuilder.select(['purchase_request', 'store', 'items', 'item']);

    // Execute the query and return the result
    const result = await queryBuilder.getMany();
    return result;
  }

  async deletePurchaseRequest(id: string): Promise<any> {
    const purchaseRequset = await this.getPurchaseRequestById(id);
    if (purchaseRequset) {
      purchaseRequset.isArchived = true;
      await this.purchaseRequestRepository.save(purchaseRequset);
    }
    return purchaseRequset;
  }
}
