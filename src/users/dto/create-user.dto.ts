// create-user.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
// import { CreateUserRoleFeatureDTO } from './create-user-role-feature';

export class CreateUserDepartmentRoleComplexDto {
  @ApiProperty()
  department: string;
  user?: string;
  @ApiProperty()
  role: string;
  @ApiProperty()
  permissions: Record<string, any>;
}

export class CreateUserDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'strong_password',
  })
  password: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'The contact number of the user',
    example: '+1 123-456-7890',
  })
  contact: string;

  @ApiProperty({
    description: 'The cnic number of the user',
  })
  cnic: string;

  @ApiProperty({
    description: 'The profile of the user',
  })
  file: string;

  @ApiProperty({
    type: [String],
    required: false,
  })
  @IsArray()
  roles?: string[];
}
