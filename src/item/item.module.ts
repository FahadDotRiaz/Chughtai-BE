import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { Item } from '../entities/item.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Item])],
  providers: [ItemService],
  controllers: [ItemController],
  exports: [ItemService],
})
export class ItemModule {}
