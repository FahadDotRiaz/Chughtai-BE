import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { GrnStatus } from 'src/utils/constant';
// import { GrnStatus } from 'src/utils/constant';

export class QueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(GrnStatus)
  status?: GrnStatus;

  @ApiPropertyOptional()
  @IsOptional()
  remarks: string;

  @ApiPropertyOptional()
  @IsOptional()
  grnCode: number;

  @ApiPropertyOptional()
  @IsOptional()
  poCode: number;

  @ApiPropertyOptional()
  @IsOptional()
  vendorName: string;

  @ApiPropertyOptional()
  @IsOptional()
  createDateTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  vendorId: string;

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsEnum(GrnStatus)
  // status?: GrnStatus;

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
