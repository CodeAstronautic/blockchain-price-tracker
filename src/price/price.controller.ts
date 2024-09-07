// src/price/price.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';

import { PriceService } from './price.service';
import { SetAlertDto } from 'src/dto/set-alert.dto';

@ApiTags('price')
@Controller('price')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get('hourly')
  getHourlyPrices(@Query('chain') chain: string) {
    return this.priceService.getHourlyPrices(chain);
  }

  @Post('set-alert')
  @ApiResponse({
    status: 201,
    description: 'Price alert created successfully.',
  })
  @ApiResponse({ status: 500, description: 'Failed to create price alert.' })
  @ApiBody({ type: SetAlertDto })
  async setPriceAlert(@Body() setAlertDto: SetAlertDto) {
    try {
      const createdAlert =
        await this.priceService.createSetPriceAlert(setAlertDto);
      return {
        status: HttpStatus.CREATED,
        message: 'Price alert created successfully.',
        data: createdAlert,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Failed to create price alert: ${error}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
