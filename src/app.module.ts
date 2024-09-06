// src/app.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // Import HttpModule
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceService } from './price/price.service';
import { PriceController } from './price/price.controller';
import { PriceEntity } from './price/price.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { PriceModule } from './price/price.module';

@Module({
  imports: [
    HttpModule, // Add HttpModule here
    PriceModule, // Ensure PriceModule is imported here

    TypeOrmModule.forRoot({
      type: 'postgres', // or your chosen RDBMS
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
      database: 'price_tracker',
      entities: [PriceEntity],
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
    TypeOrmModule.forFeature([PriceEntity]),
  ],
  controllers: [PriceController],
  providers: [PriceService],
})
export class AppModule {}
