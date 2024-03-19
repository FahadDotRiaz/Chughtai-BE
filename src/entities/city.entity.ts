import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { Province } from './province.entity';
import { Area } from './area.entity';
import { BaseEntity } from './base.entity';
import { Vendor } from './vendor.entity';

@Entity()
export class City extends BaseEntity {
  @Column()
  name: string;

  @ManyToOne(() => Province, (province) => province.cities)
  province: Province;

  @OneToMany(() => Area, (area) => area.city)
  areas: Area[];

  @OneToMany(() => Vendor, (vendor) => vendor.city)
  vendors: Vendor[];
}
