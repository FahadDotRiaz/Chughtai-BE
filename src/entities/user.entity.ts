// user.entity.ts

import { Entity, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MaterialRequest } from './MaterialRequest.entity';
import { ReturnItemRequest } from './returnItemRequest.entity';
import { PurchaseOrder } from './purchaseOrder.entity';
import { PurchaseRequest } from './purchaseRequest.entity';
// import { UserDepartmentRole } from './userDepartmentRole.entity';
import { Role } from './role.entity';
import { Tracking } from './tracking.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column()
  contact: string;

  @Column()
  cnic: string;

  @Column({ nullable: true })
  file: string;

  @Column({ nullable: true, default: false })
  isSuperAdmin: boolean;

  @ManyToMany(() => Role, (role) => role.users, {
    cascade: true,
  })
  @JoinTable({ name: 'user_roles' })
  roles: Role[];

  @Column({
    name: 'deviceToken',
    type: 'varchar',
    unique: true,
    nullable: true,
  })
  deviceToken: string;

  @OneToMany(
    () => MaterialRequest,
    (materialRequest) => materialRequest.createdBy,
  )
  materialRequest: MaterialRequest[];

  @OneToMany(
    () => ReturnItemRequest,
    (returnItemRequest) => returnItemRequest.createdBy,
  )
  returnItemRequest: ReturnItemRequest[];

  @OneToMany(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.createdBy)
  purchaseOrder: PurchaseOrder[];

  @OneToMany(
    () => PurchaseRequest,
    (purchaseRequest) => purchaseRequest.createdBy,
  )
  purchaseRequest: PurchaseRequest[];

  @OneToMany(() => Tracking, (track) => track.user)
  tracking: Tracking[];
}
