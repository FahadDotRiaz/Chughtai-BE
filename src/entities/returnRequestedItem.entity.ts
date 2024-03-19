// item-request.entity.ts
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Item } from './item.entity';
import { ReturnItemRequest } from './returnItemRequest.entity';
import { StoreIssuedNote } from './storeIssueNote.entity';
import { ReturnReasonType } from 'src/utils/constant';

@Entity({ name: 'return_request_items' })
export class returnRequestedItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: null })
  returnQuantity: number;

  @Column({
    type: 'enum',
    enum: ReturnReasonType,
    default: null,
  })
  type: ReturnReasonType;

  @Column({
    type: 'enum',
    enum: ReturnReasonType,
    default: null,
  })
  suggestedType: ReturnReasonType;

  @Column({ nullable: true })
  suggestedQty: number;

  @Column({ default: null })
  returnReason: string;

  @Column({ nullable: true })
  estimatedPrice: number;

  @Column({ nullable: true })
  totalQuantity: number;

  @ManyToOne(() => StoreIssuedNote)
  @JoinColumn({ name: 'sin_id' })
  sin: StoreIssuedNote;

  @Column({ nullable: true, type: 'simple-array' })
  images: string[];

  @ManyToOne(() => Item, { eager: true })
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @ManyToOne(() => ReturnItemRequest, { eager: true })
  @JoinColumn({ name: 'item_request_id' })
  returnItemRequest: ReturnItemRequest;
}
