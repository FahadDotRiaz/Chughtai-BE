// item-request.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
// import { Location } from './location.entity';
import { RequestStage, RequestStatus } from '../utils/constant';
import { returnRequestedItem } from './returnRequestedItem.entity';
import { UserEntity } from './user.entity';
import { Department } from './department.entity';
import { Tracking } from './tracking.entity';

@Entity({ name: 'return_item_request' })
export class ReturnItemRequest extends BaseEntity {
  @Column({ unique: true })
  mrrCode: string;

  @ManyToOne(() => Department, { eager: true })
  @JoinColumn({ name: 'from_department_id' })
  fromDepartment: Department;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'to_department_id' })
  toDepartment: Department;

  @OneToMany(
    () => returnRequestedItem,
    (returnRequestedItem) => returnRequestedItem.returnItemRequest,
    { cascade: true },
  )
  items: returnRequestedItem[];

  @Column({
    type: 'enum',
    enum: RequestStage,
    default: RequestStage.STORE_APPROVAL,
  })
  stage: RequestStage;

  @Column({ nullable: true, default: true })
  isReview: boolean;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @Column({ nullable: true })
  rejectedReason: string;

  @Column({ nullable: true })
  remarks: string;

  @Column({ nullable: true })
  batchStock: number;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'CreatedBy_id' })
  createdBy: UserEntity;

  @Column({ nullable: true, type: 'simple-array' })
  proofOfDisposal: string[];

  @OneToMany(() => Tracking, (track) => track.mrr, { cascade: true })
  actions: Tracking[];
}
