import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AreaDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  city: string;
}
