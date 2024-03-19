// import { ApiProperty } from '@nestjs/swagger';
// import { IsNotEmpty, IsString } from 'class-validator';

// export class CreateVendorDto {
//   @ApiProperty()
//   @IsNotEmpty()
//   @IsString()
//   name: string;
// }
// vendor.dto.ts
import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsEmail,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VendorType } from 'src/utils/constant';
import { Type } from 'class-transformer';

class ItemPriceDto {
  @ApiProperty({ description: 'Item ID', type: String })
  @IsString()
  itemId: string;

  @ApiProperty({ description: 'Price for the item', type: Number })
  price: number;
}
export class VendorDto {
  @ApiProperty({ description: 'Name of the vendor', example: 'Vendor ABC' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of the vendor',
    enum: VendorType,
    required: false,
  })
  @IsOptional()
  @IsEnum(VendorType)
  vendorType?: VendorType;

  @ApiProperty({ description: 'Address of the vendor', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Country of the vendor', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'City of the vendor', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'Area of the vendor', required: false })
  @IsOptional()
  @IsString()
  area?: string;

  @ApiProperty({ description: 'Province of the vendor', required: false })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiProperty({ description: 'Email of the vendor', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Mobile number of the vendor', required: false })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiProperty({ description: 'Credit days for the vendor', required: false })
  @IsOptional()
  @IsString()
  creditDays?: string;

  @ApiProperty({ description: 'Delivery days for the vendor', required: false })
  @IsOptional()
  @IsString()
  deliveryDays?: string;

  @ApiProperty({ description: 'Focal person of the vendor', required: false })
  @IsOptional()
  @IsString()
  focalPerson?: string;

  @ApiProperty({
    description: 'NTN (National Tax Number) of the vendor',
    required: false,
  })
  @IsOptional()
  @IsString()
  ntn?: string;

  @ApiProperty({ description: 'Sub-account of the vendor', required: false })
  @IsOptional()
  @IsString()
  subAccount?: string;

  @ApiProperty({ description: 'Type of the company', required: false })
  @IsOptional()
  @IsString()
  companyType?: string;

  @ApiProperty({ description: 'Branch name of the vendor', required: false })
  @IsOptional()
  @IsString()
  branchName?: string;

  @ApiProperty({ description: 'Tax type of the vendor', required: false })
  @IsOptional()
  @IsString()
  taxType?: string;

  @ApiProperty({ description: 'Bank name of the vendor', required: false })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ description: 'IBAN of the vendor', required: false })
  @IsOptional()
  @IsString()
  iban?: string;

  @ApiProperty({ description: 'Branch code of the vendor', required: false })
  @IsOptional()
  @IsString()
  branchCode?: string;

  @ApiProperty({ description: 'Account title of the vendor', required: false })
  @IsOptional()
  @IsString()
  accountTitle?: string;

  @ApiProperty({ description: 'Account number of the vendor', required: false })
  @IsOptional()
  @IsString()
  account?: string;

  @ApiProperty({
    description: 'Array of item IDs with prices to associate with the vendor',
    type: [ItemPriceDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPriceDto)
  items?: ItemPriceDto[];
}
