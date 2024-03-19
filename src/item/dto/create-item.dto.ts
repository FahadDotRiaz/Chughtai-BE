// create-item.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  itemCode: string;

  @IsOptional()
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  departmentId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  measuringUnit?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  secondaryUnit?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  packingQty?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  packingSize?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isBatch?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isParent?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  expireDate?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  manufacturingDate?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  temprature?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsString()
  rack: string;

  @ApiProperty()
  @IsOptional()
  children?: string[];
}
