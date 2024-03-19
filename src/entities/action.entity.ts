// action.entity.ts
import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { Menu } from './menu.entity';
import { BaseEntity } from './base.entity';
import { Role } from './role.entity';

@Entity()
export class Action extends BaseEntity {
  @Column()
  name: string;

  @ManyToOne(() => Menu, (menu) => menu.actions, { nullable: true })
  @JoinColumn({ name: 'menuId' })
  menu: Menu;

  @Column()
  actionKey: string;

  @Column()
  orderNumber: number;

  @ManyToMany(() => Role, (role) => role.actions)
  @JoinTable({ name: 'actionsInRoles' })
  roles: Role[];
}
