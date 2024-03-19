import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Service } from 'src/utils/constant';
import { Department } from './department.entity';
import { Province } from './province.entity';
import { City } from './city.entity';
import { Area } from './area.entity';

@Entity()
export class Location extends BaseEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ default: null })
  address: string;

  @Column({ type: 'enum', enum: Service, nullable: true })
  service: Service;

  @OneToMany(() => Department, (dep) => dep.location, {
    cascade: true,
  })
  department: Department[];

  @ManyToOne(() => Province, { nullable: true })
  province: Province;

  @ManyToOne(() => City, { nullable: true })
  city: City;

  @ManyToOne(() => Area, { nullable: true })
  area: Area;
}
