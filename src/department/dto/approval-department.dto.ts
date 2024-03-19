import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class DepartmentApprovalDto {
  @ApiProperty()
  @IsOptional()
  mirApproval: boolean;

  @ApiProperty()
  @IsOptional()
  mrrApproval: boolean;

  @ApiProperty()
  @IsOptional()
  grnApproval: boolean;
}
