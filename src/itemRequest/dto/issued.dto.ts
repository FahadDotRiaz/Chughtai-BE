import {
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ItemDTO {
  @ApiProperty()
  @IsString()
  itemId: string;

  @ApiProperty()
  @IsNumber()
  issuedQty: number;

  @ApiProperty()
  @IsNumber()
  cancel: number;

  @ApiProperty()
  @IsNumber()
  pending: number;

  @ApiProperty()
  @IsNumber()
  balance: number;

  @IsOptional()
  totalIssue?: number;
  @IsOptional()
  totalCancel?: number;
  @IsOptional()
  totalRequested?: number;
}

export class CustomItemDto {
  @ApiProperty()
  @IsNumber()
  itemId: number;

  @ApiProperty()
  @IsArray()
  suggestedItems: string[];
}

export class MaterialIssueDTO {
  @ApiProperty()
  @IsString()
  mirlId: string;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => ItemDTO)
  @IsArray()
  @ApiProperty({ type: [ItemDTO] })
  items: ItemDTO[];

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => CustomItemDto)
  @ApiProperty({ type: [CustomItemDto] })
  @IsArray()
  customItems?: CustomItemDto[];
}

export class StatusDto {
  @ApiProperty()
  @IsString()
  mirId: string;

  @ApiProperty()
  @IsString()
  itemId: string;

  @ApiProperty()
  @IsString()
  status: string;

  @ApiProperty()
  @IsNumber()
  customItemId: number;
}
