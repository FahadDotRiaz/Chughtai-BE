import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Service } from 'src/utils/constant';

export class QueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  city: string;

  @ApiPropertyOptional()
  @IsOptional()
  area: string;

  @ApiPropertyOptional()
  @IsOptional()
  province: string;

  @ApiPropertyOptional()
  @IsOptional()
  address: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Service, { each: true })
  service: string[];

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
