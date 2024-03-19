import { ApiProperty } from '@nestjs/swagger';
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

export class CreateItemConsumptionDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  consumeQty: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  patients: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  sinTotal: number;

  @ApiProperty()
  @IsNotEmpty()
  itemId: string;
}

export class CreateConsumptionDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sin: string;

  @IsOptional()
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  remarks: string;

  @IsOptional()
  consumptionCode: string;

  @ApiProperty()
  @IsNotEmpty()
  departmentId: string;

  @ValidateNested({ each: true })
  @Type(() => CreateItemConsumptionDTO)
  @IsArray()
  @ApiProperty({ type: [CreateItemConsumptionDTO] })
  items: CreateItemConsumptionDTO[];
}
