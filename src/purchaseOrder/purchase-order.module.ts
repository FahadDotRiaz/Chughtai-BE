// purchase-order.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderController } from './purchase-order-controller';
import { PurchaseOrder } from '../entities/purchaseOrder.entity';
import { PurchaseOrderItem } from '../entities/purchaseOrderItem.entity';
import { Vendor } from '../entities/vendor.entity';
import { Grn } from 'src/entities/grn.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseOrder, PurchaseOrderItem, Vendor, Grn]),
  ],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService],
})
export class PurchaseOrderModule {}
