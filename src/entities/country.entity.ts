import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Province } from './province.entity';
import { Vendor } from './vendor.entity';


@Entity()
export class Country extends BaseEntity {
  @Column()
  name: string;

  @OneToMany(() => Province, (province) => province.country)
  province: Province[];

  @OneToMany(() => Vendor, (vendor) => vendor.country)
  vendor: Vendor[];
}
