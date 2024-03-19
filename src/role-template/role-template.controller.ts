// role-template.controller.ts

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
import { RoleTemplateService } from './role-template.service';
import { CreateRoleTemplateDto } from './dto/create-role-template.dto';
import { ApiTags } from '@nestjs/swagger';
import { createErrorResponse, createSuccessResponse } from 'src/utils/helper';
import { PaginationDto, QueryDto } from './dto/query.dto';
import { LevelQueryDto } from './dto/levelQueryDto';

@ApiTags('Role')
@Controller('role')
export class RoleTemplateController {
  constructor(private readonly roleTemplateService: RoleTemplateService) {}

  @Post('create')
  async createRoleTemplate(
    @Body() createRoleTemplateDto: CreateRoleTemplateDto,
  ) {
    try {
      const result = await this.roleTemplateService.createRoleTemplate(
        createRoleTemplateDto,
      );
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Role created successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get()
  async getAllRoleTemplates(
    @Query() query: QueryDto,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const result = await this.roleTemplateService.getAllRoleTemplates(
        query,
        pagination,
      );
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Role list get successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get('levels')
  async getRoleTemplate(@Query() query: LevelQueryDto) {
    try {
      const result = await this.roleTemplateService.fetchTopLevelMenus(query);
      return createSuccessResponse(
        HttpStatus.OK,
        'Permission level retrieved successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get(':id')
  async getRoleTemplateById(@Param('id') id: string) {
    try {
      const result = await this.roleTemplateService.getRoleTemplateById(id);
      return createSuccessResponse(
        HttpStatus.OK,
        'Role template retrieved successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Put(':id')
  async updateRoleTemplate(
    @Param('id') id: string,
    @Body() body: CreateRoleTemplateDto,
  ) {
    try {
      const result = await this.roleTemplateService.updateRoleTemplate(
        id,
        body,
      );
      return createSuccessResponse(
        HttpStatus.OK,
        'Role template updated successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Delete(':id')
  async deleteRoleTemplate(@Param('id') id: string) {
    try {
      await this.roleTemplateService.deleteRoleTemplate(id);
      return createSuccessResponse(
        HttpStatus.OK,
        'Role template deleted successfully',
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
}
