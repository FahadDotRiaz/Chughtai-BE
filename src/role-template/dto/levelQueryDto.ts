import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class LevelQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  type: string[];
}
