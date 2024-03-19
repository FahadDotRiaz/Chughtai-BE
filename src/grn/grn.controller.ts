import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Delete,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/local-auth.guard';
import { Request } from 'express';
import { createErrorResponse, createSuccessResponse } from 'src/utils/helper';
import { GrnService } from './grn.service';
import { CreateGrnDTO } from './dto/create.dto';
import { Grn } from 'src/entities/grn.entity';
import { PaginationDto, QueryDto } from './dto/query.dto';

@ApiTags('GRN')
@Controller('grn')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class GrnController {
  constructor(private grnServices: GrnService) {}

  @Post('create')
  @ApiBody({
    type: CreateGrnDTO,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Item Return Request created successfully.',
  })
  async createItemRequest(
    @Req() request: Request,
    @Body() requestDto: CreateGrnDTO,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const requestData = { ...requestDto, createdBy: { id: user.id } };
      const result = await this.grnServices.createItemGrn(
        requestData,
        user?.id,
      );
      return createSuccessResponse(
        HttpStatus.OK,
        'GRN generated successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Patch(':id')
  async updateGrn(
    @Param('id') id: string,
    @Body() updateData: CreateGrnDTO,
    @Req() request: Request,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const data = await this.grnServices.createItemGrn(
        updateData,
        user.id,
        id,
      );
      return createSuccessResponse(
        HttpStatus.CREATED,
        'GRN updated successfuly',
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
      await this.grnServices.deleteGrn(id);
      return createSuccessResponse(HttpStatus.OK, 'GRN deleted successfuly');
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: Grn })
  async getGrnById(@Param('id') id: string) {
    try {
      const result = await this.grnServices.getGrnViewById(id);
      return createSuccessResponse(
        HttpStatus.OK,
        'GRN get successfuly',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get('list/:departmentId')
  @ApiResponse({ status: 200, type: Grn })
  async getGrn(
    @Param('departmentId') departmentId: string,
    @Query() query: QueryDto,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const result = await this.grnServices.getGrnRequests(
        departmentId,
        query,
        pagination,
      );
      return createSuccessResponse(
        HttpStatus.OK,
        'GRN list get successfuly',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
}
