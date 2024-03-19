import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { SinItems } from './sinItems.entity';
import { MaterialRequest } from './MaterialRequest.entity';
import { Consumption } from './consumption.entity';
import { returnRequestedItem } from './returnRequestedItem.entity';

@Entity({ name: 'store_issued_note' })
export class StoreIssuedNote extends BaseEntity {
  @Column({ unique: true })
  sinNumber: string;

  @ManyToOne(() => MaterialRequest)
  @JoinColumn({ name: 'mir' })
  mir: MaterialRequest;

  @OneToMany(() => SinItems, (SinItems) => SinItems.sin, {
    eager: true,
    cascade: true,
  })
  sinItems: SinItems[];

  @OneToMany(() => Consumption, (consumption) => consumption.sin, {
    eager: true,
    cascade: true,
  })
  consumption: Consumption[];

  @OneToMany(() => returnRequestedItem, (item) => item.sin, {
    eager: true,
    cascade: true,
  })
  returnRequestedItems: returnRequestedItem[];
}
