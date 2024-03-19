import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Area } from 'src/entities/area.entity';
import { AreaService } from './area.service';
import { AreaController } from './area.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Area])],
  providers: [AreaService],
  controllers: [AreaController],
  exports: [AreaService]
})
export class AreaModule {}
