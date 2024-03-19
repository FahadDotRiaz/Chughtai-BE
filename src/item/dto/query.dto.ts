import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class QueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  itemCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  measuringUnit: string;

  @ApiPropertyOptional()
  @IsOptional()
  secondaryUnit: string;

  @ApiPropertyOptional()
  @IsOptional()
  packingQty: string;

  @ApiPropertyOptional()
  @IsOptional()
  packingSize: string;

  @ApiPropertyOptional()
  @IsOptional()
  rack: string;

  @ApiPropertyOptional()
  @IsOptional()
  category: string;

  @ApiPropertyOptional()
  @IsOptional()
  search: string;

  @ApiPropertyOptional()
  @IsOptional()
  isBatch: string;

  @ApiPropertyOptional()
  @IsOptional()
  expireDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  manufacturingDate: string;
}

export class PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  page: number;

  @ApiPropertyOptional()
  @IsOptional()
  limit: number;
}

export class ItemChildDto{
  @ApiPropertyOptional()
  @IsOptional()
  name: string;
}
