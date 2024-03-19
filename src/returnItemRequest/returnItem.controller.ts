import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ItemReturnRequestDTO } from './dto/return-request.dto';
import { ItemReturnRequestService } from './returnItem.service';
import { JwtAuthGuard } from '../auth/guards/local-auth.guard';
import { Request } from 'express';
import {
  createErrorResponse,
  createSuccessResponse,
  removeCircularReferences,
} from 'src/utils/helper';
import { MaterialAcceptDTO } from './dto/accept.dto';
import { PaginationDto, QueryDto } from './dto/query.dto';
import { DepartmentUpdateDTO } from './dto/departmentReview.dto';

@ApiTags('MRR')
@Controller('itemReturnRequest')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ItemReturnRequestController {
  constructor(private itemReturnRequestService: ItemReturnRequestService) {}

  @Post('create')
  @ApiBody({
    type: ItemReturnRequestDTO,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Item Return Request created successfully.',
  })
  async createItemRequest(
    @Req() request: Request,
    @Body() itemRequestDto: ItemReturnRequestDTO,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const requestData = { ...itemRequestDto, createdBy: { id: user.id } };
      const result =
        await this.itemReturnRequestService.createItemReturnRequest(
          requestData,
          user.id,
        );
      return createSuccessResponse(
        HttpStatus.OK,
        'Return Items request added successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
  @Get('departmentReqList/:department')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of Return Item Requests retrieved successfully.',
  })
  async getDepartmentItemRequests(
    @Param('department') department: string,
    @Query() query: QueryDto,
    @Query() pagination: PaginationDto,
    @Req() request: Request,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const itemRequests = await this.itemReturnRequestService.getItemRequests(
        user.id,
        department,
        false,
        query,
        pagination,
        true,
      );
      return createSuccessResponse(
        HttpStatus.OK,
        'List of Item Requests retrieved successfully',
        itemRequests,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get('myReqList/:department')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of Item Requests retrieved successfully.',
  })
  async getItemRequests(
    @Param('department') department: string,
    @Req() request: Request,
    @Query() query: QueryDto,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const itemRequests = await this.itemReturnRequestService.getItemRequests(
        user.id,
        department,
        false,
        query,
        pagination,
      );
      return createSuccessResponse(
        HttpStatus.OK,
        'List of Item Requests retrieved successfully',
        itemRequests,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get('hodReviewList/:department')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of Item Requests retrieved successfully.',
  })
  async getHodItemRequests(
    @Param('department') department: string,
    @Req() request: Request,
    @Query() query: QueryDto,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const itemRequests = await this.itemReturnRequestService.getItemRequests(
        user.id,
        department,
        false,
        query,
        pagination,
        true,
      );
      return createSuccessResponse(
        HttpStatus.OK,
        'List of Item Requests retrieved successfully',
        itemRequests,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get('approvedReqList/:department')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of Item Requests retrieved successfully.',
  })
  async getApprovedItemRequests(
    @Param('department') department: string,
    @Req() request: Request,
    @Query() query: QueryDto,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const itemRequests =
        await this.itemReturnRequestService.getItemApprovedRequests(
          user.id,
          department,
          false,
          query,
          pagination,
        );
      return createSuccessResponse(
        HttpStatus.OK,
        'List of Item Requests retrieved successfully',
        itemRequests,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get('reviewReqList/:department')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of Item Requests retrieved successfully.',
  })
  async getReviewItemRequests(
    @Param('department') department: string,
    @Req() request: Request,
    @Query() query: QueryDto,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const itemRequests = await this.itemReturnRequestService.getItemRequests(
        user.id,
        department,
        true,
        query,
        pagination,
      );
      return createSuccessResponse(
        HttpStatus.OK,
        'List of Item Requests retrieved successfully',
        itemRequests,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Delete(':id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'MRR deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'MIR not found for the provided ID.',
  })
  async deleteMirById(@Param('id') id: string) {
    try {
      const deletedMrr = await this.itemReturnRequestService.deleteMrrById(id);

      if (deletedMrr) {
        return createSuccessResponse(
          HttpStatus.OK,
          'MRR deleted successfully',
          deletedMrr,
        );
      } else {
        throw new NotFoundException('MRR not found for the provided ID');
      }
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get(':id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'MRR data retrieved successfully based on ID.',
  })
  async getMrrById(@Param('id') id: string) {
    try {
      const mrrData = await this.itemReturnRequestService.getMrrById(id);

      if (mrrData) {
        return createSuccessResponse(
          HttpStatus.OK,
          'MRR data retrieved successfully based on ID',
          mrrData,
        );
      } else {
        throw new NotFoundException('MRR not found for the provided SIN');
      }
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Post('accept')
  @ApiBody({
    type: MaterialAcceptDTO,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Requested Items are issued successfully',
  })
  async issueItemRequest(
    @Body() reqBody: MaterialAcceptDTO,
    @Req() request: Request,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const result = await this.itemReturnRequestService.returnItems(
        reqBody,
        user.id,
      );
      if (result) {
        return createSuccessResponse(
          HttpStatus.CREATED,
          'Requested Items are returned successfully',
        );
      }
      throw new NotFoundException('Requested Items not return');
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Patch(':id')
  async updateReturnItemRequest(
    @Param('id') id: string,
    @Req() request: Request,
    @Body() itemRequestDto: ItemReturnRequestDTO,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const requestData = { ...itemRequestDto, createdBy: { id: user.id } };
      const result =
        await this.itemReturnRequestService.createItemReturnRequest(
          requestData,
          user.id,
          id,
        );

      if (result) {
        return createSuccessResponse(
          HttpStatus.OK,
          'Item Return Request updated successfully',
          removeCircularReferences(result),
        );
      } else {
        throw new NotFoundException(
          'Item Return Request not found for the provided ID',
        );
      }
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Patch('hodReview/:id')
  async updateHodReturnItemRequest(
    @Param('id') id: string,
    @Req() request: Request,
    @Body() itemRequestDto: ItemReturnRequestDTO,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const requestData = { ...itemRequestDto, createdBy: { id: user.id } };
      const result =
        await this.itemReturnRequestService.createItemReturnRequest(
          requestData,
          user.id,
          id,
          true,
        );

      if (result) {
        return createSuccessResponse(
          HttpStatus.OK,
          'Item Return Request Review By HOD successfully',
          removeCircularReferences(result),
        );
      } else {
        throw new NotFoundException(
          'Item Return Request not found for the provided ID',
        );
      }
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Patch('departmentReview/:id')
  async updateItemRequestByDepartment(
    @Param('id') id: string,
    @Req() request: Request,
    @Body() itemRequestDto: DepartmentUpdateDTO,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const result = await this.itemReturnRequestService.departmentUpdate(
        id,
        itemRequestDto,
        user.id,
      );

      if (result) {
        return createSuccessResponse(
          HttpStatus.OK,
          'Item Return Request Review By HOD successfully',
          removeCircularReferences(result),
        );
      } else {
        return createErrorResponse(
          HttpStatus.NOT_FOUND,
          'Item Return Request not found for the provided ID',
        );
      }
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
}
