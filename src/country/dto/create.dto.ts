import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CountryDto {
  @ApiProperty()
  @IsString()
  name: string;

}
