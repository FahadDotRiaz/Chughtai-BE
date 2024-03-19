import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Department } from '../entities/department.entity';
import { DepartmentController } from './department.controller';
import { Inventory } from 'src/entities/inventory.entity';
import { DepartmentService } from './department.service';
// import { Designation } from '../entities/designation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Department, Inventory])],
  providers: [DepartmentService],
  controllers: [DepartmentController],
  exports: [DepartmentService],
})
export class DepartmentModule {}
