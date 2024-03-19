import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class QueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  store: string;

  @ApiPropertyOptional()
  @IsOptional()
  comments: string;

  @ApiPropertyOptional()
  @IsOptional()
  requestCode: number;

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
