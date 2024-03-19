// purchase-order.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  HttpStatus,
  Patch,
  Query,
} from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto } from './dto/purchase-order.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/local-auth.guard';
import { Request } from 'express';
import { createErrorResponse, createSuccessResponse } from 'src/utils/helper';
import { UpdatePurchaseOrderDto } from './dto/update.dto';
import { PaginationDto, QueryDto } from './dto/query.dto';
import { getPurchaseOrderResponseDto } from './dto/response.dto';

@ApiTags('PurchaseOrder')
@Controller('purchase-order')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @Post('create')
  async create(
    @Req() request: Request,
    @Body() createPurchaseOrderDto: CreatePurchaseOrderDto,
  ) {
    const user = request ? (request.user as any) : null;
    const requestData = {
      ...createPurchaseOrderDto,
      createdBy: { id: user.id },
    };
    const result = await this.purchaseOrderService.createPurchaseOrderWithItems(
      requestData,
      null,
    );
    return createSuccessResponse(
      HttpStatus.OK,
      'Purchase Order created successfuly',
      result,
    );
  }

  @Patch('update/:id')
  async update(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto,
  ) {
    const user = request ? (request.user as any) : null;
    const requestData = {
      ...updatePurchaseOrderDto,
      createdBy: { id: user.id },
    };
    const result = await this.purchaseOrderService.createPurchaseOrderWithItems(
      requestData,
      id,
    );
    return createSuccessResponse(
      HttpStatus.OK,
      'Purchase Order created successfuly',
      result,
    );
  }

  @Get(':departmentId')
  async getAll(
    @Param('departmentId') departmentId: string,
    @Query() query: QueryDto,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const result = await this.purchaseOrderService.getAllPurchaseOrders(
        departmentId,
        query,
        pagination,
      );
      // const response = result.list.map(
      //   (data) => new getPurchaseOrderResponseDto(data),
      // );

      return createSuccessResponse(
        HttpStatus.OK,
        'Purchase Order  get successfuly',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get('purchaseOrderItems/:id')
  async getPoItemsById(@Param('id') id: string) {
    try {
      const result = await this.purchaseOrderService.getPoItems(id);
      const response = new getPurchaseOrderResponseDto(result);
      return createSuccessResponse(
        HttpStatus.OK,
        'Purchase Order Items get successfuly',
        response,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
}
