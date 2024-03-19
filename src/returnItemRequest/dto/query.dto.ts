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
  mrrCode: number;

  @ApiPropertyOptional()
  @IsOptional()
  fromDepartment: string;

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
