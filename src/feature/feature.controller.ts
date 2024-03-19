// feature.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { FeatureService } from './feature.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Feature with Permissions')
@Controller('features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Post()
  async createFeature(@Body() createFeatureDto: CreateFeatureDto) {
    return this.featureService.createFeature(createFeatureDto);
  }
}
