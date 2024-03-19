// // user-role-feature.entity.ts
// import { Entity, ManyToOne, Column, JoinColumn } from 'typeorm';
// import { UserEntity } from '../../entities/user.entity';
// import { Location } from '../../entities/location.entity';
// import { ApiProperty } from '@nestjs/swagger';

// @Entity()
// export class CreateUserRoleFeatureDTO {
//   @ManyToOne(() => UserEntity, (user) => user.userRoleFeatures)
//   @JoinColumn({ name: 'user_id' })
//   user: UserEntity;

//   @ApiProperty({
//     description: 'The role template associated with this role feature',
//     type: 'jsonb',
//     nullable: true,
//   })
//   @Column({ type: 'jsonb', nullable: true })
//   roleTemplate: object[];

//   @ApiProperty({
//     description: 'The location associated with this role feature',
//     type: () => String,
//   })
//   @ManyToOne(() => Location)
//   @JoinColumn({ name: 'location_id' })
//   location: Location;
// }
