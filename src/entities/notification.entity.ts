import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Department } from './department.entity';

@Entity()
export class Notification extends BaseEntity {
  @Column()
  payload: string;

  @Column()
  menuKey: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department' })
  department: Department;
}
