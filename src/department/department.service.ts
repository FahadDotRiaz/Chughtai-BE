// department.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Not, Repository } from 'typeorm';

import { DepartmentDto } from './dto/create-department.dto';
import { Department } from '../entities/department.entity';
import { DepartmentTypeDto, PaginationDto, QueryDto } from './dto/query.dto';
import { departmentSearchFields } from 'src/utils/searchColumn';
import { Inventory } from 'src/entities/inventory.entity';
import { DepartmentType, InventoryType } from 'src/utils/constant';
import { DepartmentApprovalDto } from './dto/approval-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async createDepartment(createDepartmentDto: DepartmentDto): Promise<any> {
    const trimmedName = createDepartmentDto.name.trim().replace(/\s+/g, ' ');
    const existingDepartment = await this.departmentRepository.findOne({
      where: {
        name: trimmedName,
        type: createDepartmentDto.type,
        isArchived: false,
      },
    });
    if (existingDepartment) {
      if (createDepartmentDto.type === DepartmentType.Store) {
        throw new ConflictException('Store with this name already exists');
      }
      if (createDepartmentDto.type === DepartmentType.SubStore) {
        throw new ConflictException('Sub store with this name already exists');
      }
      throw new ConflictException('Department with this name already exists');
    }
    const location = { id: createDepartmentDto.location };
    const managedBy = { id: createDepartmentDto.managedBy };
    const mappedRequestDto: DeepPartial<Department> = {
      ...createDepartmentDto,
      location,
      managedBy,
    };
    const departmentData =
      await this.departmentRepository.create(mappedRequestDto);
    const depRecord = await this.departmentRepository.save(departmentData);
    const department = { id: depRecord.id };
    const mappedInventory: DeepPartial<Inventory>[] = [];
    if (
      depRecord.type === DepartmentType.Store ||
      depRecord.type === DepartmentType.SubStore
    ) {
      mappedInventory.push({
        department,
        type: InventoryType.STORAGE,
      });
      mappedInventory.push({
        department,
        type: InventoryType.SELF,
      });
    } else {
      mappedInventory.push({
        department,
        type: InventoryType.SELF,
      });
    }
    const inventoryData =
      await this.inventoryRepository.create(mappedInventory);
    await this.inventoryRepository.save(inventoryData);
    return depRecord;
  }

  async getAllDepartments(
    query: QueryDto,
    pagination: PaginationDto,
  ): Promise<any> {
    const { name, type, location, search } = query;
    const { page, limit } = pagination;
    const skip = ((page ?? 1) - 1) * (limit ?? 10);

    const queryBuilder = this.departmentRepository
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.location', 'location')
      .leftJoinAndSelect('location.province', 'province')
      .leftJoinAndSelect('location.area', 'area')
      .leftJoinAndSelect('location.city', 'city')
      .where('department.isArchived = :isArchived', { isArchived: false });

    // Apply filters
    if (name) {
      queryBuilder.andWhere('department.name ILIKE :name', {
        name: `%${name}%`,
      });
    }
    if (type && type.length > 0) {
      if (Array.isArray(type)) {
        queryBuilder.andWhere('department.type IN (:...type)', { type });
      } else {
        queryBuilder.andWhere('department.type::text ILIKE :type', {
          type: `%${type}%`,
        });
      }
    }
    if (location) {
      queryBuilder.andWhere('location.id = :id', {
        id: location,
      });
    }
    if (search && departmentSearchFields.length > 0) {
      const whereConditions = departmentSearchFields
        .map((field) => {
          if (field === 'type') {
            return `department.${field}::text ILIKE :search`;
          } else if (field === 'location') {
            return `location.name::text ILIKE :search OR city.name::text ILIKE :search OR province.name::text ILIKE :search OR area.name::text ILIKE :search`;
          } else {
            return `department.${field} ILIKE :search`;
          }
        })
        .join(' OR ');

      queryBuilder.andWhere(`(${whereConditions})`, { search: `%${search}%` });
    }

    // Order by createDateTime
    queryBuilder.orderBy('department.createDateTime', 'DESC');

    // Get total count without applying skip and limit
    const totalRows = await queryBuilder.getCount();

    // Get the data
    const list = await queryBuilder
      .skip(skip)
      .take(limit ?? 10)
      .getMany();
    return { totalRows, list };
  }

  async getDepartmentType(id: string, query: DepartmentTypeDto) {
    const { name, type } = query;
    const queryBuilder = this.departmentRepository
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.location', 'location')
      .leftJoinAndSelect('location.province', 'province')
      .leftJoinAndSelect('location.area', 'area')
      .leftJoinAndSelect('location.city', 'city')
      .where('department.managedBy = :id', { id })
      .andWhere('department.isArchived = :isArchived', { isArchived: false });

    if (name) {
      queryBuilder.andWhere('department.name ILIKE :name', { name });
    }

    if (type) {
      queryBuilder.andWhere('department.type::text ILIKE :type', {
        type: `%${type}%`,
      });
    }
    const list = await queryBuilder.getMany();
    return list;
  }

  async getDepartmentById(id: string): Promise<Department | undefined> {
    try {
      return await this.departmentRepository.findOne({
        where: {
          id: id,
        },
        relations: ['managedBy', 'location'],
      });
    } catch (error) {
      // If the location with the given ID is not found, handle the exception
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
  }

  async updateDepartment(
    id: string,
    departmentDto: DepartmentDto,
  ): Promise<Department> {
    const trimmedName = departmentDto.name.trim().replace(/\s+/g, ' ');
    const existingDepartment = await this.departmentRepository.findOne({
      where: { name: trimmedName, id: Not(id) },
    });
    if (existingDepartment) {
      throw new ConflictException('Department with this name already exists');
    }
    const result = await this.getDepartmentById(id);
    const manageByData = await this.departmentRepository.findOne({
      where: {
        managedBy: { id: id },
      },
    });
    if (result.type != departmentDto.type && manageByData) {
      throw new ConflictException(
        `Can't update this department is currently manage other departments`,
      );
    }
    const location = { id: departmentDto.location };
    const managedBy = { id: departmentDto.managedBy };
    const mappedRequestDto: DeepPartial<Department> = {
      ...departmentDto,
      location,
      managedBy,
    };
    await this.departmentRepository.update(id, mappedRequestDto);
    return await this.getDepartmentById(id);
  }

  async departmentApproval(departmentId: string, data: DepartmentApprovalDto) {
    const { mirApproval, mrrApproval, grnApproval } = data;
    const department = await this.getDepartmentById(departmentId);

    department.mirApproval = mirApproval;
    department.mrrApproval = mrrApproval;
    department.grnApproval = grnApproval;

    await this.departmentRepository.update(departmentId, department);
    return await this.getDepartmentById(departmentId);
  }

  async deleteDepartment(id: string) {
    const department = await this.getDepartmentById(id);
    if (department) {
      department.isArchived = true;
      await this.departmentRepository.save(department);
    }

    return department;
  }
}
