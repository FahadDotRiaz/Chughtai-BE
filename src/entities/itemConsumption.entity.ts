// item-consumption.entity.ts

import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Consumption } from './consumption.entity';
import { Item } from './item.entity';

@Entity({ name: 'item_consumption' })
export class ItemConsumption extends BaseEntity {
  @Column()
  consumeQty: number;

  @ManyToOne(() => Consumption, (consumption) => consumption.itemsConsumption)
  @JoinColumn({ name: 'consumption_id' })
  consumption: Consumption;

  @Column()
  total: number;

  @Column({ default: null })
  sinTotal: number;

  @Column({ default: null })
  patients: number;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;
}
