// inventory.controller.ts

import {
  BadRequestException,
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
import { InventoryService } from './inventory.service';
import { addItemDto } from './dto/create.inventry';
import { ApiTags } from '@nestjs/swagger';
import { UpdateInventoryDto } from './dto/update.inventory';
import { createErrorResponse, createSuccessResponse } from '../utils/helper';
import { PaginationDto, QueryDto } from './dto/query.dto';
@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('add-item')
  async addItemToInventory(@Body() dto: addItemDto) {
    try {
      const { item, quantity, department, min, max, type } = dto;
      const dtoData = [
        { itemId: item, issuedQty: quantity, min: min, max: max },
      ];
      const inventory = await this.inventoryService.addItemToStoreInventory(
        dtoData,
        department,
        type,
      );
      if (!inventory) {
        throw new BadRequestException('Not authorized to add Inventry');
      }
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Inventory Item added successfully',
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get('view/inventoryItems/:department?')
  async viewInventory(
    @Param('department') department?: string,
    @Query() query?: QueryDto,
    @Query() pagination?: PaginationDto,
  ): Promise<any> {
    try {
      const result = await this.inventoryService.viewInventory(
        department,
        query,
        pagination,
      );
      return createSuccessResponse(
        HttpStatus.OK,
        'Inventory get successfuly',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Patch(':id')
  // @ApiBody({ type: UpdateInventoryDto })
  // @ApiResponse({ status: 200, type: UpdateInventoryDto })
  async update(@Param('id') id: string, @Body() dto: UpdateInventoryDto) {
    try {
      const { item, quantity, location, min, max, type } = dto;
      const dtoData = [
        { itemId: item, issuedQty: quantity, min: min, max: max },
      ];
      await this.inventoryService.addItemToStoreInventory(
        dtoData,
        location,
        type,
      );
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Inventory Items updated successfuly',
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Delete('delete/inventoryItem/:id')
  async deleteInventoryItem(@Param('id') id: string) {
    try {
      await this.inventoryService.deleteInventoryItem(id);
      return createSuccessResponse(
        HttpStatus.OK,
        'Inventory Items deleted successfuly',
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
}
