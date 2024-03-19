import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class QueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  remarks: string;

  @ApiPropertyOptional()
  @IsOptional()
  poCode: number;

  @ApiPropertyOptional()
  @IsOptional()
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  vendor: string;

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
