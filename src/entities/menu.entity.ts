// menu.entity.ts
import { Entity, Column, OneToMany } from 'typeorm';
import { Action } from './action.entity';
import { BaseEntity } from './base.entity';
import { ModuleType } from 'src/utils/constant';

@Entity()
export class Menu extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true, default: null })
  parentId: string;

  @Column({ nullable: true, default: null })
  menuKey: string;

  @Column()
  orderNumber: number;

  @Column({ type: 'enum', enum: ModuleType, nullable: true })
  type: ModuleType;

  @OneToMany(() => Action, (action) => action.menu)
  actions: Action[];
}
