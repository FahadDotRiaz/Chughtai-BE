import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';
import { Service } from 'src/utils/constant';

export class LocationDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  area: string;

  @ApiProperty()
  @IsString()
  province: string;

  @ApiProperty()
  @IsEnum(Service, { message: 'Invalid service type' })
  service: Service;
}
