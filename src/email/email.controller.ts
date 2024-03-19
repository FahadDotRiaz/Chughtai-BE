import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmailService } from './email.service';

@ApiTags('Email') 
@Controller('email')
 export class EmailController {
   constructor(
     private readonly sendingEmailService: EmailService,
    ) {}

   @Post()
   async sendNotidication() {
    return await this.sendingEmailService.sendEmail()
   }
 }