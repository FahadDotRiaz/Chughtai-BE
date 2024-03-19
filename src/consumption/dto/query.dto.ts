import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class QueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  createDateTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  remarks: string;

  @ApiPropertyOptional()
  @IsOptional()
  consumptionCode: number;

  @ApiPropertyOptional()
  @IsOptional()
  search: string;
}

export class PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  page: number;

  @ApiPropertyOptional()
  @IsOptional()
  limit: number;
}

export class DepartmentPaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  storeId: string;

  @ApiPropertyOptional()
  @IsOptional()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  consumptionCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  remarks: string;

  @ApiPropertyOptional()
  @IsOptional()
  createDateTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  search: string;
}
