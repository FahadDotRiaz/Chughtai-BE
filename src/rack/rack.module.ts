import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rack } from 'src/entities/rack.entity';
import { RackService } from './rack.service';
import { RackController } from './rack.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Rack])],
  providers: [RackService],
  controllers: [RackController],
  exports: [RackService]
})
export class RackModule {}
