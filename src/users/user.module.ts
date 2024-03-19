import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity } from '../entities/user.entity';
import { Role } from 'src/entities/role.entity';
import { Menu } from 'src/entities/menu.entity';
// import { UserDepartmentRole } from 'src/entities/userDepartmentRole.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, Role, Menu])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
