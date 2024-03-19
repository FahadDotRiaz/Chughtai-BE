import { IsString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ItemsDTO {
  @ApiProperty()
  @IsString()
  itemId: string;

  @ApiProperty()
  @IsNumber()
  returnQty: number;

  @ApiProperty()
  @IsNumber()
  estimatedPrice: number;
}

export class MaterialAcceptDTO {
  @ApiProperty()
  @IsString()
  mrrlId: string;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => ItemsDTO)
  @IsArray()
  @ApiProperty({ type: [ItemsDTO] })
  items: ItemsDTO[];
}
