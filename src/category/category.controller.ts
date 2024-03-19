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
import { ApiTags } from '@nestjs/swagger';
import { createErrorResponse, createSuccessResponse } from 'src/utils/helper';
import { CategoryService } from './category.service';
import { CategoryDto } from './dto/create.dto';
import { PaginationDto, QueryDto } from './dto/query.dto';
import { UpdateCategoryDto } from './dto/update.dto';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    try {
      const result = await this.categoryService.getCategoryById(id);
      return createSuccessResponse(
        HttpStatus.OK,
        'Category retrieved successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(
        HttpStatus.NOT_FOUND,
        'Category not found',
        error,
      );
    }
  }

  @Get()
  async getCategories(
    @Query() query: QueryDto,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const result = await this.categoryService.getCategories(
        query,
        pagination,
      );
      return createSuccessResponse(
        HttpStatus.OK,
        'Category retrieved successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(
        HttpStatus.NOT_FOUND,
        'Category not found',
        error,
      );
    }
  }

  @Post()
  async createCategory(@Body() body: CategoryDto) {
    try {
      const result = await this.categoryService.createCategory(body, null);
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Category created successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Patch(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
  ) {
    try {
      const result = await this.categoryService.createCategory(body, id);
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Category updated successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string): Promise<any> {
    try {
      await this.categoryService.deleteCategory(id);
      return createSuccessResponse(
        HttpStatus.OK,
        'Category deleted successfuly',
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
}
