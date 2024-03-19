import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsService } from '../config/aws.service';
import { GrnService } from './grn.service';
import { GrnController } from './grn.controller';
import { Grn } from '../entities/grn.entity';
import { ItemGrn } from '../entities/grnItems.entity';
import { InventoryModule } from 'src/inventory/inventory.module';
import { TrackingModule } from 'src/tracking/tracking.module';
import { DepartmentModule } from 'src/department/department.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grn, ItemGrn]),
    InventoryModule,
    TrackingModule,
    DepartmentModule,
    NotificationModule
  ],
  providers: [GrnService, AwsService],
  controllers: [GrnController],
  exports: [],
})
export class GrnModule {}
