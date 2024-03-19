import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Item } from './item.entity';

@Entity('category')
export class Category extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(() => Item, (item) => item.category)
  item: Item[];
}
