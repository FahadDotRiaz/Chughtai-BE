// inventory.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Item } from '../entities/item.entity';
import { Inventory } from '../entities/inventory.entity';
import { ItemInventory } from '../entities/inventoryItems.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item, Inventory, ItemInventory])],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
