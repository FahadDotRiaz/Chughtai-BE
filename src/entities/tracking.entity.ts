import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { TrackingActionType, TrackingType } from 'src/utils/constant';
import { MaterialRequest } from './MaterialRequest.entity';
import { ReturnItemRequest } from './returnItemRequest.entity';
import { Grn } from './grn.entity';
import { UserEntity } from './user.entity';

@Entity()
export class Tracking extends BaseEntity {
  @Column({ type: 'enum', enum: TrackingType, nullable: true })
  type: TrackingType;

  @Column({ type: 'enum', enum: TrackingActionType, nullable: true })
  action: TrackingActionType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @ManyToOne(() => MaterialRequest, (req) => req.actions, { nullable: true })
  @JoinColumn({ name: 'mirId' })
  mir: MaterialRequest;

  @ManyToOne(() => ReturnItemRequest, (mrr) => mrr.actions, { nullable: true })
  @JoinColumn({ name: 'mrrId' })
  mrr: ReturnItemRequest;

  @ManyToOne(() => Grn, (grn) => grn.actions, { nullable: true })
  @JoinColumn({ name: 'grnId' })
  grn: Grn;

  @ManyToOne(() => UserEntity, (user) => user.tracking, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ nullable: true, default: true })
  isReview: boolean;

  @Column({ nullable: true, default: true })
  isItemReview: boolean;
}
