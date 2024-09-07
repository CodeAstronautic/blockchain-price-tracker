// src/price/price.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios'; // Import HttpModule
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import { PriceEntity, PriceAlertEntity } from './price.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PriceEntity, PriceAlertEntity]), // Include your entities here
    HttpModule, // Import HttpModule to make HttpService available
  ],
  providers: [PriceService],
  controllers: [PriceController],
})
export class PriceModule {}
