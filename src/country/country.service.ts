import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from 'src/entities/country.entity';
import { Repository } from 'typeorm';
import { CountryDto } from './dto/create.dto';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  async getCountry() {
    try {
      const list = await this.countryRepository.find({
        where: {
          isArchived: false,
        },
      });
      return list;
    } catch (error) {
      throw new NotFoundException(`Country not found`);
    }
  }

  async createCountry(countryData: CountryDto) {
    const country = this.countryRepository.create(countryData);
    return this.countryRepository.save(country);
  }
}
