import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    host: configService.get('EMAIL_HOST'),
                    port: +configService.get('EMAIL_PORT'),
                    secure: configService.get('EMAIL_SECURE') === 'true', // true for 465, false for other ports
                    auth: {
                        user: configService.get('EMAIL_USER'),
                        pass: configService.get('EMAIL_PASS'),
                    },
                },
                defaults: {
                    from: `"No Reply" <${configService.get('EMAIL_FROM')}>`,
                },
            }),
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule { }
