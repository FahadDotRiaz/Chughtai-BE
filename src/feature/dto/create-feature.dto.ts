import { ApiProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';

export class CreateFeatureDto {
  @ApiProperty({
    description: 'The name of the feature',
    type: String,
    maxLength: 300,
  })
  @Column({ type: 'varchar', length: 300 })
  name: string;

  @ApiProperty({
    description: 'A JSON object representing the feature list',
    type: Object,
    nullable: true,
  })
  @Column({ type: 'jsonb', nullable: true })
  featureList: object;
}
