// item-request.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ItemRequestItem } from './itemRequestItem.entity';
import {
  CustomItemStatus,
  DemandType,
  RequestStage,
  RequestStatus,
} from '../utils/constant';
import { UserEntity } from './user.entity';
import { StoreIssuedNote } from './storeIssueNote.entity';
import { Department } from './department.entity';
import { Tracking } from './tracking.entity';
import { Item } from './item.entity';

@Entity({ name: 'item_request' })
export class MaterialRequest extends BaseEntity {
  @Column({ unique: true })
  mirNumber: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'from_department_id' })
  fromDepartment: Department;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'to_department_id' })
  toDepartment: Department;

  @OneToMany(
    () => ItemRequestItem,
    (itemRequestItem) => itemRequestItem.materialRequest,
    { cascade: true },
  )
  @JoinColumn()
  items: ItemRequestItem[];

  @Column({ type: 'enum', enum: DemandType, default: DemandType.RECURRENT })
  demandType: DemandType;

  @Column({ nullable: true })
  reqNo: string;

  @Column({ type: 'json', nullable: true })
  customItems: {
    images: string[];
    description: string;
    itemId?: number;
    suggestedItems?: Item[];
    suggestedStatus?: CustomItemStatus;
    acceptedItem?: Item;
    suggestedDate?: Date;
    remarks?: string;
  }[];

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @Column({
    type: 'enum',
    enum: RequestStage,
    default: RequestStage.HOD_APPROVAL,
  })
  stage: RequestStage;

  @Column({ nullable: true })
  remarks: string;

  @Column({ nullable: true })
  rejectedReason: string;

  @OneToMany(() => StoreIssuedNote, (item) => item.mir, { cascade: true })
  sin: StoreIssuedNote[];

  @Column({ nullable: true, default: false })
  isScheduled: boolean;

  @Column({ nullable: true, default: true })
  isReview: boolean;

  @Column({ type: 'date', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'time', nullable: true })
  scheduledTime: string;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'CreatedBy_id' })
  createdBy: UserEntity;

  @OneToMany(() => Tracking, (track) => track.mir, { cascade: true })
  actions: Tracking[];
  // Add any other properties or methods as needed
}
