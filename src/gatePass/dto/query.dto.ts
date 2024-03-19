import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class QueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  gpType: string;

  @ApiPropertyOptional()
  @IsOptional()
  IgpCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  OgpCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  createDateTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  vendorId: string;

  @ApiPropertyOptional()
  @IsOptional()
  driverName: string;

  @ApiPropertyOptional()
  @IsOptional()
  date: string;

  @ApiPropertyOptional()
  @IsOptional()
  startTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  endTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  poCode: number;

  @ApiPropertyOptional()
  @IsOptional()
  vendorName: string;

  @ApiPropertyOptional()
  @IsOptional()
  itemUnit: string;

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
