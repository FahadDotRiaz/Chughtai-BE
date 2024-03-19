import { Entity, Column, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { Department } from './department.entity';
import { BaseEntity } from './base.entity';
import { Action } from './action.entity';
import { UserEntity } from './user.entity';

@Entity()
export class Role extends BaseEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Department, (department) => department.roles)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToMany(() => UserEntity, (user) => user.roles)
  users: UserEntity[];

  @ManyToMany(() => Action, (action) => action.roles, { nullable: true })
  actions: Action[];
}
