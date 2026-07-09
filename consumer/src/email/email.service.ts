import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class EmailService {
    constructor(private readonly mailerService:MailerService){}

    async sendEmailcreateedConfirmation(data:{
        name:string;
        email:string;
    }):Promise<void>{
        await this.mailerService.sendMail({
            to:data.email,
        subject: 'your email was created successfully',

        text:`Hello ${data.name},
        Your email record has been created successfully.
        Name: ${data.name}
        Email:${data.email}
        thank you.`,

        html:` <h2>Email created successfully</h2>

        <p>Hello <strong>${data.name}</strong>,</p>

        <p>Your email record has been created successfully.</p>

        <ul>
          <li><strong>Name:</strong> ${data.name}</li>
          <li><strong>Email:</strong> ${data.email}</li>
        </ul>

        <p>Thank you.</p>`,
        });
        
    }
}
