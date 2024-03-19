// store-issued-note.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  HttpStatus,
  Param,
  NotFoundException,
  Query,
} from '@nestjs/common';
// import { CreateStoreIssuedNoteDTO } from './dto/createSin.dto';
import { StoreIssuedNoteService } from './sin.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { MaterialIssueDTO } from '../itemRequest/dto/issued.dto';
import { createErrorResponse, createSuccessResponse } from '../utils/helper';
import { PaginationDto, QueryDto } from './dto/query.dto';
@ApiTags('SIN')
@Controller('store-issued-notes')
export class StoreIssuedNoteController {
  itemRequestService: any;
  constructor(private storeIssuedNoteService: StoreIssuedNoteService) {}

  @Post('create')
  create(@Body() createStoreIssuedNoteDTO: MaterialIssueDTO) {
    try {
      const result = this.storeIssuedNoteService.createStoreIssuedNote(
        createStoreIssuedNoteDTO,
      );
      return createSuccessResponse(
        HttpStatus.CREATED,
        'Sin generated successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get(':sin')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Items data retrieved successfully based on SIN.',
  })
  async getItemsBySin(@Param('sin') sin: string) {
    try {
      const items = await this.storeIssuedNoteService.getItemsBySin(sin);

      if (items) {
        return createSuccessResponse(
          HttpStatus.OK,
          'tems data retrieved successfully based on SIN',
          items,
        );
      } else {
        throw new NotFoundException('not Found');
      }
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get('sinList/:mirId')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'sinList',
  })
  async getListBySin(@Param('mirId') mirId: string) {
    try {
      const sins = await this.storeIssuedNoteService.getSinListByMir(mirId);

      if (sins) {
        return createSuccessResponse(
          HttpStatus.OK,
          'Sin List get successfuly',
          sins,
        );
      } else {
        throw new NotFoundException('sin not found for the provided Location.');
      }
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get('fromDepartment/:departmentId')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'sinList',
  })
  async getListByLocationSin(
    @Param('departmentId') departmentId: string,
    @Query() query: QueryDto,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const sins = await this.storeIssuedNoteService.getSinListByLoction(
        departmentId,
        query,
        pagination,
      );

      if (sins) {
        return createSuccessResponse(
          HttpStatus.OK,
          'Sin List get successfuly',
          sins,
        );
      } else {
        throw new NotFoundException('sin not found for the provided Location.');
      }
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get('toDepartment/:departmentId')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'sinList',
  })
  async getListByToLocationSin(
    @Param('departmentId') departmentId: string,
    @Query() query: QueryDto,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const sins = await this.storeIssuedNoteService.getSinListByToLoction(
        departmentId,
        query,
        pagination,
      );

      if (sins) {
        return createSuccessResponse(
          HttpStatus.OK,
          'Sin List get successfuly',
          sins,
        );
      } else {
        throw new NotFoundException('sin not found for the provided Location.');
      }
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
}
