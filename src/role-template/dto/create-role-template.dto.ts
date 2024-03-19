// create-role-template.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

export class CreateRoleTemplateDto {
  @ApiProperty({
    description: 'The name of the role template',
    example: 'Admin Role',
  })
  name: string;

  @ApiProperty({
    description: 'The name of the role template',
    example: 'Admin Role',
  })
  @IsOptional()
  description: string;

  @IsOptional()
  @ApiProperty({
    description: 'The ID of the department',
    example: 'uuid',
  })
  department: string;

  @ApiProperty({
    type: [String],
    required: false,
  })
  @IsArray()
  actions?: string[];
}
