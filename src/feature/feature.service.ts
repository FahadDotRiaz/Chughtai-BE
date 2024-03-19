// feature.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { Feature } from '../entities/feature.entity';

@Injectable()
export class FeatureService {
  constructor(
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>,
  ) {}

  async createFeature(createFeatureDto: CreateFeatureDto): Promise<Feature> {
    const feature = this.featureRepository.create(createFeatureDto);
    return this.featureRepository.save(feature);
  }
}
