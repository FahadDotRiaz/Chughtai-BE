import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RackDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  code: string;
}
