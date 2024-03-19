import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { Vendor } from '../entities/vendor.entity';
import { Item } from 'src/entities/item.entity';
import { VendorItem } from 'src/entities/vendorItem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor, Item, VendorItem])],
  providers: [VendorService],
  controllers: [VendorController],
  exports: [VendorService],
})
export class VendorModule {}
