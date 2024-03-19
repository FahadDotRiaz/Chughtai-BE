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
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { createErrorResponse, createSuccessResponse } from '../utils/helper';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemChildDto, PaginationDto, QueryDto } from './dto/query.dto';
@ApiTags('Items')
@Controller('item')
export class ItemController {
  constructor(private itemService: ItemService) {}

  @Post()
  @ApiBody({
    type: CreateItemDto,
  })
  async create(@Body() createItemDto: CreateItemDto): Promise<any> {
    try {
      const result = await this.itemService.create(createItemDto, null);
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Item added successfuly',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Patch(':id')
  async updateItem(@Param('id') id: string, @Body() updateData: UpdateItemDto) {
    try {
      const result = await this.itemService.create(updateData, id);
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Item updated successfuly',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get()
  async getAllItems(
    @Query() query: QueryDto,
    @Query() pagination: PaginationDto,
  ): Promise<any> {
    try {
      const data = await this.itemService.getAllItems(query, pagination);
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Item List get successfuly',
        data ?? [],
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get('/child')
  async getItemsType(@Query() query: ItemChildDto): Promise<any> {
    try {
      const list = await this.itemService.getParentItems(query);
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Item List get successfuly',
        list ?? [],
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get(':id')
  async getOneItem(@Param('id') id: string) {
    try {
      const result = await this.itemService.getItemById(id);
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Item get successfuly',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Delete(':id')
  async deleteConsumption(@Param('id') id: string): Promise<any> {
    try {
      await this.itemService.deleteItem(id);
      return createSuccessResponse(HttpStatus.OK, 'Item deleted successfuly');
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
}
