import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreIssuedNote } from '../entities/storeIssueNote.entity';
import { StoreIssuedNoteService } from './sin.service';
import { StoreIssuedNoteController } from './sin.controller';
import { SinItems } from '../entities/sinItems.entity';
import { Consumption } from 'src/entities/consumption.entity';
import { ReturnItemRequest } from 'src/entities/returnItemRequest.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StoreIssuedNote,
      SinItems,
      Consumption,
      ReturnItemRequest,
    ]),
  ],
  providers: [StoreIssuedNoteService],
  controllers: [StoreIssuedNoteController],
  exports: [StoreIssuedNoteService],
})
export class StoreIssuedNoteModule {}
