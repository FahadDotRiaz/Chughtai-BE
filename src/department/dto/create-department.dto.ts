import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { DepartmentType } from 'src/utils/constant';

export class DepartmentDto {
  @ApiProperty({
    description: 'The name of the department',
    example: 'Engineering Department',
  })
  name: string;

  @ApiProperty()
  @IsOptional()
  location?: string;

  @ApiProperty()
  @IsOptional()
  managedBy?: string;

  @ApiProperty({
    description: 'The type of the department',
    enum: DepartmentType,
    enumName: 'DepartmentType',
    example: 'Store',
  })
  type: DepartmentType;
}
