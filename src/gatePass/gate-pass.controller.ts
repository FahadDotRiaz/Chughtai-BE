// gate-pass.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { GatePassService } from './gate-pass.service';
import { GatePass } from '../entities/gatePass.entity';
import { CreateGatePassDto } from './dto/create-gate-pass.dto';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { createErrorResponse, createSuccessResponse } from '../utils/helper';
import { UpdateGatePassDto } from './dto/update-gate-pass.dto';
import { InwardOutward } from 'src/utils/constant';
import { DeepPartial } from 'typeorm';
import { PaginationDto, QueryDto } from './dto/query.dto';

@ApiTags('GatePass')
@Controller('gate-passes')
export class GatePassController {
  constructor(private readonly gatePassService: GatePassService) {}

  @Post()
  async createGatePass(
    @Body() createGatePassDto: CreateGatePassDto,
  ): Promise<any> {
    try {
      const data = await this.gatePassService.createGatePass(createGatePassDto);
      return createSuccessResponse(
        HttpStatus.CREATED,
        'GatePass added successfuly',
        data,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get('list/:type')
  async getAllGatePasses(
    @Param('type') type: InwardOutward,
    @Query() query: QueryDto,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const data = await this.gatePassService.getAllGatePasses(
        type,
        query,
        pagination,
      );
      return createSuccessResponse(
        HttpStatus.OK,
        'GatePass List get successfuly',
        data,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: GatePass })
  async getGatePassById(@Param('id') id: string) {
    try {
      const result = await this.gatePassService.getGatePassById(id);
      return createSuccessResponse(
        HttpStatus.OK,
        'GatePass get successfuly',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Patch(':id')
  @ApiBody({ type: UpdateGatePassDto })
  @ApiResponse({ status: 200, type: UpdateGatePassDto })
  async updateGatePass(
    @Param('id') id: string,
    @Body() updateData: DeepPartial<GatePass>,
  ) {
    try {
      await this.gatePassService.updateGatePass(id, updateData);
      return createSuccessResponse(
        HttpStatus.CREATED,
        'GatePass updated successfuly',
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Delete(':id')
  @ApiResponse({ status: 204 })
  async deleteGatePass(@Param('id') id: string) {
    try {
      await this.gatePassService.deleteGatePass(id);
      return createSuccessResponse(
        HttpStatus.OK,
        'GatePass deleted successfuly',
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
}
