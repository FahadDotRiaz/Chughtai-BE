import { Body, Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProvinceService } from './province.service';
import { ProvinceDto } from './dto/create-province.dto';
import { createErrorResponse, createSuccessResponse } from 'src/utils/helper';
import { QueryDto } from './dto/query.dto';

@ApiTags('Province')
@Controller('province')
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}
  @Post()
  async createProvince(@Body() body: ProvinceDto) {
    try {
      const result = await this.provinceService.createProvince(body);
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Province created successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to add Province',
        error,
      );
    }
  }

  @Get()
  async getProvinces(@Query() query: QueryDto) {
    try {
      const result = await this.provinceService.getProvinces(query);
      return createSuccessResponse(
        HttpStatus.OK,
        'Province retrieved successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(
        HttpStatus.NOT_FOUND,
        'Province not found',
        error,
      );
    }
  }
}
