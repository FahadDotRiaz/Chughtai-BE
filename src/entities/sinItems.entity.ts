// item-consumption.entity.ts

import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Item } from './item.entity';
import { StoreIssuedNote } from './storeIssueNote.entity';

@Entity({ name: 'sin_items' })
export class SinItems extends BaseEntity {
  @Column()
  quantity: number;

  @ManyToOne(() => StoreIssuedNote, (sinItems) => sinItems.sinItems)
  @JoinColumn({ name: 'sin_id' })
  sin: StoreIssuedNote;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ nullable: true })
  balance: number;

  @Column({ nullable: true })
  totalRequested: number;

  @Column({ nullable: true })
  totalIssue: number;

  @Column({ nullable: true })
  totalCancel: number;

  @Column({ nullable: true })
  pending: number;

  @Column({ nullable: true })
  cancel: number;
}
