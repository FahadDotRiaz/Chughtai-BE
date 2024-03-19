import { Entity, OneToMany, ManyToOne, JoinColumn, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ItemConsumption } from './itemConsumption.entity';
// import { Location } from './location.entity';
import { StoreIssuedNote } from './storeIssueNote.entity';
import { Department } from './department.entity';

@Entity({ name: 'consumption' })
export class Consumption extends BaseEntity {
  @Column({ nullable: true })
  remarks: string;

  @Column({ nullable: true })
  consumptionCode: string;

  @ManyToOne(() => StoreIssuedNote)
  @JoinColumn({ name: 'sin_id' })
  sin: StoreIssuedNote;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'to_department_id' })
  department: Department;

  @OneToMany(
    () => ItemConsumption,
    (itemConsumption) => itemConsumption.consumption,
    { eager: true, cascade: true },
  )
  itemsConsumption: ItemConsumption[];
}
