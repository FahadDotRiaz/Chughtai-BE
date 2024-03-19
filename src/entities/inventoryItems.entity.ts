import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Item } from './item.entity';
import { Inventory } from './inventory.entity';

@Entity({ name: 'item_inventory' })
export class ItemInventory extends BaseEntity {
  @Column({ nullable: true })
  quantity: number;

  @Column({ nullable: true })
  min: number;

  @Column({ nullable: true })
  max: number;

  @Column({ nullable: true, default: false })
  isBatch: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  expireDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  manufacturedDate: Date;

  @Column({ nullable: true })
  batchNo: string;

  @ManyToOne(() => Inventory, (inventory) => inventory.inventoryItems)
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;

  @ManyToOne(() => Item, { eager: true })
  @JoinColumn({ name: 'item_id' })
  item: Item;
}
