import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { PurchaseOrder } from './purchaseOrder.entity';
import { BaseEntity } from './base.entity';
import { VendorType } from 'src/utils/constant';
// import { Item } from './item.entity';
import { City } from './city.entity';
import { Area } from './area.entity';
import { Province } from './province.entity';
import { Country } from './country.entity';
import { VendorItem } from './vendorItem.entity';

@Entity({ name: 'vendor' })
export class Vendor extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'enum', enum: VendorType, nullable: true })
  vendorType: VendorType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  vendorCode: string;

  // @Column({ type: 'varchar', length: 100, nullable: true })
  // country: string;

  // @Column({ type: 'varchar', length: 100, nullable: true })
  // city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mobile: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  creditDays: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deliveryDays: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  focalPerson: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ntn: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subAccount: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  companyType: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  branchName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  taxType: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bankName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  iban: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  branchCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  accountTitle: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  account: string;

  @OneToMany(() => PurchaseOrder, (purchaseOrder) => purchaseOrder.vendor)
  purchaseOrders: PurchaseOrder[];

  // @ManyToMany(() => Item, (item) => item.vendors, { cascade: true })
  // items: Item[];
  @OneToMany(() => VendorItem, (item) => item.vendor)
  items: VendorItem[];

  @ManyToOne(() => City, (city) => city.vendors)
  city: City;

  @ManyToOne(() => Area, (area) => area.vendors)
  area: Area;

  @ManyToOne(() => Province, (province) => province.vendor)
  province: Province;

  @ManyToOne(() => Country, (country) => country.vendor)
  country: Country;
}
