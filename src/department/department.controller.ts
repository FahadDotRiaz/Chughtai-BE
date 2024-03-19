// department.controller.ts

import {
  Controller,
  Post,
  Body,
  Get,
  HttpStatus,
  Delete,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { DepartmentDto } from './dto/create-department.dto';
import { ApiTags } from '@nestjs/swagger';
import { createErrorResponse, createSuccessResponse } from 'src/utils/helper';
import { DepartmentTypeDto, PaginationDto, QueryDto } from './dto/query.dto';
import { DepartmentService } from './department.service';
import { DepartmentApprovalDto } from './dto/approval-department.dto';
@ApiTags('Departments')
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  async createDepartment(@Body() createDepartmentDto: DepartmentDto) {
    try {
      const result =
        await this.departmentService.createDepartment(createDepartmentDto);

      return createSuccessResponse(
        HttpStatus.CREATED,
        'Department created successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get()
  async getAllDepartments(
    @Query() query: QueryDto,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const result = await this.departmentService.getAllDepartments(
        query,
        pagination,
      );
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Department list get successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get(':id')
  async getDepartmentById(@Param('id') id: string) {
    try {
      const result = await this.departmentService.getDepartmentById(id);
      return createSuccessResponse(
        HttpStatus.OK,
        'Department retrieved successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get('type/:storeId')
  async getDepartmentType(
    @Param('storeId') id: string,
    @Query() query: DepartmentTypeDto,
  ) {
    try {
      const result = await this.departmentService.getDepartmentType(id, query);
      return createSuccessResponse(
        HttpStatus.OK,
        'Department retrieved successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Put(':id')
  async updateDepartment(@Param('id') id: string, @Body() body: DepartmentDto) {
    try {
      const result = await this.departmentService.updateDepartment(id, body);
      return createSuccessResponse(
        HttpStatus.OK,
        'Department updated successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Put('approval/:departmentId')
  async departmentApproval(
    @Param('departmentId') id: string,
    @Body() body: DepartmentApprovalDto,
  ) {
    try {
      const result = await this.departmentService.departmentApproval(id, body);
      return createSuccessResponse(
        HttpStatus.OK,
        'Department updated successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Delete(':id')
  async deleteDepartment(@Param('id') id: string) {
    try {
      await this.departmentService.deleteDepartment(id);
      return createSuccessResponse(
        HttpStatus.OK,
        'Department deleted successfully',
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
}
