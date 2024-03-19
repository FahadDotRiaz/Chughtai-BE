// location.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  HttpStatus,
  Delete,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationDto } from './dto/create-location.dto';
import { ApiTags } from '@nestjs/swagger';
import { createErrorResponse, createSuccessResponse } from 'src/utils/helper';
import { PaginationDto, QueryDto } from './dto/query.dto';

@ApiTags('Location')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  async createLocation(@Body() body: LocationDto) {
    try {
      const result = await this.locationService.createLocation(body);
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Location created successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get()
  async getLocations(
    @Query() query: QueryDto,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const result = await this.locationService.getLocations(query, pagination);
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Location list get successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get(':id')
  async getLocationById(@Param('id') id: string) {
    try {
      const result = await this.locationService.getLocationById(id);
      return createSuccessResponse(
        HttpStatus.OK,
        'Location retrieved successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Put(':id')
  async updateLocation(@Param('id') id: string, @Body() body: LocationDto) {
    try {
      const result = await this.locationService.updateLocation(id, body);
      return createSuccessResponse(
        HttpStatus.OK,
        'Location updated successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Delete(':id')
  async deleteLocation(@Param('id') id: string) {
    try {
      await this.locationService.deleteLocation(id);
      return createSuccessResponse(
        HttpStatus.OK,
        'Location deleted successfully',
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
}
