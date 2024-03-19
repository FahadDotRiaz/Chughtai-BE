// inventory.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Inventory } from '../entities/inventory.entity';
import { ItemInventory } from '../entities/inventoryItems.entity';
import { InventoryType } from 'src/utils/constant';
import { PaginationDto, QueryDto } from './dto/query.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(ItemInventory)
    private readonly itemRepository: Repository<ItemInventory>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async addItemToStoreInventory(
    itemsData: any[],
    departmentId: string,
    type: InventoryType,
  ): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { department: { id: departmentId }, type: type },
      relations: ['department', 'inventoryItems'],
    });

    if (!inventory) {
      const department = { id: departmentId };
      const mappedItems = itemsData.map((item) => ({
        quantity: item.issuedQty,
        min: item.min ?? 50,
        max: item.max ?? 1000,
        item: { id: item.itemId },
      }));

      const mappedItemRequestDto: DeepPartial<Inventory> = {
        department,
        inventoryItems: mappedItems,
      };

      const newItemRequest =
        this.inventoryRepository.create(mappedItemRequestDto);
      newItemRequest.inventoryItems = await Promise.all(
        mappedItems.map(async (item) => {
          const itemInventoryItem = this.itemRepository.create(item);
          itemInventoryItem.inventory = newItemRequest;
          return itemInventoryItem;
        }),
      );
      const result = await this.inventoryRepository.save(newItemRequest);
      return result;
    }

    // If inventory exists, add items to the existing inventory
    itemsData.forEach(async (itemData) => {
      const existingItem = inventory.inventoryItems.find(
        (item) =>
          item?.item?.id === itemData.itemId && item.isArchived === false,
      );

      if (existingItem) {
        existingItem.quantity = itemData.issuedQty;
        existingItem.min = itemData.min;
        existingItem.max = itemData.max;
        await this.itemRepository.save(existingItem);
      } else {
        const newItem = this.itemRepository.create({
          quantity: itemData.issuedQty,
          item: { id: itemData.itemId },
          max: itemData.max,
          min: itemData.min,
          inventory,
        });
        await this.itemRepository.save(newItem);
        inventory.inventoryItems.push(newItem);
      }
    });

    await this.inventoryRepository.save(inventory);
    return inventory;
  }

  async reduceInventory(
    item: string,
    quantity: number,
    department: string,
    type: InventoryType,
  ): Promise<ItemInventory> {
    try {
      const inventory = await this.inventoryRepository.findOne({
        where: { department: { id: department }, type: type },
        relations: ['inventoryItems'],
      });

      if (!inventory) {
        throw new Error(
          `Inventory not found for item ${item} at department ${department}`,
        );
      }
      const inventoryItems = await this.itemRepository.findOne({
        where: { item: { id: item }, inventory: { id: inventory.id } },
      });

      if (!inventoryItems) {
        throw new BadRequestException(`Item not exist in inventory`);
      }
      if (inventoryItems?.quantity < quantity) {
        throw new BadRequestException(
          `Insufficient inventory quantity for item ${item} at location ${department}`,
        );
      }

      inventoryItems.quantity -= quantity;
      this.itemRepository.save(inventoryItems);
      this.inventoryRepository.save(inventory);
      const result = await this.itemRepository.save(inventoryItems);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getInventoryById(id: string): Promise<any> {
    const inventry = await this.inventoryRepository.findOne({
      where: { id: id, isArchived: false },
    });
    if (!inventry) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    return inventry;
  }

  async deleteInventoryItem(id: string): Promise<any> {
    const inventry = await this.itemRepository.findOne({
      where: { id: id, isArchived: false },
    });

    if (inventry) {
      inventry.isArchived = true;
      await this.itemRepository.save(inventry);
    }

    return inventry;
  }

  async updateInventory(id: string, dto: any): Promise<Inventory> {
    const consumption = await this.getInventoryById(id);
    this.inventoryRepository.merge(consumption, dto);
    return this.inventoryRepository.save(consumption);
  }

  // async viewInventory(
  //   department?: string,
  //   query?: QueryDto,
  //   pagination?: PaginationDto,
  // ): Promise<any> {
  //   const { itemCode, name, max, min } = query;
  //   const { page, limit } = pagination;
  //   const skip = ((page ?? 1) - 1) * (limit ?? 10);
  //   const queryBuilder = this.inventoryRepository
  //     .createQueryBuilder('inventory')
  //     .leftJoinAndSelect('inventory.department', 'department')
  //     .leftJoinAndSelect('inventory.inventoryItems', 'items')
  //     .leftJoinAndSelect('items.item', 'item')
  //     .orderBy('items.createDateTime', 'DESC')
  //     .select(['inventory', 'items', 'item']);

  //   if (department) {
  //     queryBuilder.where('department.id = :departmentId', {
  //       departmentId: department,
  //     });
  //   }
  //   queryBuilder.andWhere('items.isArchived = :isArchived', {
  //     isArchived: false,
  //   });

  //   if (min) {
  //     queryBuilder.andWhere('items.min = :min', { min });
  //   }

  //   if (max) {
  //     queryBuilder.andWhere('items.max = :max', { max });
  //   }

  //   if (itemCode) {
  //     queryBuilder.andWhere('item.itemCode ILIKE :itemCode', {
  //       itemCode: `%${itemCode}%`,
  //     });
  //   }
  //   if (name) {
  //     queryBuilder.andWhere('item.name ILIKE :name', { name: `%${name}%` });
  //   }

  //   const totalRows = await queryBuilder.getCount();
  //   await queryBuilder.skip(skip).take(limit);
  //   // Apply skip and take
  //   const list = await queryBuilder.getMany();

  //   // Return data along with metadata
  //   return { totalRows, list };
  // }
  async viewInventory(
    department?: string,
    query?: QueryDto,
    pagination?: PaginationDto,
  ): Promise<any> {
    const { itemCode, name, max, min, quantity } = query;
    const { page, limit } = pagination;
    const skip = ((page ?? 1) - 1) * (limit ?? 10);

    const inventory = await this.inventoryRepository.findOne({
      where: { department: { id: department } },
    });
    if (inventory) {
      const itemQueryBuilder = this.itemRepository
        .createQueryBuilder('item_inventory')
        .leftJoinAndSelect('item_inventory.item', 'item')
        .leftJoinAndSelect('item_inventory.inventory', 'inventory')
        .leftJoinAndSelect('inventory.department', 'department')
        .andWhere('item_inventory.inventory = :inventory', {
          inventory: inventory?.id,
        })
        .where('item_inventory.isArchived = :isArchived', {
          isArchived: false,
        });

      if (min) {
        itemQueryBuilder.andWhere('item_inventory.min = :min', { min });
      }

      if (max) {
        itemQueryBuilder.andWhere('item_inventory.max = :max', { max });
      }

      if (quantity) {
        itemQueryBuilder.andWhere('item_inventory.quantity = :quantity', {
          quantity,
        });
      }

      if (itemCode) {
        itemQueryBuilder.andWhere('item.itemCode ILIKE :itemCode', {
          itemCode: `%${itemCode}%`,
        });
      }
      if (name) {
        itemQueryBuilder.andWhere('item.name ILIKE :name', {
          name: `%${name}%`,
        });
      }

      const totalRows = await itemQueryBuilder.getCount();
      const list = await itemQueryBuilder.skip(skip).take(limit).getMany();

      return { totalRows, list };
    }
    return { totalRows: 0, list: [] };
  }

  async viewInventoryView(department?: string): Promise<any> {
    const inventory = await this.inventoryRepository.findOne({
      where: { department: { id: department }, type: InventoryType.STORAGE },
      relations: ['inventoryItems', 'inventoryItems.item'],
    });
    return inventory;
  }
}
