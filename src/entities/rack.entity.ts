import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Item } from './item.entity';

@Entity('rack')
export class Rack extends BaseEntity {
  @Column()
  name: string;

  @Column()
  code: string;

  @OneToMany(() => Item, (item) => item.rack)
  item: Item[];
}
