import { Area } from 'src/entities/area.entity';
import { City } from 'src/entities/city.entity';
import { Country } from 'src/entities/country.entity';
import { Province } from 'src/entities/province.entity';
import { VendorItem } from 'src/entities/vendorItem.entity';
import { VendorType } from 'src/utils/constant';

export class VendorResponseDto {
  id: string;
  name: string;
  vendorType: VendorType;
  address: string;
  vendorCode: string;
  country: Country;
  city: City;
  province: Province;
  area: Area;
  email: string;
  mobile: string;
  creditDays: string;
  deliveryDays: string;
  focalPerson: string;
  ntn: string;
  subAccount: string;
  companyType: string;
  branchName: string;
  taxType: string;
  bankName: string;
  iban: string;
  branchCode: string;
  accountTitle: string;
  account: string;
  items: VendorItem[]; // Include the associated items

  constructor(entity: any) {
    this.id = entity?.id;
    this.name = entity?.name;
    this.vendorType = entity?.vendorType;
    this.address = entity.address;
    this.vendorCode = entity.vendorCode;
    this.country = entity.country as Country;
    this.city = entity?.city;
    this.province = entity?.province;
    this.area = entity?.area;
    this.email = entity.email;
    this.mobile = entity.mobile;
    this.creditDays = entity.creditDays;
    this.deliveryDays = entity.deliveryDays;
    this.focalPerson = entity.focalPerson;
    this.ntn = entity.ntn;
    this.subAccount = entity.subAccount;
    this.companyType = entity.companyType;
    this.branchName = entity.branchName;
    this.taxType = entity.taxType;
    this.bankName = entity.bankName;
    this.iban = entity.iban;
    this.branchCode = entity.branchCode;
    this.accountTitle = entity.accountTitle;
    this.account = entity.account;
    this.items =
      entity?.items?.map((item) => {
        const itemData: any = {
          itemId: item.item.id,
          itemCode: item.item?.itemCode,
          description: item.item?.description,
          name: item.item?.name,
          price: item.price,
        };

        return itemData;
      }) || [];
  }
}
