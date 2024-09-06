// src/price/price.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import { PriceEntity } from './price.entity';
import { AlertEntity } from './alert.entity'; // Import AlertEntity

@Module({
  imports: [
    TypeOrmModule.forFeature([PriceEntity, AlertEntity]), // Ensure AlertEntity is included here
  ],
  providers: [PriceService],
  controllers: [PriceController],
})
export class PriceModule {}
