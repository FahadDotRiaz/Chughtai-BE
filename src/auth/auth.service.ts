import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import * as bcrypt from 'bcryptjs';
import { Menu } from 'src/entities/menu.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from 'src/entities/role.entity';
import { UserEntity } from 'src/entities/user.entity';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(Menu)
    private readonly menuRepo: Repository<Menu>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async validateUser(
    email: string,
    password: string,
    deviceToken?: string,
  ): Promise<any> {
    const user = await this.userService.findByEmail({ email }, deviceToken);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };

    return this.jwtService.sign(payload);
  }

  async logout(id: string) {
    const user = await this.userRepo.findOne({
      where: {
        id: id,
        isArchived: false,
      },
    });
    if (user) {
      user.deviceToken = null;
    }
    return await this.userRepo.save(user);
  }

  async wrapParentPermissions(
    parentId: string,
    permissions: any,
    visitedMenus: Set<string>,
  ) {
    if (visitedMenus.has(parentId)) {
      return;
    }
    const parentMenu = await this.menuRepo.findOne({
      where: { id: parentId },
    });
    if (parentMenu) {
      visitedMenus.add(parentId);
      permissions[parentMenu.menuKey] = permissions[parentMenu.menuKey] || {};
      permissions[parentMenu.menuKey]['isActive'] = true;
      if (parentMenu.parentId) {
        await this.wrapParentPermissions(
          parentMenu.parentId,
          permissions,
          visitedMenus,
        );
      }
    }
  }

  async generatePermissions(role: any) {
    const permissions = {};
    for (const action of role.actions) {
      permissions[action.menu.menuKey] = permissions[action.menu.menuKey] || {};
      permissions[action.menu.menuKey][action.actionKey] = true;

      if (action.menu.parentId) {
        await this.wrapParentPermissions(
          action.menu.parentId,
          permissions,
          new Set(),
        );
      }
    }

    return permissions;
  }

  async generateUserResponse(secondObject: any) {
    const resolvedRoles = secondObject?.roles.map((role) => {
      const roleId = role.id;
      const roleName = role.name;
      const departmentId = role.department.id;
      const departName = role.department.name;
      const departmentType = role.department.type;
      const locationId = role.department.location.id;
      const locationName = role.department.location.name;
      return {
        roleId,
        roleName,
        departmentId,
        departName,
        departmentType,
        locationId,
        locationName,
      };
    });
    const userResponse = {
      id: secondObject?.id,
      username: secondObject?.username,
      email: secondObject?.email,
      cnic: secondObject?.cnic,
      file: secondObject?.file,
      roles: resolvedRoles,
      isSuperAdmin: secondObject?.isSuperAdmin,
    };

    return userResponse;
  }

  async rolePermissions(id: string) {
    const queryBuilder = this.roleRepo
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.department', 'department')
      .leftJoinAndSelect('role.actions', 'actions')
      .leftJoinAndSelect('actions.menu', 'menu')
      .where('role.id = :id', { id })
      .andWhere('role.isArchived = :isArchived', { isArchived: false })
      .getOne();
    return queryBuilder;
  }
}
