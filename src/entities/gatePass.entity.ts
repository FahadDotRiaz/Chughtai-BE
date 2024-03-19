// gate-pass.entity.ts

import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import {
  GatePassType,
  InwardOutward,
  ItemUnit,
  TransportMode,
} from '../utils/constant';
import { BaseEntity } from './base.entity';
import { PurchaseOrder } from './purchaseOrder.entity';

@Entity({ name: 'gate_pass' })
export class GatePass extends BaseEntity {
  @Column({ nullable: true })
  driverId: string;

  @Column({ nullable: true })
  IgpCode: number;

  @Column({ nullable: true })
  OgpCode: number;

  @Column()
  driverCell: string;

  @Column()
  driverName: string;

  @Column({ type: 'enum', enum: GatePassType })
  type: GatePassType;

  @Column({ type: 'enum', enum: TransportMode })
  transportMode: TransportMode;

  @Column({ type: 'enum', enum: ItemUnit })
  itemUnit: ItemUnit;

  @ManyToOne(() => PurchaseOrder, { eager: true })
  @JoinColumn({ name: 'poId' })
  po: PurchaseOrder;

  @Column({ type: 'varchar', length: 20 })
  truckNumber: string;

  @Column({ type: 'timestamptz', nullable: true })
  date: Date;

  @Column({ nullable: true })
  inTime: string;

  @Column({ nullable: true })
  outTime: string;

  @Column({ type: 'enum', enum: InwardOutward })
  inwardOutward: InwardOutward;
}
