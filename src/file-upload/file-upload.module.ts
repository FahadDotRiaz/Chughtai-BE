import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { AwsService } from '../config/aws.service';

@Module({
  controllers: [FileUploadController],
  providers: [FileUploadService, AwsService],
})
export class FileUploadModule {}
