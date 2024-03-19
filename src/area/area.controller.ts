import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { createErrorResponse, createSuccessResponse } from 'src/utils/helper';
import { AreaService } from './area.service';
import { AreaDto } from './dto/create-area.dto';

@ApiTags('Area')
@Controller('area')
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  //   @Get(':id')
  //   async getAreaById(@Param('id') id: string) {
  //     try {
  //       const result = await this.areaService.getAreaById(id);
  //       return createSuccessResponse(
  //         HttpStatus.OK,
  //         'Area retrieved successfully',
  //         result,
  //       );
  //     } catch (error) {
  //       return createErrorResponse(
  //         HttpStatus.NOT_FOUND,
  //         'Area not found',
  //         error,
  //       );
  //     }
  //   }

  @Get(':id')
  async getAreas(@Param('id') id: string) {
    try {
      const result = await this.areaService.getAreas(id);
      return createSuccessResponse(
        HttpStatus.OK,
        'Area retrieved successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(HttpStatus.NOT_FOUND, 'Area not found', error);
    }
  }

  @Post()
  async createArea(@Body() body: AreaDto) {
    try {
      const result = await this.areaService.createArea(body);
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Area created successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to add Area',
        error,
      );
    }
  }
}
