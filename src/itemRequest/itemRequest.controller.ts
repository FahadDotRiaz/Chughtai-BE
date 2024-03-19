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
import { ItemRequestService } from './itemRequest.service';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ItemRequestDTO } from './dto/item.request.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/local-auth.guard';
import { MaterialIssueDTO, StatusDto } from './dto/issued.dto';
import {
  createErrorResponse,
  createSuccessResponse,
  removeCircularReferences,
} from 'src/utils/helper';
import { PaginationDto, QueryDto, SinQueryDto } from './dto/query.dto';
import { VersionHistoryResponseDto } from './dto/response.dto';
import { DepartmentUpdateDTO } from './dto/departmentReview.dto';
@ApiTags('MIR')
@Controller('itemRequest')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ItemRequestController {
  constructor(private itemRequestService: ItemRequestService) {}

  @Post('create')
  @ApiBody({
    type: ItemRequestDTO,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Item Request created successfully.',
  })
  async createItemRequest(
    @Req() request: Request,
    @Body() itemRequestDto: ItemRequestDTO,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const result = await this.itemRequestService.createItemRequest(
        itemRequestDto,
        user.id,
      );
      if (result) {
        return createSuccessResponse(
          HttpStatus.CREATED,
          'Request created successfully',
          removeCircularReferences(result),
        );
      }
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
    @Query() query: QueryDto,
    @Query() pagination: PaginationDto,
    @Req() request: Request,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const itemRequests = await this.itemRequestService.getItemRequests(
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

  @Get('hodReviewReqList/:department')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of Item Requests retrieved successfully.',
  })
  async getHodReviewItemRequests(
    @Param('department') department: string,
    @Query() query: QueryDto,
    @Query() pagination: PaginationDto,
    @Req() request: Request,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const itemRequests = await this.itemRequestService.getItemRequests(
        user.id,
        department,
        true,
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

  @Get('reviewReqList/:department')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of Item Requests retrieved successfully.',
  })
  async getReviewItemRequests(
    @Param('department') department: string,
    @Query() query: QueryDto,
    @Query() pagination: PaginationDto,
    @Req() request: Request,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const itemRequests = await this.itemRequestService.getItemRequests(
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

  @Get('versionHistory/:mirId')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mir verion history retrieved successfully.',
  })
  async versionHistory(
    @Param('mirId') mirId: string,
    @Query() query: SinQueryDto,
  ) {
    try {
      const itemRequests = await this.itemRequestService.verionHistory(
        mirId,
        query,
      );
      const response = new VersionHistoryResponseDto(itemRequests);
      return createSuccessResponse(
        HttpStatus.OK,
        'List of Item Requests retrieved successfully',
        response,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get('departmentReqList/:department')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of Item Requests retrieved successfully.',
  })
  async getDepartmentItemRequests(
    @Param('department') department: string,
    @Query() query: QueryDto,
    @Query() pagination: PaginationDto,
    @Req() request: Request,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const itemRequests = await this.itemRequestService.getItemRequests(
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

  @Post('customItems/actions')
  @ApiBody({
    type: StatusDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Custom Items are updated successfully',
  })
  async customItemActions(@Body() reqBody: StatusDto) {
    try {
      const result = await this.itemRequestService.customItemActions(reqBody);
      if (result) {
        return createSuccessResponse(
          HttpStatus.CREATED,
          'Custom Items are updated successfully',
        );
      }
      throw new NotFoundException('Custom Items not issued');
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Post('issued')
  @ApiBody({
    type: MaterialIssueDTO,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Requested Items are issued successfully',
  })
  async issueItemRequest(
    @Body() reqBody: MaterialIssueDTO,
    @Req() request: Request,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const result = await this.itemRequestService.issuedItems(
        reqBody,
        user.id,
      );
      if (result) {
        return createSuccessResponse(
          HttpStatus.CREATED,
          'Requested Items are issued successfully',
        );
      }
      throw new NotFoundException('Requested Items not issued');
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get(':id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'MIR data retrieved successfully based on ID.',
  })
  async getMirById(@Param('id') id: string) {
    try {
      const mirData = await this.itemRequestService.getMirById(id);

      if (mirData) {
        return createSuccessResponse(
          HttpStatus.OK,
          'MIR data retrieved successfully based on ID',
          mirData,
        );
      } else {
        throw new NotFoundException('MIR not found for the provided SIN');
      }
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Delete(':id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'MIR deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'MIR not found for the provided ID.',
  })
  async deleteMirById(@Param('id') id: string) {
    try {
      const deletedMir = await this.itemRequestService.deleteMirById(id);

      if (deletedMir) {
        return createSuccessResponse(
          HttpStatus.OK,
          'MIR deleted successfully',
          deletedMir,
        );
      } else {
        return createErrorResponse(
          HttpStatus.NOT_FOUND,
          'MIR not found for the provided ID',
        );
      }
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Patch(':id')
  async updateItemRequest(
    @Param('id') id: string,
    @Req() request: Request,
    @Body() itemRequestDto: ItemRequestDTO,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const result = await this.itemRequestService.createItemRequest(
        itemRequestDto,
        user.id,
        id,
      );

      if (result) {
        return createSuccessResponse(
          HttpStatus.OK,
          'Item Request updated successfully',
          removeCircularReferences(result),
        );
      } else {
        return createErrorResponse(
          HttpStatus.NOT_FOUND,
          'Item Request not found for the provided ID',
        );
      }
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Patch('hodReview/:id')
  async updateItemRequestByHod(
    @Param('id') id: string,
    @Req() request: Request,
    @Body() itemRequestDto: ItemRequestDTO,
  ) {
    try {
      const user = request ? (request.user as any) : null;
      const result = await this.itemRequestService.createItemRequest(
        itemRequestDto,
        user.id,
        id,
        true,
      );

      if (result) {
        return createSuccessResponse(
          HttpStatus.OK,
          'Item Request Review By HOD successfully',
          removeCircularReferences(result),
        );
      } else {
        return createErrorResponse(
          HttpStatus.NOT_FOUND,
          'Item Request not found for the provided ID',
        );
      }
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get('itemDetails/:itemId') // Change the endpoint path
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Item details retrieved successfully.',
  })
  async getItemDetails(
    @Param('itemId') itemId: string,
    @Query('departmentId') departmentId: string, // Change the parameter name
  ) {
    try {
      const itemDetails = await this.itemRequestService.getItemDetails(
        itemId,
        departmentId,
      );

      if (itemDetails) {
        return createSuccessResponse(
          HttpStatus.OK,
          'Item details retrieved successfully',
          itemDetails,
        );
      } else {
        throw new NotFoundException('Item details not found');
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
      const result = await this.itemRequestService.departmentUpdate(
        id,
        itemRequestDto,
        user.id,
      );

      if (result) {
        return createSuccessResponse(
          HttpStatus.OK,
          'Item Request Review By HOD successfully',
          removeCircularReferences(result),
        );
      } else {
        return createErrorResponse(
          HttpStatus.NOT_FOUND,
          'Item Request not found for the provided ID',
        );
      }
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
}
