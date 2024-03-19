// aws.service.ts
import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';

@Injectable()
export class AwsService {
  private readonly s3: S3;

  constructor() {
    this.s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<any> {
    const params = {
      Bucket: 'chugtai',
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const result = await this.s3.upload(params).promise();
    return {
      location: result.Location,
      filePath: result.Key,
    };
  }
}
