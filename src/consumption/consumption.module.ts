import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsumptionController } from './consumption.controller';
import { ConsumptionService } from './consumption.service';
import { Consumption } from '../entities/consumption.entity';
import { ItemConsumption } from '../entities/itemConsumption.entity';
import { InventoryModule } from 'src/inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Consumption, ItemConsumption]),
    InventoryModule,
  ],
  controllers: [ConsumptionController],
  providers: [ConsumptionService],
})
export class ConsumptionModule {}
