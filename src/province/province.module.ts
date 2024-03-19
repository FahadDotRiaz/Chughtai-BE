// location.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Province } from 'src/entities/province.entity';
import { ProvinceService } from './province.service';
import { ProvinceController } from './province.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Province])],
  providers: [ProvinceService],
  controllers: [ProvinceController],
  exports: [],
})
export class ProvinceModule {}
