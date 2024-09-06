// src/price/price.controller.ts
import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { PriceService } from './price.service';

@Controller('price')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get('hourly')
  getHourlyPrices(@Query('chain') chain: string) {
    return this.priceService.getHourlyPrices(chain);
  }

  @Post('set-alert')
  setPriceAlert(@Body() body: { chain: string; dollar: number; email: string }) {
    return this.priceService.setPriceAlert(body.chain, body.dollar, body.email);
  }
}
