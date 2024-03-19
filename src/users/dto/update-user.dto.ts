import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
  })
  username: string;

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
    description: 'Array of item IDs to associate with the vendor',
    type: [String],
    required: false,
  })
  @IsArray()
  roles?: string[];
}
