import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MaterialRequest } from './MaterialRequest.entity';
import { Consumption } from './consumption.entity';
import { PurchaseRequest } from './purchaseRequest.entity';
import { PurchaseOrder } from './purchaseOrder.entity';
import { Role } from './role.entity';
// import { UserDepartmentRole } from './userDepartmentRole.entity';
import { Location } from './location.entity';
import { DepartmentType } from 'src/utils/constant';
import { Inventory } from './inventory.entity';
import { Notification } from './notification.entity';
import { Item } from './item.entity';

@Entity()
export class Department extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'enum', enum: DepartmentType, nullable: true })
  type: DepartmentType;

  @Column({ nullable: true, default: true })
  mirApproval: boolean;

  @Column({ nullable: true, default: true })
  mrrApproval: boolean;

  @Column({ nullable: true, default: true })
  grnApproval: boolean;

  @Column({ nullable: true, default: true })
  mirItemReview: boolean;

  @Column({ nullable: true, default: true })
  mrrItemReview: boolean;

  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'location' })
  location: Location;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'reported_deparment' })
  managedBy: Department;

  @OneToMany(() => Role, (role) => role.department)
  roles: Role[];

  @OneToMany(() => MaterialRequest, (mir) => mir.fromDepartment)
  fromMIRs: MaterialRequest[];

  @OneToMany(() => MaterialRequest, (mir) => mir.toDepartment)
  toMIRs: MaterialRequest[];

  @OneToMany(() => Consumption, (consumption) => consumption.department)
  consumption: Consumption[];

  @OneToMany(() => PurchaseRequest, (pr) => pr.store)
  prDepartment: PurchaseRequest[];

  @OneToMany(() => PurchaseOrder, (po) => po.department)
  poDepartment: PurchaseOrder[];

  @OneToMany(() => Notification, (notification) => notification.department)
  notifications: Notification[];

  @OneToMany(() => Inventory, (pr) => pr.department)
  inventory: Inventory[];

  @OneToMany(() => Item, (item) => item.department)
  items: Item[];
}
