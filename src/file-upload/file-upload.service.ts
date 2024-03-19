import { Injectable } from '@nestjs/common';
import { AwsService } from '../config/aws.service';

@Injectable()
export class FileUploadService {
  readonly awsService: AwsService;
  constructor(awsService: AwsService) {
    this.awsService = awsService; // Note the correction here
  }

  async upload(file: Express.Multer.File) {
    try {
      return await this.awsService.uploadFile(file);
    } catch (err: any) {
      console.error('❌Error uploading file', err);
    }
  }

  // async readFiles(filename: string, res: Response) {
  //   try {
  //     const params = {
  //       Bucket: process.env.AWS_BUCKET_NAME,
  //       Key: filename,
  //     };

  //     this.s3.headObject(params, async (err, data) => {
  //       if (err) {
  //         console.error('Error while fetching file from S3:', err);
  //         if (err.statusCode === 404) {
  //           return res.status(404).send({
  //             statusCode: 404,
  //             message: 'File not found',
  //           });
  //         } else {
  //           return res.status(500).send({
  //             statusCode: 500,
  //             message: err.message || 'Internal Server Error',
  //           });
  //         }
  //       }

  //       // checking the filetype here that is basically the mimetype ,
  //       // to make sure the file is readable in exact formate.
  //       // otherwise it will now read file properly except the images.
  //       const contentType = data?.ContentType || 'application/octet-stream';
  //       res.setHeader('Content-Type', contentType);

  //       // creating the file stream
  //       const fileStream = this.s3.getObject(params).createReadStream();

  //       fileStream.on('error', (err: Error) => {
  //         console.error('Error fetching file from S3:', err);
  //         res.status(500).send({
  //           statusCode: 500,
  //           message: err.message,
  //         });
  //       });

  //       //steam pipeline is attached to the express response
  //       return fileStream.pipe(res);
  //     });
  //   } catch (error: any) {
  //     throw new HttpException(
  //       error?.response?.body?.errors[0]?.message || error.message,
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }
}
