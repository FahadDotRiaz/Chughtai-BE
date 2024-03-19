import { Injectable } from "@nestjs/common";
const SibApiV3Sdk = require('@getbrevo/brevo');

@Injectable()
export class EmailService {
  constructor() {}

  async sendEmail() {
    try {
      let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

      let apiKey = apiInstance.authentications['apiKey'];
      apiKey.apiKey = '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';

      let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); 

      sendSmtpEmail.subject = "My {{params.subject}}";
      sendSmtpEmail.htmlContent = "<html><body><h1>This is my first transactional email {{params.parameter}}</h1></body></html>";
      sendSmtpEmail.sender = {"name":"John Doe","email":"abdul.rehman@xevensolutions.com"};
      sendSmtpEmail.to = [{"email":"naeemabdulrehman08@gmail.com","name":"Jane Doe"}];
      sendSmtpEmail.cc = [{"email":"example2@example2.com","name":"Janice Doe"}];
      sendSmtpEmail.bcc = [{"name":"John Doe","email":"example@example.com"}];
      sendSmtpEmail.replyTo = {"email":"replyto@domain.com","name":"John Doe"};
      sendSmtpEmail.headers = {"Some-Custom-Name":"unique-id-1234"};
      sendSmtpEmail.params = {"parameter":"My param value","subject":"New Subject"};

      const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('API called successfully. Returned data: ' + JSON.stringify(data));
      
      return { success: true, message: 'Email sent successfully.' };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Failed to send email.' };
    }
  }
}
