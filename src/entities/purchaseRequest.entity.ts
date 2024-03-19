import { Entity, OneToMany, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PurchaseRequestItem } from './purchaseRequestItem.entity';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
// import { Location } from './location.entity';
import { PurchaseOrder } from './purchaseOrder.entity';
import { Department } from './department.entity';

@Entity()
export class PurchaseRequest extends BaseEntity {
  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ nullable: true })
  requestCode: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  store: Department;

  @OneToMany(() => PurchaseRequestItem, (prItem) => prItem.purchaseRequest, {
    eager: true,
    cascade: true,
  })
  items: PurchaseRequestItem[];

  @OneToMany(() => PurchaseOrder, (po) => po.purchaseRequest)
  purchaseOrder: PurchaseOrder[];

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'CreatedBy_id' })
  createdBy: UserEntity;
}
