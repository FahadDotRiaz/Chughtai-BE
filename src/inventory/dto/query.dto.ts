import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { InventoryType } from 'src/utils/constant';

export class QueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  type: InventoryType;

  @ApiPropertyOptional()
  @IsOptional()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  itemCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  min: number;

  @ApiPropertyOptional()
  @IsOptional()
  max: number;

  @ApiPropertyOptional()
  @IsOptional()
  quantity: number;

  // @ApiPropertyOptional()
  // @IsOptional()
  // search: string;
}

export class PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  page: number;

  @ApiPropertyOptional()
  @IsOptional()
  limit: number;
}
