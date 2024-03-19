import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { GrnStatus } from 'src/utils/constant';

export class CreateItemGrnDTO {
  @ApiProperty()
  @IsOptional()
  requestedQty: number;

  @ApiProperty()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  grnQty: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  cancelQty: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  balance: number;

  @IsOptional()
  @ApiProperty()
  @IsPositive()
  remainingQty: number;
}

export class CreateGrnDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  po: string;

  @IsOptional()
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  remarks: string;

  @IsOptional()
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  department: string;

  @ApiPropertyOptional()
  @IsOptional()
  status?: GrnStatus;

  @ValidateNested({ each: true })
  @Type(() => CreateItemGrnDTO)
  @IsArray()
  @ApiProperty({ type: [CreateItemGrnDTO] })
  items: CreateItemGrnDTO[];
}
