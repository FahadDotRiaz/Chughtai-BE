import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiTags } from '@nestjs/swagger';
import { NotificationDto } from './dto/notification.dto';
import { createErrorResponse, createSuccessResponse } from 'src/utils/helper';
import { PaginationDto } from './dto/query.dto';

@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly sendingNotificationService: NotificationService,
  ) {}

  @Post()
  async sendNotidication(@Body() body: NotificationDto) {
    const { departmentId, payLoad, menuKey } = body;
    return await this.sendingNotificationService.sendingNotificationToAllUsers(
      payLoad,
      departmentId,
      menuKey,
    );
  }

  @Get(':userId')
  async getCategoryById(
    @Param('userId') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    try {
      const result = await this.sendingNotificationService.getNotifications(
        userId,
        pagination,
      );
      return createSuccessResponse(
        HttpStatus.OK,
        'Notification retrieved successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
}
