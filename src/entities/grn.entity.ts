import { Entity, OneToMany, ManyToOne, JoinColumn, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PurchaseOrder } from './purchaseOrder.entity';
import { ItemGrn } from './grnItems.entity';
import { GrnStatus } from 'src/utils/constant';
import { Tracking } from './tracking.entity';

@Entity({ name: 'grn' })
export class Grn extends BaseEntity {
  @Column({ unique: true })
  grnCode: string;

  @Column({ nullable: true })
  remarks: string;

  @ManyToOne(() => PurchaseOrder)
  @JoinColumn({ name: 'po_id' })
  po: PurchaseOrder;

  @Column({ type: 'enum', enum: GrnStatus, default: GrnStatus.PENDING })
  status: GrnStatus;

  @OneToMany(() => ItemGrn, (itemGrn) => itemGrn.grn, {
    eager: true,
    cascade: true,
  })
  items: ItemGrn[];

  @OneToMany(() => Tracking, (track) => track.grn, { cascade: true })
  actions: Tracking[];
}
