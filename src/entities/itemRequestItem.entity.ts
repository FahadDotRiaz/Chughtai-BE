// item-request-item.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Item } from './item.entity';
import { MaterialRequest } from './MaterialRequest.entity';
import { Department } from './department.entity';

@Entity({ name: 'item_request_items' })
export class ItemRequestItem extends BaseEntity {
  @Column()
  quantity: number;

  @Column({ nullable: true })
  approvedQuantity: number;

  @Column({ nullable: true })
  issuedQuantity: number;

  @Column({ nullable: true })
  totalInventoryQty: number;

  @Column({ nullable: true })
  balance: number;

  @Column({ nullable: true })
  pending: number;

  @Column({ nullable: true })
  cancel: number;

  @Column({ default: 'pending' })
  approvalStatus: 'pending' | 'approved' | 'rejected';

  @ManyToOne(() => Item, { eager: true, nullable: true })
  @JoinColumn({ name: 'suggestedItem_id' })
  suggestedItem: Item;

  @Column({ nullable: true })
  suggestedQty: number;

  @ManyToOne(() => Item, { eager: true })
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @ManyToOne(() => MaterialRequest, { eager: true })
  @JoinColumn({ name: 'item_request_id' })
  materialRequest: MaterialRequest;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;
}
