// role-template.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Not, Repository } from 'typeorm';
import { CreateRoleTemplateDto } from './dto/create-role-template.dto';
import { Role } from 'src/entities/role.entity';
import { PaginationDto, QueryDto } from './dto/query.dto';
import { Menu } from 'src/entities/menu.entity';
import { Action } from 'src/entities/action.entity';
// import { ModuleType } from 'src/utils/constant';
import { roleSearchFields } from 'src/utils/searchColumn';
import { UserEntity } from 'src/entities/user.entity';
// import { ModuleType } from 'src/utils/constant';

@Injectable()
export class RoleTemplateService {
  constructor(
    @InjectRepository(Role)
    private readonly roleTemplateRepository: Repository<Role>,
    @InjectRepository(Action)
    private readonly actionRepo: Repository<Action>,
    @InjectRepository(Menu)
    private readonly menuRepo: Repository<Menu>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async createRoleTemplate(createRoleTemplateDto: CreateRoleTemplateDto) {
    const roleName = createRoleTemplateDto.name.trim().replace(/\s+/g, ' ');
    const role = await this.roleTemplateRepository
      .createQueryBuilder('role_template')
      .leftJoinAndSelect('role_template.department', 'department')
      .where('department.id = :id', { id: createRoleTemplateDto.department })
      .andWhere('role_template.isArchived = :isArchived', { isArchived: false })
      .andWhere(
        "TRIM(REGEXP_REPLACE(role_template.name, '\\s+', ' ')) = :name",
        { name: roleName },
      )
      .getOne();
    if (role) {
      throw new BadRequestException('Role name already exist');
    }
    const department = { id: createRoleTemplateDto.department };

    const mappedRequestDto: DeepPartial<Role> = {
      ...createRoleTemplateDto,
      department,
      actions: createRoleTemplateDto.actions.map((entity) => {
        return { id: entity };
      }),
    };
    const roleTemplate =
      await this.roleTemplateRepository.create(mappedRequestDto);
    return await this.roleTemplateRepository.save(roleTemplate);
  }
  async getAllRoleTemplates(
    query: QueryDto,
    pagination: PaginationDto,
  ): Promise<any> {
    const { name, type, search, department } = query;
    const { page, limit } = pagination;
    const skip = ((page ?? 1) - 1) * (limit ?? 10);

    const queryBuilder = this.roleTemplateRepository
      .createQueryBuilder('role_template')
      .leftJoinAndSelect('role_template.department', 'department')
      .leftJoinAndSelect('role_template.actions', 'actions')
      .where('role_template.isArchived = :isArchived', { isArchived: false })
      .orderBy('role_template.createDateTime', 'DESC');

    // Add filters
    if (name) {
      queryBuilder.andWhere('role_template.name ILIKE :name', {
        name: `%${name}%`,
      });
    }
    // if (search) {
    //   queryBuilder.andWhere('role_template.name ILIKE :search', {
    //     search: `%${search}%`,
    //   });
    // }
    if (type) {
      queryBuilder.andWhere('department.type::text ILIKE :type', {
        type: `%${type}%`,
      });
    }
    if (department) {
      queryBuilder.andWhere('department.id = :department', { department });
    }
    if (search && roleSearchFields.length > 0) {
      const whereConditions = roleSearchFields
        .map((field) => {
          if (field === 'name' || field === 'description') {
            return `role_template.${field} ILIKE :search`;
          }
          if (field === 'department') {
            return `department.name ILIKE :search`;
          }
          if (field === 'type') {
            return `department.type::text ILIKE :search`;
          }
        })
        .join(' OR ');

      queryBuilder.andWhere(`(${whereConditions})`, {
        search: `%${search}%`,
        type: `%${type}%`,
      });
    }
    // Get total count without applying skip and limit
    const totalRows = await queryBuilder.getCount();

    // Get the data
    const list = await queryBuilder.skip(skip).take(limit).getMany();

    return { totalRows, list };
  }
  async wrapParentPermissions(
    parentId: string,
    permissions: Set<string>,
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
      permissions.add(parentMenu.menuKey);
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
    const permissionsSet = new Set<string>();
    for (const action of role.actions) {
      permissionsSet.add(action.menu.menuKey);

      if (action.menu.parentId) {
        await this.wrapParentPermissions(
          action.menu.parentId,
          permissionsSet,
          new Set(),
        );
      }
    }
    const permissions = Array.from(permissionsSet);
    return permissions;
  }

  async getRoleTemplateById(id: string): Promise<any> {
    const roleTemplate = await this.roleTemplateRepository.findOne({
      where: { id: id },
      relations: ['actions', 'actions.menu'],
    });
    if (!roleTemplate) {
      throw new NotFoundException(`Role template with ID not found`);
    }
    const menuList = await this.generatePermissions(roleTemplate);
    const permissions = roleTemplate.actions.map((action) => action.id);

    roleTemplate.actions = permissions as any;
    roleTemplate['menu'] = menuList as any;
    return roleTemplate;
  }

  async updateRoleTemplate(
    id: string,
    roleTemplateDto: CreateRoleTemplateDto,
  ): Promise<Role> {
    const roleName = roleTemplateDto.name.trim().replace(/\s+/g, ' ');
    const existingRole = await this.roleTemplateRepository.findOne({
      where: {
        name: roleName,
        id: Not(id),
        isArchived: false,
        department: { id: roleTemplateDto.department },
      },
    });
    if (existingRole) {
      throw new BadRequestException('Role name already exist');
    }
    const roleTemplate = await this.getRoleTemplateById(id);

    const role = await this.roleTemplateRepository
      .createQueryBuilder('role_template')
      .leftJoinAndSelect('role_template.department', 'department')
      .where('department.id = :id', { id: roleTemplateDto.department })
      .andWhere('role_template.isArchived = :isArchived', { isArchived: false })
      .andWhere('role_template.name = :name', {
        name: roleTemplateDto.name,
      })
      .andWhere('role_template.id != :roleId', { roleId: roleTemplate.id })
      .getOne();
    if (role) {
      throw new BadRequestException('Role name already exist');
    }
    if (!roleTemplate) {
      throw new NotFoundException(`Role template with ID not found`);
    }

    // Update scalar properties of the role template
    roleTemplate.name = roleTemplateDto.name;
    roleTemplate.description = roleTemplateDto.description;

    // Update the department
    roleTemplate.department = { id: roleTemplateDto.department };

    // Retrieve and update the actions
    const actions = await Promise.all(
      roleTemplateDto.actions.map(async (entityId) => {
        const action = await this.actionRepo.findOne({
          where: { id: entityId },
        });
        if (!action) {
          throw new NotFoundException(`Action with ID not found`);
        }
        return action;
      }),
    );

    roleTemplate.actions = actions;

    await this.roleTemplateRepository.save(roleTemplate);

    return roleTemplate;
  }
  async deleteRoleTemplate(id: string) {
    const roleTemplate = await this.getRoleTemplateById(id);
    const usersWithRoleTemplate = await this.userRepo.find({
      where: { roles: { id: id }, isArchived: false },
    });
    if (usersWithRoleTemplate.length > 0) {
      throw new Error(
        'Cannot delete role it is assigned to one or more users.',
      );
    }
    if (roleTemplate) {
      roleTemplate.isArchived = true;
      await this.roleTemplateRepository.save(roleTemplate);
    }

    return roleTemplate;
  }

  // async getRoleTemplate() {
  //   const moduleTypes = [
  //     ModuleType.INVENTORY,
  //     ModuleType.PROCUREMENT,
  //     ModuleType.SUPER_ADMIN,
  //     ModuleType.STORE_SETTING,
  //     ModuleType.SUPER_ADMIN,
  //     ModuleType.DEPARTMENT_SETTING,
  //   ];

  //   const appLevel = await this.menuRepo
  //     .createQueryBuilder('menu')
  //     .select('menu.type') // Select the menu type
  //     .addSelect('COUNT(menu.id)', 'count') // Optionally, count the number of records for each type
  //     .where('menu.type IN (:...moduleTypes)', { moduleTypes })
  //     .groupBy('menu.type')
  //     .orderBy('MAX(menu.createDateTime)', 'ASC')
  //     .getRawMany();
  //   const topArr = [];
  //   for (const app of appLevel) {
  //     const appObj = { key: app.menu_type, name: app.menu_type, modules: [] };
  //     // const arr = [];
  //     const topLevelMenus = await this.menuRepo
  //       .createQueryBuilder('menu')
  //       .where('menu.parentId IS NULL')
  //       .andWhere('menu.type = :type', { type: app.menu_type })
  //       .orderBy('menu.orderNumber', 'ASC')
  //       .getMany();
  //     for (const topLevel of topLevelMenus) {
  //       const topObj = {
  //         key: topLevel.menuKey,
  //         name: topLevel.name,
  //         childern: [],
  //         actions: [],
  //       };
  //       const childs = await this.menuRepo.find({
  //         where: { parentId: topLevel.id },
  //       });
  //       if (childs && childs?.length > 0) {
  //         for (const child of childs) {
  //           const actions = await this.actionRepo.find({
  //             where: { menu: { id: child.id } },
  //           });
  //           topObj.childern.push({
  //             key: child.menuKey,
  //             name: child.name,
  //             actions: actions.map((entity) => {
  //               return {
  //                 key: entity.actionKey,
  //                 name: entity.name,
  //                 id: entity.id,
  //               };
  //             }),
  //           });
  //         }
  //         appObj.modules.push(topObj);
  //       } else {
  //         const actions = await this.actionRepo.find({
  //           where: { menu: { id: topLevel.id } },
  //         });
  //         topObj.actions = actions.map((entity) => {
  //           return {
  //             key: entity.actionKey,
  //             name: entity.name,
  //             id: entity.id,
  //           };
  //         });
  //         appObj.modules.push(topObj);
  //       }
  //     }
  //     topArr.push(appObj);
  //   }

  //   return topArr;
  // }
  async fetchMenusRecursively(parentId: string | null = null): Promise<any[]> {
    const menus = await this.menuRepo
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.actions', 'actions')
      .where('menu.parentId = :parentId', { parentId })
      .orderBy('menu.orderNumber', 'ASC')
      .getMany();

    const results = [];
    for (const menu of menus) {
      const obj = {
        key: menu.menuKey,
        name: menu.name,
        actions: menu.actions.map((action) => ({
          key: action.actionKey,
          name: action.name,
          id: action.id,
        })),
      };

      const children = await this.fetchMenusRecursively(menu.id);
      obj['children'] = children;
      results.push(obj);
    }

    return results;
  }

  async fetchTopLevelMenus(query: any): Promise<any[]> {
    const topLevelMenus = await this.menuRepo
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.actions', 'actions')
      .where('menu.parentId IS NULL')
      .orderBy('menu.orderNumber', 'ASC')
      .getMany();

    const results = [];
    for (const topLevelMenu of topLevelMenus) {
      if (query?.type.includes(topLevelMenu.menuKey)) {
        const obj = {
          key: topLevelMenu.menuKey,
          name: topLevelMenu.name,
          actions: topLevelMenu.actions.map((action) => ({
            key: action.actionKey,
            name: action.name,
            id: action.id,
          })),
        };

        const children = await this.fetchMenusRecursively(topLevelMenu.id);
        obj['children'] = children;
        results.push(obj);
      }
    }

    return results;
  }
}
