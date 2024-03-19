import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleTemplateController } from './role-template.controller';
import { RoleTemplateService } from './role-template.service';
import { Role } from 'src/entities/role.entity';
import { Menu } from 'src/entities/menu.entity';
import { Action } from 'src/entities/action.entity';
import { UserEntity } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Menu, Action, UserEntity])],
  providers: [RoleTemplateService],
  controllers: [RoleTemplateController],
  exports: [],
})
export class RoleTemplateModule {}
