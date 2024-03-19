import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsService } from '../config/aws.service';
import { ItemReturnRequestService } from './returnItem.service';
import { ItemReturnRequestController } from './returnItem.controller';
import { returnRequestedItem } from '../entities/returnRequestedItem.entity';
import { ReturnItemRequest } from '../entities/returnItemRequest.entity';
import { StoreIssuedNote } from '../entities/storeIssueNote.entity';
import { LocationModule } from 'src/location/location.module';
import { InventoryModule } from 'src/inventory/inventory.module';
import { DepartmentModule } from 'src/department/department.module';
import { Consumption } from 'src/entities/consumption.entity';
import { TrackingModule } from 'src/tracking/tracking.module';
import { NotificationModule } from 'src/notification/notification.module';
import { ItemModule } from 'src/item/item.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReturnItemRequest,
      returnRequestedItem,
      StoreIssuedNote,
      Consumption,
    ]),
    LocationModule,
    DepartmentModule,
    InventoryModule,
    TrackingModule,
    NotificationModule,
    ItemModule,
  ],
  providers: [ItemReturnRequestService, AwsService],
  controllers: [ItemReturnRequestController],
  exports: [],
})
export class ItemReturnRequestModule {}
