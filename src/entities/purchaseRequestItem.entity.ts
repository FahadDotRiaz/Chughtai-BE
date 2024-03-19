import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { PurchaseRequest } from './purchaseRequest.entity';
import { Item } from './item.entity';
import { BaseEntity } from './base.entity';
import { PurchaseOrder } from './purchaseOrder.entity';

@Entity()
export class PurchaseRequestItem extends BaseEntity {
  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'text' })
  remarks: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  federalTax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salesTax: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  discount: number;

  @Column({ type: 'text' })
  deliveryDate: string;

  @ManyToOne(() => PurchaseRequest, (pr) => pr.items)
  @JoinColumn({ name: 'purchase_request_id' })
  purchaseRequest: PurchaseRequest;

  @ManyToOne(() => Item, (item) => item.purchaseRequestItems)
  @JoinColumn({ name: 'purchase_request_item_id' })
  item: Item;
}
