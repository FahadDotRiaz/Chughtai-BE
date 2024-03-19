import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureService } from './feature.service';
import { FeatureController } from './feature.controller';
import { Feature } from '../entities/feature.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Feature])],
  providers: [FeatureService],
  controllers: [FeatureController],
  exports: [],
})
export class FeatureModule {}
