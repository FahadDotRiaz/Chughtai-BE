// purchase-order.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Currency } from 'src/utils/constant';

export class CreatePurchaseOrderItemDto {
  @ApiProperty()
  quantity: number;

  @ApiProperty()
  remarks: string;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  salesTax: number;

  @ApiProperty()
  federalTax: number;

  @ApiProperty()
  itemId: string;

  @ApiProperty()
  deliveryDate: string;
}

export class CreatePurchaseOrderDto {
  @ApiProperty()
  remarks: string;

  @ApiProperty()
  freight: string;

  @ApiProperty()
  currency: Currency;

  @ApiProperty()
  paymentTerms: string;

  @ApiProperty()
  deliveryTerms: string;

  @ApiProperty()
  deliveryDate: string;

  @ApiProperty()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty()
  vendorId: string; // Assuming you use the vendor's ID

  @ApiProperty({ type: [CreatePurchaseOrderItemDto] })
  items: CreatePurchaseOrderItemDto[];
}
