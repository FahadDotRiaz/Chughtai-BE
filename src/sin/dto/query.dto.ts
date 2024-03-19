import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';


export class QueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  sinNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  mirNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  generatedDate: string;
}

export class PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  page: number;

  @ApiPropertyOptional()
  @IsOptional()
  limit: number;
}
