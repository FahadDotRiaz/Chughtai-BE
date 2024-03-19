import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InventoryType } from 'src/utils/constant';
export class UpdateInventoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  item: string;

  @ApiProperty()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  max: number;

  @ApiProperty()
  @IsOptional()
  min: number;

  @ApiProperty()
  @IsOptional()
  type: InventoryType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  location: string;
}
