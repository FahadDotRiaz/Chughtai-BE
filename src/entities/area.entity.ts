import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { City } from './city.entity';
import { BaseEntity } from './base.entity';
import { Vendor } from './vendor.entity';

@Entity()
export class Area extends BaseEntity {
  @Column()
  name: string;

  @ManyToOne(() => City, (city) => city.areas)
  city: City;

  @OneToMany(() => Vendor, (vendor) => vendor.area)
  vendors: Vendor[];
}
