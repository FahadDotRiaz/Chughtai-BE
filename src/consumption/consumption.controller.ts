import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConsumptionService } from './consumption.service';
import { CreateConsumptionDTO } from './dto/create.dto';
import { Consumption } from '../entities/consumption.entity';
import { UpdateConsumptionDto } from './dto/update.dto';
import { createErrorResponse, createSuccessResponse } from '../utils/helper';
import { DepartmentPaginationDto, QueryDto } from './dto/query.dto';
import { PaginationDto } from 'src/itemRequest/dto/query.dto';

@ApiTags('Consumption')
@Controller('consumption')
export class ConsumptionController {
  constructor(private readonly consumptionService: ConsumptionService) {}

  @Post('create')
  async createConsumption(@Body() createConsumptionDto: CreateConsumptionDTO) {
    try {
      const result = await this.consumptionService.createConsumption(
        createConsumptionDto,
        null,
      );
      if (result) {
        return createSuccessResponse(
          HttpStatus.CREATED,
          'Consumption added successfuly',
          result,
        );
      }
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: Consumption })
  async getConsumptionById(@Param('id') id: string) {
    try {
      const result = await this.consumptionService.getConsumptionById(id);
      return createSuccessResponse(
        HttpStatus.OK,
        'Consumption get successfuly',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get('department/:storeId')
  @ApiResponse({ status: 200, type: Consumption })
  async getDepartmentConsumption(
    @Param('storeId') id: string,
    @Query() query: DepartmentPaginationDto,
    @Query() pagination?: PaginationDto,
  ) {
    try {
      const result = await this.consumptionService.getDepartmentConsumption(
        id,
        query,
        pagination,
      );
      return createSuccessResponse(
        HttpStatus.OK,
        'Consumption get successfuly',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Patch(':id')
  async updateConsumption(
    @Param('id') id: string,
    @Body() updateData: UpdateConsumptionDto,
  ) {
    try {
      const data = await this.consumptionService.createConsumption(
        updateData,
        id,
      );
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Consumption updated successfuly',
        data,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Delete(':id')
  @ApiResponse({ status: 204 })
  async deleteConsumption(@Param('id') id: string): Promise<any> {
    try {
      await this.consumptionService.deleteConsumption(id);
      return createSuccessResponse(
        HttpStatus.OK,
        'Consumption deleted successfuly',
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get('list/:department')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of consumption retrieved successfully.',
  })
  async getReviewItemRequests(
    @Param('department') department: string,
    @Query() query: QueryDto,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const itemRequests = await this.consumptionService.getConsumptionRequests(
        department,
        query,
        pagination,
      );
      return createSuccessResponse(
        HttpStatus.OK,
        'List of Consumption retrieved successfully',
        itemRequests,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
}
