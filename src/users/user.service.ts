import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Not, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { PaginationDto, QueryDto } from './dto/query.dto';
import { userSearchFields } from 'src/utils/searchColumn';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'src/entities/role.entity';
import { Menu } from 'src/entities/menu.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Menu)
    private readonly menuRepo: Repository<Menu>,
  ) {}

  async findByEmail(
    { email }: { email: string },
    deviceToken?: string,
  ): Promise<any | undefined> {
    const user = await this.userRepository
      .createQueryBuilder('users')
      .leftJoin('users.roles', 'roles')
      .leftJoin('roles.department', 'department')
      .leftJoin('roles.actions', 'actions')
      .leftJoin('actions.menu', 'menu')
      .leftJoin('department.location', 'location')
      .where('users.email = :email', { email })
      .andWhere('users.isArchived = :isArchived', { isArchived: false })
      .select([
        'users.id',
        'users.username',
        'users.email',
        'users.password',
        'users.file',
        'users.cnic',
        'users.isSuperAdmin',
        'roles.id',
        'roles.name',
        'department.id',
        'department.name',
        'department.type',
        'actions.id',
        'actions.name',
        'actions.actionKey',
        'menu.id',
        'menu.name',
        'menu.menuKey',
        'menu.parentId',
        'location.id',
        'location.name',
      ])
      .getOne();
    if (user) {
      user.deviceToken = deviceToken ?? null; // Update the user's device token
      await this.userRepository.save(user); // Save the updated user entity
    }

    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const normalizedEmail = createUserDto.email
      .toLowerCase()
      .trim()
      .replace(/\s/g, '');

    // Find existing user by normalized email
    const existingUser = await this.findByEmail({ email: normalizedEmail });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    // const location = { id: createUserDto.location };
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    createUserDto.password = hashedPassword;
    // const mappedDepartment = createUserDto.userDepartmentRoles.map(
    //   (entity) => ({
    //     role: { id: entity.role },
    //     department: { id: entity.department },
    //     permissions: entity.permissions,
    //   }),
    // );
    const request: DeepPartial<UserEntity> = {
      ...createUserDto,
      roles: createUserDto.roles.map((entity) => {
        return { id: entity };
      }),
    };

    const user = await this.userRepository.create(request);

    // const promises = user.userDepartmentRoles.map(async (value) => {
    //   const userRoleDep = this.userDepartmentRepository.create({
    //     ...value,
    //     user: user,
    //   });

    //   return this.userDepartmentRepository.save(userRoleDep);
    // });

    // await Promise.all(promises);
    // user.userRoleFeatures = null;
    // await Promise.all(
    //   userRoleFeatures.map(async (featureDto) => {
    //     const feature = this.userRoleFeatureRepository.create({
    //       user,
    //       location: featureDto.location,
    //       roleTemplate: featureDto.roleTemplate,
    //     });
    //     return await this.userRoleFeatureRepository.save(feature);
    //   }),
    // );
    return await this.userRepository.save(user);
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const existingUser = await this.getUserById(userId);
    if (!existingUser) {
      throw new NotFoundException(`User with ID not found`);
    }
    const normalizedEmail = updateUserDto.email
      .toLowerCase()
      .trim()
      .replace(/\s/g, '');
    const existingUserWithEmail = await this.userRepository.findOne({
      where: { email: normalizedEmail, id: Not(userId) },
    });
    if (existingUserWithEmail) {
      throw new ConflictException('Email already exists');
    }
    // Update the user entity with the new data from the DTO
    existingUser.cnic = updateUserDto.cnic;
    existingUser.contact = updateUserDto.contact;
    existingUser.email = updateUserDto.email;
    existingUser.file = updateUserDto.file;
    existingUser.username = updateUserDto.username;

    const updatedUser = await this.userRepository.save(existingUser);

    const updatedRoles = await Promise.all(
      updateUserDto.roles.map(async (roleId) => {
        const role = await this.roleRepository.findOne({
          where: { id: roleId },
        });
        if (!role) {
          throw new NotFoundException(`Role with ID ${roleId} not found`);
        }
        return role;
      }),
    );

    // Update the roles for the user
    updatedUser.roles = updatedRoles;
    await this.userRepository.save(updatedUser);

    return updatedUser;
  }

  async findAll(query: QueryDto, pagination: PaginationDto): Promise<any> {
    const { name, email, cnic, department, role, search, contact } = query;
    const { page, limit } = pagination;
    const skip = ((page ?? 1) - 1) * (limit ?? 10);

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.actions', 'actions')
      .leftJoinAndSelect('roles.department', 'department')
      .where('user.isArchived = :isArchived', { isArchived: false })
      .andWhere('user.isSuperAdmin = :isSuperAdmin', { isSuperAdmin: false })
      .orderBy('user.createDateTime', 'DESC');

    // Apply filters
    if (name) {
      queryBuilder.andWhere('user.username ILIKE :username', {
        username: `%${name}%`,
      });
    }
    if (contact) {
      queryBuilder.andWhere('user.contact ILIKE :contact', {
        contact: `%${contact}%`,
      });
    }
    if (email) {
      queryBuilder.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    }
    if (cnic) {
      queryBuilder.andWhere('user.cnic ILIKE :cnic', { cnic: `%${cnic}%` });
    }
    if (department) {
      queryBuilder.andWhere('department.id = :id', {
        id: department,
      });
    }
    if (role) {
      queryBuilder.andWhere('roles.name = :roleName', { roleName: role });
    }
    if (search && userSearchFields.length > 0) {
      const whereConditions = userSearchFields
        .map((field) => {
          return `user.${field} ILIKE :search`;
        })
        .join(' OR ');

      queryBuilder.andWhere(`(${whereConditions})`, { search: `%${search}%` });
    }

    // Get total count without applying skip and limit
    const totalRows = await queryBuilder.getCount();

    // Get the data
    const list = await queryBuilder.skip(skip).take(limit).getMany();

    return { totalRows, list };
  }

  async findByUser(id: string): Promise<UserEntity | undefined> {
    return this.userRepository.findOne({
      where: {
        id: id,
        isArchived: false,
      },
      relations: ['roles', 'roles.actions', 'roles.department'],
    });
  }

  async getUserById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ['roles', 'roles.actions', 'roles.department'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.getUserById(id);
    if (user) {
      user.isArchived = true;
      await this.userRepository.save(user);
    }

    return user;
  }

  async findUsersByMenuKey(
    menuKey: string,
    departmentId: string,
  ): Promise<UserEntity[]> {
    const menu = await this.menuRepo.findOne({ where: { menuKey: menuKey } });
    if (!menu) {
      throw new Error(`Menu with key ${menuKey} not found`);
    }

    const userQuery = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.actions', 'actions')
      .leftJoinAndSelect('actions.menu', 'menu')
      .leftJoinAndSelect('roles.department', 'department')
      .andWhere('department.id = :depId', { depId: departmentId })
      .andWhere('menu.id = :menuId', { menuId: menu.id });

    const users = await userQuery.getMany();
    return users;
  }
}
