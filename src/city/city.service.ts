import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from 'src/entities/city.entity';
import { Repository } from 'typeorm';
import { CityDto } from './dto/create-city.dto';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async getCityById(cityId: string) {
    try {
      return await this.cityRepository.findOne({
        where: {
          id: cityId,
          isArchived: false,
        },
        relations: ['province'],
      });
    } catch (error) {
      // If the location with the given ID is not found, handle the exception
      throw new NotFoundException(`City not found`);
    }
  }

  async createCity(cityData: CityDto) {
    const province = { id: cityData.province };
    const createLocation = {
      ...cityData,
      province,
    };
    const location = this.cityRepository.create(createLocation);
    return this.cityRepository.save(location);
  }

  async getCities(provinceId: string) {
    try {
      const list = await this.cityRepository.find({
        where: {
          province: { id: provinceId },
          isArchived: false,
        },
      });
      return list;
    } catch (error) {
      // If the location with the given ID is not found, handle the exception
      throw new NotFoundException(`City not found`);
    }
  }
}
