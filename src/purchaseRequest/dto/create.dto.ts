import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class PurchaseRequestItemDto {
  @ApiProperty()
  quantity: number;

  @ApiProperty()
  remarks: string;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  salesTax: number;

  @ApiProperty()
  fedralTax: number;

  @ApiProperty()
  itemId: string;

  @ApiProperty()
  delivaryDate: string;
}

export class CreatePurchaseRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  requester: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  comments: string;

  @IsOptional()
  requestCode: string;

  @ApiProperty({ type: [PurchaseRequestItemDto] })
  @IsOptional()
  @IsArray()
  items: PurchaseRequestItemDto[];
}
