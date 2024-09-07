// src/price/dto/set-alert.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsDecimal, IsEmail, IsNotEmpty } from 'class-validator';

// Define an enum for the chain
enum Chain {
  ETH = 'eth',
  POLYGON = 'polygon',
}

export class SetAlertDto {
  @ApiProperty({
    description: 'The blockchain network',
    example: 'eth',
    enum: Chain,
  })
  @IsEnum(Chain, { message: 'Chain must be either "eth" or "polygon"' })
  chain: Chain;

  @ApiProperty({ description: 'The price threshold in USD', example: 2000.0 })
  @IsDecimal()
  @IsNotEmpty()
  dollar: number;

  @ApiProperty({
    description: 'The email address for alerts',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
