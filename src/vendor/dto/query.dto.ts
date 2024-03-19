import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class QueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  country: string;

  @ApiPropertyOptional()
  @IsOptional()
  city: string;

  @ApiPropertyOptional()
  @IsOptional()
  province: string;

  @ApiPropertyOptional()
  @IsOptional()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  mobile: string;

  @ApiPropertyOptional()
  @IsOptional()
  area: string;

  @ApiPropertyOptional()
  @IsOptional()
  vendorCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  address: string;

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
