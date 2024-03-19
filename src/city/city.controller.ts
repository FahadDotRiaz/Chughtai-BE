import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CityService } from './city.service';
import { CityDto } from './dto/create-city.dto';
import { createErrorResponse, createSuccessResponse } from 'src/utils/helper';

@ApiTags('City')
@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  // @Get(':id')
  // async getLocationById(@Param('id') id: string) {
  //   try {
  //     const result = await this.cityService.getCityById(id);
  //     return createSuccessResponse(
  //       HttpStatus.OK,
  //       'City retrieved successfully',
  //       result,
  //     );
  //   } catch (error) {
  //     return createErrorResponse(
  //       HttpStatus.NOT_FOUND,
  //       'City not found',
  //       error,
  //     );
  //   }
  // }

  @Get(':id')
  async getCities(@Param('id') id: string) {
    try {
      const result = await this.cityService.getCities(id);
      return createSuccessResponse(
        HttpStatus.OK,
        'City retrieved successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(HttpStatus.NOT_FOUND, 'City not found', error);
    }
  }

  @Post()
  async createCity(@Body() body: CityDto) {
    try {
      const result = await this.cityService.createCity(body);
      return createSuccessResponse(
        HttpStatus.CREATED,
        'City created successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to add City',
        error,
      );
    }
  }
}
