import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { City } from './city.entity';
import { BaseEntity } from './base.entity';
import { Vendor } from './vendor.entity';
import { Country } from './country.entity';

@Entity()
export class Province extends BaseEntity {
  @Column()
  name: string;

  @ManyToOne(() => Country, (country) => country.province)
  country: Country;

  @OneToMany(() => City, (city) => city.province)
  cities: City[];

  @OneToMany(() => Vendor, (vendor) => vendor.province)
  vendor: Vendor[];
}
