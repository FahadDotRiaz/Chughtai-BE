import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { CreateTrackingDto } from './dto/create-dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/local-auth.guard';
import { createErrorResponse, createSuccessResponse } from 'src/utils/helper';

@ApiTags('Tracking')
@Controller('tracking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post()
  async create(@Body() createTrackingDto: CreateTrackingDto) {
    return this.trackingService.create(createTrackingDto);
  }

  @Get('list/:id')
  async TrackingList(@Param('id') id: string) {
    try {
      const list = await this.trackingService.trackingList(id);
      return createSuccessResponse(
        HttpStatus.OK,
        'List of Item Requests retrieved successfully',
        list,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
}
