import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ProvinceDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  country: string;

}
