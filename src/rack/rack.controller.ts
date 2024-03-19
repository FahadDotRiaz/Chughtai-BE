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
import { ApiTags } from '@nestjs/swagger';
import { createErrorResponse, createSuccessResponse } from 'src/utils/helper';
import { RackService } from './rack.service';
import { RackDto } from './dto/create.dto';
import { PaginationDto, QueryDto } from './dto/query.dto';
import { UpdateRackDto } from './dto/update.dto';

@ApiTags('Rack')
@Controller('rack')
export class RackController {
  constructor(private readonly rackService: RackService) {}

  @Get(':id')
  async getRackById(@Param('id') id: string) {
    try {
      const result = await this.rackService.getRackById(id);
      return createSuccessResponse(
        HttpStatus.OK,
        'Rack retrieved successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(HttpStatus.NOT_FOUND, 'Rack not found', error);
    }
  }

  @Get()
  async getRacks(@Query() query: QueryDto, @Query() pagination: PaginationDto) {
    try {
      const result = await this.rackService.getRacks(query, pagination);
      return createSuccessResponse(
        HttpStatus.OK,
        'Rack retrieved successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(HttpStatus.NOT_FOUND, 'Rack not found', error);
    }
  }

  @Post()
  async createRack(@Body() body: RackDto) {
    try {
      const result = await this.rackService.createRack(body, null);
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Rack created successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to add Rack',
        error,
      );
    }
  }

  @Patch(':id')
  async updateRack(@Param('id') id: string, @Body() body: UpdateRackDto) {
    try {
      const result = await this.rackService.createRack(body, id);
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Rack created successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to add Rack',
        error,
      );
    }
  }

  @Delete(':id')
  async deleteRack(@Param('id') id: string): Promise<any> {
    try {
      await this.rackService.deleteRack(id);
      return createSuccessResponse(HttpStatus.OK, 'Rack deleted successfuly');
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
}
