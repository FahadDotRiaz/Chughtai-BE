import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CityDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  province: string;

}
