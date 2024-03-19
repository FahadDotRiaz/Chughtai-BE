import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Vendor } from './vendor.entity';
import { Item } from './item.entity';
import { BaseEntity } from './base.entity';

@Entity({ name: 'vendor_item' })
export class VendorItem extends BaseEntity {
  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}
