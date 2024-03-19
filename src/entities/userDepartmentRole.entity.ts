// // src/users/user-department-role.entity.ts
// import { Entity, ManyToOne } from 'typeorm';
// import { UserEntity } from './user.entity';
// // import { Department } from './department.entity';
// import { Role } from './role.entity';
// import { BaseEntity } from './base.entity';

// @Entity()
// export class UserDepartmentRole extends BaseEntity {
//   @ManyToOne(() => UserEntity, (user) => user.userDepartmentRoles)
//   user: UserEntity;

//   // @ManyToOne(() => Department, (department) => department.userDepartmentRoles)
//   // department: Department;

//   @ManyToOne(() => Role, (role) => role.userDepartmentRoles)
//   role: Role;

//   // @Column('jsonb')
//   // permissions: Record<string, any>;
// }
