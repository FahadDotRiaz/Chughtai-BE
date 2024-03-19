import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialRequest } from '../entities/MaterialRequest.entity';
import { ItemRequestService } from './itemRequest.service';
import { ItemRequestController } from './itemRequest.controller';
import { AwsService } from '../config/aws.service';
import { ItemRequestItem } from '../entities/itemRequestItem.entity';
// import { LocationService } from '../location/location.service';
// import { LocationModule } from '../location/location.module';
import { UsersModule } from '../users/user.module';
import { InventoryModule } from '../inventory/inventory.module';
import { StoreIssuedNote } from '../entities/storeIssueNote.entity';
import { StoreIssuedNoteModule } from '../sin/sin.module';
import { Consumption } from 'src/entities/consumption.entity';
import { DepartmentModule } from 'src/department/department.module';
import { TrackingModule } from 'src/tracking/tracking.module';
import { Item } from 'src/entities/item.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MaterialRequest,
      ItemRequestItem,
      StoreIssuedNote,
      Consumption,
      Item,
    ]),
    DepartmentModule,
    UsersModule,
    InventoryModule,
    StoreIssuedNoteModule,
    TrackingModule,
    NotificationModule,
  ],
  providers: [ItemRequestService, AwsService],
  controllers: [ItemRequestController],
  exports: [],
})
export class ItemRequestModule {}
