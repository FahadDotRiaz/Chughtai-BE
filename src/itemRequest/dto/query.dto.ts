import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class QueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  stage: string;

  @ApiPropertyOptional()
  @IsOptional()
  mirNumber: number;

  @ApiPropertyOptional()
  @IsOptional()
  toDepartment: string;

  @ApiPropertyOptional()
  @IsOptional()
  fromDepartment: string;

  @ApiPropertyOptional()
  @IsOptional()
  isSuggested: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  createDateTime: string;

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

export class SinQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  sinId: string;
}

export class SearchDto {
  @ApiPropertyOptional()
  @IsOptional()
  search: string;
}
