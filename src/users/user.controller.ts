import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { createErrorResponse, createSuccessResponse } from 'src/utils/helper';
import { PaginationDto, QueryDto } from './dto/query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(@Query() query: QueryDto, @Query() pagination: PaginationDto) {
    try {
      const result = await this.userService.findAll(query, pagination);
      return createSuccessResponse(
        HttpStatus.CREATED,
        'User list get successfully',
        result,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.createUser(createUserDto);
      return createSuccessResponse(
        HttpStatus.CREATED,
        'User created successfully',
        user,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const updatedUser = await this.userService.updateUser(id, updateUserDto);
      return createSuccessResponse(
        HttpStatus.OK,
        'User updated successfully',
        updatedUser,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    try {
      const user = await this.userService.getUserById(id);
      return createSuccessResponse(
        HttpStatus.OK,
        'User retrieved successfully',
        user,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    try {
      await this.userService.deleteUser(id);
      return createSuccessResponse(HttpStatus.OK, 'User deleted successfully');
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
}
