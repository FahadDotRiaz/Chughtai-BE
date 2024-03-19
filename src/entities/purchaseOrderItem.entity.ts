import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PurchaseOrder } from './purchaseOrder.entity';
import { Item } from './item.entity';
import { BaseEntity } from './base.entity';

@Entity()
export class PurchaseOrderItem extends BaseEntity {
  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  federalTax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salesTax: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discount: number;

  @Column({ type: 'text', nullable: true })
  deliveryDate: string;

  @ManyToOne(() => PurchaseOrder, (po) => po.items)
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrder;

  @ManyToOne(() => Item, (item) => item.purchaseOrderItems)
  @JoinColumn({ name: 'purchase_item_id' })
  item: Item;
}
