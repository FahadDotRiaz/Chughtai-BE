import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ItemRequestItem } from './itemRequestItem.entity';
import { returnRequestedItem } from './returnRequestedItem.entity';
import { PurchaseRequestItem } from './purchaseRequestItem.entity';
import { PurchaseOrderItem } from './purchaseOrderItem.entity';
import { SinItems } from './sinItems.entity';
import { ItemInventory } from './inventoryItems.entity';
// import { Vendor } from './vendor.entity';
import { VendorItem } from './vendorItem.entity';
import { Rack } from './rack.entity';
import { Category } from './category.entity';
import { Department } from './department.entity';

@Entity({ name: 'item' })
export class Item extends BaseEntity {
  @Column({ type: 'varchar', length: 300, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  itemCode: string;

  @Column({ type: 'varchar', nullable: true })
  measuringUnit: string;

  @Column({ type: 'varchar', nullable: true })
  secondaryUnit: string;

  @Column({ nullable: true })
  packingQty: number;

  @Column({ nullable: true })
  packingSize: number;

  @Column({ nullable: true, default: false })
  isBatch: boolean;

  @Column({ nullable: true, default: false })
  isParent: boolean;

  @Column({ nullable: true, default: false })
  expireDate: boolean;

  @Column({ nullable: true, default: false })
  manufacturingDate: boolean;

  @Column({ type: 'varchar', nullable: true })
  temprature: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  description: string;

  @OneToMany(() => ItemRequestItem, (mir) => mir.item)
  requestItem: ItemRequestItem[];

  @OneToMany(() => ItemRequestItem, (mir) => mir.suggestedItem)
  suggestedItem: ItemRequestItem[];

  @OneToMany(() => returnRequestedItem, (mrr) => mrr.item)
  returnItem: returnRequestedItem[];

  @OneToMany(() => PurchaseRequestItem, (prItem) => prItem.item)
  purchaseRequestItems: PurchaseRequestItem[];

  @OneToMany(() => PurchaseOrderItem, (poItem) => poItem.item)
  purchaseOrderItems: PurchaseOrderItem[];

  @OneToMany(() => SinItems, (sinItem) => sinItem.item)
  sinItems: SinItems[];

  @OneToMany(() => ItemInventory, (inventoryItem) => inventoryItem.item)
  inventoryItems: ItemInventory[];

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => VendorItem, (vendor) => vendor.item)
  userGroups: VendorItem[];

  @ManyToOne(() => Rack, (rack) => rack.item, { nullable: true })
  @JoinColumn({ name: 'rackId' })
  rack: Rack;

  @ManyToOne(() => Category, (cat) => cat.item, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => Item, (item) => item.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Item;

  @OneToMany(() => Item, (item) => item.parent)
  children: Item[];
}
