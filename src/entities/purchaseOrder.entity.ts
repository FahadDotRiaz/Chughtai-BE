import { Entity, OneToMany, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PurchaseOrderItem } from './purchaseOrderItem.entity';
import { BaseEntity } from './base.entity';
import { Vendor } from './vendor.entity';
import { UserEntity } from './user.entity';
import { Grn } from './grn.entity';
import { GatePass } from './gatePass.entity';
// import { Location } from './location.entity';
import { PurchaseRequest } from './purchaseRequest.entity';
import { Department } from './department.entity';
import { Currency } from 'src/utils/constant';

@Entity()
export class PurchaseOrder extends BaseEntity {
  @Column({ default: null })
  poCode: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'text', nullable: true })
  deliveryDate: string;

  @Column({ type: 'text', nullable: true })
  freight: string;

  @Column({ type: 'text', nullable: true })
  deliveryTerms: string;

  @Column({ type: 'text', nullable: true })
  paymentTerms: string;

  @Column({ type: 'enum', enum: Currency, nullable: true })
  currency: Currency;

  @ManyToOne(() => Vendor, (vendor) => vendor.purchaseOrders)
  vendor: Vendor;

  @OneToMany(() => PurchaseOrderItem, (poItem) => poItem.purchaseOrder, {
    cascade: true,
  })
  items: PurchaseOrderItem[];

  @OneToMany(() => GatePass, (gatePass) => gatePass.po, {
    cascade: true,
  })
  gatePass: GatePass[];

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'deparment_id' })
  department: Department;

  @ManyToOne(() => PurchaseRequest, { nullable: true })
  @JoinColumn({ name: 'Purchase_Request_id' })
  purchaseRequest: PurchaseRequest;

  @OneToMany(() => Grn, (grn) => grn.po, { eager: true, cascade: true })
  grn: Grn[];

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'CreatedBy_id' })
  createdBy: UserEntity;
}
