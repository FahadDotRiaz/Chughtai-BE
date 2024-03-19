import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class NotificationDto {
  @ApiProperty()
  @IsString()
  departmentId: string;

  @ApiProperty()
  @IsString()
  payLoad?: any;

  @ApiProperty()
  @IsString()
  menuKey?: string;
}
