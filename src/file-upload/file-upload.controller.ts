import {
  Controller,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { createErrorResponse, createSuccessResponse } from 'src/utils/helper';

@ApiTags('File Upload')
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      const result = await this.fileUploadService.upload(file);
      return createSuccessResponse(
        HttpStatus.OK,
        'Image upload successfully',
        result,
      );
    } catch (err) {
      return createErrorResponse(HttpStatus.OK, 'Unable to upload file');
    }
  }

  // @Get('read/:filename')
  // @ApiParam({
  //   name: 'filename',
  //   type: 'string',
  //   required: true,
  //   description: 'S3 object key/filename/filepath',
  // })
  // @ApiResponse({ status: 200, description: 'File found and returned' })
  // @ApiOperation({ summary: 'Download an uploaded file from S3' })
  // getFile(@Param('filename') fileName: string, @Res() res: Response) {
  //   return this.fileUploadService.readFiles(fileName, res);
  // }
}
