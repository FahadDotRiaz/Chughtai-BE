// Inventory.entity.ts

import { Entity, JoinColumn, OneToMany, Column, ManyToOne } from 'typeorm';
// import { MaterialRequest } from './MaterialRequest.entity';
import { BaseEntity } from './base.entity';
import { ItemInventory } from './inventoryItems.entity';
import { Department } from './department.entity';
import { InventoryType } from 'src/utils/constant';

@Entity()
export class Inventory extends BaseEntity {
  @ManyToOne(() => Department, (dep) => dep.inventory, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @OneToMany(() => ItemInventory, (itemInventory) => itemInventory.inventory, {
    cascade: true,
  })
  inventoryItems: ItemInventory[];

  @Column({ type: 'enum', enum: InventoryType, nullable: true })
  type: InventoryType;
}
