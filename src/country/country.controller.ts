import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { createErrorResponse, createSuccessResponse } from 'src/utils/helper';
import { CountryService } from './country.service';
import { CountryDto } from './dto/create.dto';

@ApiTags('Country')
@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Get()
  async getCountry() {
    try {
      const result = await this.countryService.getCountry();
      return createSuccessResponse(
        HttpStatus.OK,
        'Country retrieved successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(
        HttpStatus.NOT_FOUND,
        'Country not found',
        error,
      );
    }
  }

  @Post()
  async createCountry(@Body() body: CountryDto) {
    try {
      const result = await this.countryService.createCountry(body);
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Country created successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to add Country',
        error,
      );
    }
  }
}
