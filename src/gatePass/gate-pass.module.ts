// gate-pass.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatePassController } from './gate-pass.controller';
import { GatePassService } from './gate-pass.service';
import { GatePass } from '../entities/gatePass.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GatePass])],
  controllers: [GatePassController],
  providers: [GatePassService],
})
export class GatePassModule {}
