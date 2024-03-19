import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DepartmentUpdateDTO {
  @IsOptional()
  @ApiProperty()
  @IsString()
  suggestedQty: number;

  @IsOptional()
  @ApiProperty()
  @IsString()
  itemId: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  suggestedItemId: string;
}
