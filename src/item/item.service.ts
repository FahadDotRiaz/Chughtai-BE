import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from '../entities/item.entity';
import { DeepPartial, In, IsNull, Not, Repository } from 'typeorm';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemChildDto, PaginationDto, QueryDto } from './dto/query.dto';
import { itemsSearchFields } from 'src/utils/searchColumn';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item) private readonly repo: Repository<Item>,
  ) {}
  async addChildItems(parentId: string, childItemIds: string[]) {
    const parentItem = await this.repo.findOne({
      where: { id: parentId },
      relations: ['children'],
    });
    if (!parentItem) {
      throw new NotFoundException('Parent item not found');
    }
    const existingChildItemsInDb = await this.repo
      .createQueryBuilder('item')
      .whereInIds(childItemIds)
      .getMany();
    parentItem.children = existingChildItemsInDb;
    await this.repo.save(parentItem);
    return parentItem;
  }
  async create(
    createItemsDto: CreateItemDto | UpdateItemDto,
    id: string | null,
  ): Promise<any> {
    const query = this.repo.createQueryBuilder('item');
    const trimmedName = createItemsDto.name.trim().replace(/\s+/g, ' ');
    const trimmedCode = createItemsDto.itemCode.trim().replace(/\s+/g, ' ');
    query.where((qb) => {
      qb.where('(item.name = :name AND item.isArchived = :isArchived)', {
        name: trimmedName,
        isArchived: false,
      }).orWhere(
        '(item.itemCode = :itemCode AND item.isArchived = :isArchived)',
        { itemCode: trimmedCode, isArchived: false },
      );
    });

    if (id) {
      query.andWhere((qb) => {
        qb.where('item.id != :id', { id });
      });
    }

    const existingItem = await query.getOne();
    if (existingItem) {
      if (existingItem.name.trim() === trimmedName) {
        throw new BadRequestException('The item with this name already exists');
      }
      if (existingItem.itemCode.trim() === trimmedCode) {
        throw new BadRequestException(
          'The item with this item code already exists',
        );
      }
    }
    const { children, ...createItemDto } = createItemsDto;
    const item = id && (await this.getItemById(id));
    // const itemCode = !id ? generateRandomNumber(6).toString() : item.itemCode;

    const mappedItemRequestDto: DeepPartial<Item> = {
      ...createItemDto,
      name: trimmedName,
      itemCode: trimmedCode,
      category: { id: createItemDto.category },
      rack: { id: createItemDto.rack },
      children: [],
      department: { id: createItemDto.departmentId },
    };
    const newItem = item
      ? this.repo.merge(item, mappedItemRequestDto)
      : this.repo.create(mappedItemRequestDto);
    const result = await this.repo.save(newItem);
    if (createItemDto.isParent) {
      return await this.addChildItems(result.id, children);
    }
    return result;
  }
  async getDepartmentByItemId(itemId: string): Promise<Item> {
    const filters = [];

    if (itemId) {
      filters.push({
        id: itemId,
      });
    }

    const item = await this.repo.findOne({
      where: filters.length > 0 ? filters : {},
    });

    return item;
  }

  async getItemById(id: string): Promise<Item> {
    const item = await this.repo.findOne({
      where: { id: id, isArchived: false },
      relations: ['category', 'children', 'department'],
    });
    if (!item) {
      throw new NotFoundException(`Item not found`);
    }
    return item;
  }

  async hasItemWithDepartment(items: any[]): Promise<boolean> {
    const itemIds = items.map((item) => item.id);
    const count = await this.repo.count({
      where: {
        id: In(itemIds),
        isArchived: false,
        department: Not(IsNull()),
      },
    });
    return count > 0;
  }

  async getAllItems(query: QueryDto, pagination: PaginationDto): Promise<any> {
    const {
      name,
      search,
      measuringUnit,
      packingQty,
      packingSize,
      itemCode,
      secondaryUnit,
      rack,
      category,
      expireDate,
      manufacturingDate,
      isBatch,
    } = query;
    const { page, limit } = pagination;
    const skip = ((page ?? 1) - 1) * (limit ?? 10);

    const queryBuilder = this.repo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.children', 'children')
      .leftJoinAndSelect('item.rack', 'rack')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoinAndSelect('item.department', 'department')
      .where('item.isArchived = :isArchived', { isArchived: false });

    if (name) {
      queryBuilder.andWhere('item.name ILIKE :name', { name: `%${name}%` });
    }

    if (packingQty) {
      queryBuilder.andWhere('item.packingQty ILIKE :packingQty', {
        packingQty: `%${packingQty}%`,
      });
    }
    if (packingSize) {
      queryBuilder.andWhere('item.packingSize ILIKE :packingSize', {
        packingSize: `%${packingSize}%`,
      });
    }

    if (rack) {
      queryBuilder.andWhere('rack.code ILIKE :code', {
        code: `%${rack}%`,
      });
    }
    if (category) {
      queryBuilder.andWhere('category.name ILIKE :name', {
        name: `%${category}%`,
      });
    }
    if (measuringUnit) {
      queryBuilder.andWhere('item.measuringUnit ILIKE :measuringUnit', {
        measuringUnit: `%${measuringUnit}%`,
      });
    }
    if (secondaryUnit) {
      queryBuilder.andWhere('item.secondaryUnit ILIKE :secondaryUnit', {
        secondaryUnit: `%${secondaryUnit}%`,
      });
    }
    if (itemCode) {
      queryBuilder.andWhere('item.itemCode ILIKE :itemCode', {
        itemCode: `%${itemCode}%`,
      });
    }
    if (isBatch) {
      queryBuilder.andWhere('item.isBatch = :isBatch', {
        isBatch: isBatch === '1' ? true : false,
      });
    }
    if (expireDate) {
      queryBuilder.andWhere('item.expireDate = :expireDate', {
        expireDate: expireDate === '1' ? true : false,
      });
    }
    if (manufacturingDate) {
      queryBuilder.andWhere('item.manufacturingDate = :manufacturingDate', {
        manufacturingDate: manufacturingDate === '1' ? true : false,
      });
    }
    if (search && itemsSearchFields.length > 0) {
      const whereConditions = itemsSearchFields
        .map((field) => {
          if (field === 'rack') {
            return `rack.code::text ILIKE :search`;
          } else if (field === 'category') {
            return `category.name::text ILIKE :search`;
          } else {
            return `item.${field} ILIKE :search`;
          }
        })
        .join(' OR ');

      queryBuilder.andWhere(`(${whereConditions})`, { search: `%${search}%` });
    }

    const totalRows = await queryBuilder.getCount();

    const list = await queryBuilder
      .orderBy('item.createDateTime', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      totalRows,
      list,
    };
  }

  async getParentItems(query: ItemChildDto) {
    const { name } = query;
    let queryBuilder = this.repo
      .createQueryBuilder('item')
      .leftJoin('item.parent', 'parent')
      .where('item.isParent = :isParent', { isParent: false })
      .andWhere('parent.id IS NULL');

    if (name) {
      queryBuilder = queryBuilder.andWhere('item.name LIKE :name', {
        name: `%${name}%`,
      });
    }
    const totalRows = await queryBuilder.getCount();
    const list = await queryBuilder.getMany();
    return { totalRows, list };
  }

  async deleteItem(id: string): Promise<any> {
    const item = await this.getItemById(id);

    if (item) {
      item.isArchived = true;
      await this.repo.save(item);
    }

    return item;
  }
}
