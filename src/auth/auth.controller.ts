import { Controller, Post, Body, HttpStatus, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  createErrorResponse,
  createSuccessResponse,
  // generateUserResponse,
} from 'src/utils/helper';
@ApiTags('Auth service')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const user = await this.authService.validateUser(
        loginDto.email,
        loginDto.password,
        loginDto.deviceToken,
      );
      const userResponse = await this.authService.generateUserResponse(user);
      const token = await this.authService.login(user);
      userResponse['access_token'] = token;
      const data = userResponse;
      return createSuccessResponse(
        HttpStatus.OK,
        'User Login Successfully',
        data,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Post('logout/:id')
  async logout(@Param('id') id: string) {
    try {
      await this.authService.logout(id);
      return createSuccessResponse(HttpStatus.OK, 'User Logout Successfully');
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }

  @Get('role/permissions/:id')
  async rolePermissions(@Param('id') id: string) {
    try {
      const result = await this.authService.rolePermissions(id);
      const data = await this.authService.generatePermissions(result);
      return createSuccessResponse(
        HttpStatus.OK,
        'Role permissions got successfully',
        data,
      );
    } catch (error) {
      return createErrorResponse(error.status, error.message);
    }
  }
}
