import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Area } from 'src/entities/area.entity';
import { Repository } from 'typeorm';
import { AreaDto } from './dto/create-area.dto';

@Injectable()
export class AreaService {
  constructor(
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
  ) {}

  async getAreaById(areaId: string) {
    try {
      return await this.areaRepository.findOne({
        where: {
          id: areaId,
          isArchived: false,
        },
        relations: ['city'],
      });
    } catch (error) {
      throw new NotFoundException(`Area not found`);
    }
  }

  async getAreas(cityId: string) {
    try {
      const list = await this.areaRepository.find({
        where: {
          city: { id: cityId },
          isArchived: false,
        },
      });
      return list;
    } catch (error) {
      throw new NotFoundException(`Area not found`);
    }
  }

  async createArea(areaData: AreaDto) {
    const city = { id: areaData.city };
    const createArea = {
      ...areaData,
      city,
    };
    const area = this.areaRepository.create(createArea);
    return this.areaRepository.save(area);
  }
}
