// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceService } from './price/price.service';
import { PriceController } from './price/price.controller';
import { PriceEntity, PriceAlertEntity } from './price/price.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { PriceModule } from './price/price.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config module global so you don't have to import it elsewhere
    }),
    ScheduleModule.forRoot(),
    HttpModule,
    PriceModule,

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.HOST_NAME,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [PriceEntity, PriceAlertEntity],
      synchronize: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
    }),
    TypeOrmModule.forFeature([PriceEntity, PriceAlertEntity]),
  ],
  controllers: [PriceController],
  providers: [PriceService],
})
export class AppModule {}
