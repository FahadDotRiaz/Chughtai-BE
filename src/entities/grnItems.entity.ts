// item-consumption.entity.ts

import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Item } from './item.entity';
import { Grn } from './grn.entity';

@Entity({ name: 'item_grn' })
export class ItemGrn extends BaseEntity {
  @Column({ nullable: true })
  requestedQty: number;

  @Column({ nullable: true })
  grnQty: number;

  @Column({ nullable: true })
  cancelQty: number;

  @Column({ nullable: true })
  remainingQty: number;

  @Column({ nullable: true })
  balance: number;

  @Column({ nullable: true, default: false })
  isBatch: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  expireDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  manufacturedDate: Date;

  @Column({ nullable: true })
  batchNo: string;

  @ManyToOne(() => Grn)
  @JoinColumn({ name: 'grn_id' })
  grn: Grn;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;
}
