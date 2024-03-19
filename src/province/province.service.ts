import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Province } from 'src/entities/province.entity';
import { Repository } from 'typeorm';
import { ProvinceDto } from './dto/create-province.dto';
import { QueryDto } from './dto/query.dto';

@Injectable()
export class ProvinceService {
  constructor(
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
  ) {}

  async createProvince(provinceDto: ProvinceDto) {
    const country = { id: provinceDto.country };
    const provinceData = {
      ...provinceDto,
      country,
    };
    const province = await this.provinceRepository.create(provinceData);
    return this.provinceRepository.save(province);
  }

  async getProvinces(query: QueryDto) {
    const { country } = query;
    const queryBuilder = await this.provinceRepository
      .createQueryBuilder('province')
      .where('province.isArchived = :isArchived', { isArchived: false })
      .orderBy('province.createDateTime', 'DESC');

    if (country) {
      queryBuilder.andWhere('province.country = :country', { country });
    } else {
      queryBuilder.andWhere('province.country = :country', {
        country: '71408cc1-f701-4179-ad4f-dc472818a75c',
      });
    }

    const list = await queryBuilder.getMany();

    return list;
  }
}
