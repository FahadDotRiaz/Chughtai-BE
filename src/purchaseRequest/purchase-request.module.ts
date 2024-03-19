// purchase-request.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseRequestController } from './purchase-request.controller';
import { PurchaseRequestService } from './purchase-request.service';
import { PurchaseRequest } from '../entities/purchaseRequest.entity';
import { PurchaseRequestItem } from '../entities/purchaseRequestItem.entity';
import { UserEntity } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PurchaseRequest,
      PurchaseRequestItem,
      UserEntity,
    ]),
  ],
  controllers: [PurchaseRequestController],
  providers: [PurchaseRequestService],
})
export class PurchaseRequestModule {}
