// create-gate-pass.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InventoryType } from 'src/utils/constant';

export class addItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  item: string;

  @ApiProperty()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty()
  @IsOptional()
  min: number;

  @ApiProperty()
  @IsOptional()
  max: number;

  @ApiProperty()
  @IsOptional()
  type: InventoryType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  department: string;
}
