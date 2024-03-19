import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { VendorService } from './vendor.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { VendorDto } from './dto/create-vendor.dto';
import { createErrorResponse, createSuccessResponse } from 'src/utils/helper';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { JwtAuthGuard } from 'src/auth/guards/local-auth.guard';
import { PaginationDto, QueryDto } from './dto/query.dto';

@ApiTags('Vendors')
@Controller('vendors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Get(':id')
  async getvendorById(@Param('id') id: string) {
    try {
      const result = await this.vendorService.getVendorById(id);
      return createSuccessResponse(
        HttpStatus.OK,
        'Vendor get successfuly',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Post()
  async createVendor(@Body(ValidationPipe) createVendorDto: VendorDto) {
    try {
      const response = await this.vendorService.createVendor(
        createVendorDto,
        null,
      );
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Vendor added successfuly',
        response,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Patch(':id')
  async updateVendor(
    @Param('id') id: string,
    @Body() updateData: UpdateVendorDto,
  ) {
    try {
      const data = await this.vendorService.createVendor(updateData, id);
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Vendor updated successfuly',
        data,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
  @Get()
  async getList(@Query() query: QueryDto, @Query() pagination: PaginationDto) {
    try {
      const result = await this.vendorService.getList(query, pagination);
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Vendor got successfuly',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Delete(':id')
  async deleteVendor(@Param('id') id: string): Promise<any> {
    try {
      await this.vendorService.deleteVendor(id);
      return createSuccessResponse(HttpStatus.OK, 'Vender deleted successfuly');
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
}
