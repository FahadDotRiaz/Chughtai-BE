// location.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Location } from '../entities/location.entity';
import { LocationDto } from './dto/create-location.dto';
import { PaginationDto, QueryDto } from './dto/query.dto';
import { locationSearchFields } from 'src/utils/searchColumn';
import { Department } from 'src/entities/department.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async createLocation(locationData: LocationDto): Promise<Location> {
    const trimmedName = locationData.name.trim().replace(/\s+/g, ' ');

    const existingLocation = await this.locationRepository.findOne({
      where: { name: trimmedName, isArchived: false },
    });

    if (existingLocation) {
      throw new NotFoundException('Location with this name already exists');
    }
    const province = { id: locationData.province };
    const area = { id: locationData.area };
    const city = { id: locationData.city };

    const createLocation = {
      ...locationData,
      province,
      area,
      city,
    };

    const location = this.locationRepository.create(createLocation);
    return this.locationRepository.save(location);
  }

  async getLocations(query: QueryDto, pagination: PaginationDto): Promise<any> {
    const { name, city, area, province, service, search, address } = query;
    const { page, limit } = pagination;
    const skip = ((page ?? 1) - 1) * (limit ?? 10);

    const queryBuilder = this.locationRepository
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.department', 'departments')
      .leftJoinAndSelect('location.province', 'province')
      .leftJoinAndSelect('location.city', 'city')
      .leftJoinAndSelect('location.area', 'area')
      .where('location.isArchived = :isArchived', { isArchived: false })
      .orderBy('location.createDateTime', 'DESC');

    // Apply filters
    if (name) {
      queryBuilder.andWhere('location.name ILIKE :name', { name: `%${name}%` });
    }

    if (address) {
      queryBuilder.andWhere('location.address ILIKE :address', {
        address: `%${address}%`,
      });
    }
    if (city) {
      queryBuilder.andWhere('location.city = :city', { city });
    }
    if (area) {
      queryBuilder.andWhere('location.area = :area', { area });
    }
    if (province) {
      queryBuilder.andWhere('location.province = :province', {
        province,
      });
    }
    if (service && service.length > 0) {
      if (Array.isArray(service)) {
        queryBuilder.andWhere('location.service IN (:...service)', { service });
      } else {
        queryBuilder.andWhere('location.service::text ILIKE :service', {
          service: `%${service}%`,
        });
      }
    }
    if (search && locationSearchFields.length > 0) {
      const whereConditions = locationSearchFields
        .map((field) => {
          if (field === 'area') {
            return `area.name ILIKE CAST(:search AS text)`;
          } else if (field === 'city') {
            return `city.name ILIKE CAST(:search AS text)`;
          } else if (field === 'province') {
            return `province.name ILIKE CAST(:search AS text)`;
          } else if (field === 'service') {
            return `CAST(location.service AS TEXT) ILIKE CAST(:search AS text)`;
          } else {
            return `location.${field} ILIKE CAST(:search AS text)`;
          }
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

  async getLocationById(locationId: string): Promise<Location | undefined> {
    try {
      return await this.locationRepository.findOne({
        where: {
          id: locationId,
          isArchived: false,
        },
        relations: ['province', 'area', 'city'],
      });
    } catch (error) {
      // If the location with the given ID is not found, handle the exception
      throw new NotFoundException(`Location with ID ${locationId} not found`);
    }
  }

  async updateLocation(
    id: string,
    locationDto: LocationDto,
  ): Promise<Location> {
    const trimmedName = locationDto.name.trim().replace(/\s+/g, ' ');

    const existingLocation = await this.locationRepository.findOne({
      where: { name: trimmedName, id: Not(id) },
    });

    if (existingLocation) {
      throw new NotFoundException('Location with this name already exists');
    }
    const province = { id: locationDto.province };
    const area = { id: locationDto.area };
    const city = { id: locationDto.city };
    const updateLocation = {
      ...locationDto,
      province,
      area,
      city,
    };
    await this.getLocationById(id); // Check if location exists
    await this.locationRepository.update(id, updateLocation);
    return await this.getLocationById(id);
  }

  async deleteLocation(id: string) {
    const location = await this.getLocationById(id);
    if (location) {
      const departmentsCount = await this.departmentRepository.count({
        where: { location: { id: location.id }, isArchived: false },
      });
      if (departmentsCount === 0) {
        location.isArchived = true;
        return await this.locationRepository.save(location);
      } else {
        throw new ConflictException(
          `Can't delete location this location associate with Department`,
        );
      }
    }
  }
}
