import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rack } from 'src/entities/rack.entity';
import { RackDto } from './dto/create.dto';
import { PaginationDto, QueryDto } from './dto/query.dto';
import { UpdateRackDto } from './dto/update.dto';

@Injectable()
export class RackService {
  constructor(
    @InjectRepository(Rack)
    private readonly rackRepository: Repository<Rack>,
  ) {}

  async getRackById(rackId: string) {
    try {
      return await this.rackRepository.findOne({
        where: {
          id: rackId,
          isArchived: false,
        },
      });
    } catch (error) {
      // If the location with the given ID is not found, handle the exception
      throw new NotFoundException(`Rack not found`);
    }
  }

  async createRack(rackData: RackDto | UpdateRackDto, id: string | null) {
    const updateRack = id && (await this.getRackById(id));
    const rack = updateRack
      ? this.rackRepository.merge(updateRack, rackData)
      : this.rackRepository.create(rackData);
    return this.rackRepository.save(rack);
  }

  async getRacks(query: QueryDto, pagination: PaginationDto) {
    const { name, code, search } = query;
    const { page, limit } = pagination;
    const skip = (Number(page ?? 1) - 1) * Number(limit ?? 10);
    const queryBuilder = this.rackRepository
      .createQueryBuilder('rack')
      .where('rack.isArchived = :isArchived', {
        isArchived: false,
      });

    // Applying filter conditions
    if (name) {
      queryBuilder.andWhere('rack.name ILIKE :name', { name });
    }
    if (code) {
      queryBuilder.andWhere('rack.code ILIKE :code', { code });
    }
    if (search) {
      queryBuilder.andWhere(
        '(rack.name LIKE :search OR rack.code LIKE :search)',
        { search: `%${search}%` },
      );
    }
    const totalRows = await queryBuilder.getCount();
    // Applying pagination
    queryBuilder
      .orderBy('rack.createDateTime', 'DESC')
      .skip(skip)
      .take(Number(limit ?? 10));

    // Execute the query
    const list = await queryBuilder.getMany();

    return { totalRows, list };
  }

  async deleteRack(id: string): Promise<any> {
    const rack = await this.getRackById(id);

    if (rack) {
      rack.isArchived = true;
      await this.rackRepository.save(rack);
    }

    return rack;
  }
}
