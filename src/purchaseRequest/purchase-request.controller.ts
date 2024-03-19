// purchase-request.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Param,
  HttpStatus,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { PurchaseRequestService } from './purchase-request.service';
import { CreatePurchaseRequestDto } from './dto/create.dto';
import { PurchaseRequest } from '../entities/purchaseRequest.entity';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/local-auth.guard';
import { Request } from 'express';
import { createErrorResponse, createSuccessResponse } from 'src/utils/helper';
import { getPurchaseResponseDto } from './dto/response.dto';
import { UpdatePurchaseRequestDto } from './dto/update.dto';
import { PaginationDto, QueryDto } from './dto/query.dto';

@ApiTags('Purchase-Request')
@Controller('purchase-requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PurchaseRequestController {
  constructor(
    private readonly purchaseRequestService: PurchaseRequestService,
  ) {}

  @Post()
  @ApiResponse({ status: 200, type: PurchaseRequest })
  async createPurchaseRequest(
    @Req() request: Request,
    @Body() createPurchaseRequestDto: CreatePurchaseRequestDto,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const requestData = {
        ...createPurchaseRequestDto,
        createdBy: { id: user.id },
      };
      const result = await this.purchaseRequestService.createPurchaseRequest(
        requestData,
        null,
      );
      const response = new getPurchaseResponseDto(result);
      return createSuccessResponse(
        HttpStatus.OK,
        'Purchase Request created successfuly',
        response,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Patch(':id')
  async updatePurchaseRequest(
    @Param('id') id: string,
    @Body() updateData: UpdatePurchaseRequestDto,
    @Req() request: Request,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const requestData = {
        ...updateData,
        createdBy: { id: user.id },
      };
      const result = await this.purchaseRequestService.createPurchaseRequest(
        requestData,
        id,
      );
      const response = new getPurchaseResponseDto(result);
      return createSuccessResponse(
        HttpStatus.OK,
        'Purchase Request updated successfuly',
        response,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get()
  @ApiResponse({ status: 200, type: PurchaseRequest })
  async getAllPurchaseRequests(
    @Query() query: QueryDto,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const purchaseResponses =
        await this.purchaseRequestService.getAllPurchaseRequests(
          query,
          pagination,
        );
      const response = purchaseResponses.map(
        (data) => new getPurchaseResponseDto(data),
      );
      return createSuccessResponse(
        HttpStatus.OK,
        'Purchase Request get successfuly',
        response,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: PurchaseRequest })
  async getpurchaseRequestById(@Param('id') id: string) {
    try {
      const result =
        await this.purchaseRequestService.getPurchaseRequestById(id);
      const response = new getPurchaseResponseDto(result);
      return createSuccessResponse(
        HttpStatus.OK,
        'Purchase Request get successfuly',
        response,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Delete('/:id')
  @ApiResponse({ status: 204 })
  async deletePurchaseRequest(@Param('id') id: string): Promise<any> {
    try {
      await this.purchaseRequestService.deletePurchaseRequest(id);
      return createSuccessResponse(
        HttpStatus.OK,
        'Purchase Request deleted successfuly',
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
}
