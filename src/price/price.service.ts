// src/price/price.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceEntity } from './price.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailerService } from '@nestjs-modules/mailer';
import { MoreThanOrEqual } from 'typeorm';
import { AlertEntity } from './alert.entity';

@Injectable()
export class PriceService {
  constructor(
    private readonly httpService: HttpService,
    private readonly mailerService: MailerService,
    @InjectRepository(PriceEntity)
    private readonly priceRepository: Repository<PriceEntity>,
    @InjectRepository(AlertEntity)
    private readonly alertRepository: Repository<AlertEntity>, // Ensure this is correct
  ) {}

  // Fetch prices from Moralis or Solscan API
  private async fetchPrice(chain: string): Promise<number> {
    const url = chain === 'ethereum' ? 'MORALIS_ETH_API_URL' : 'MORALIS_POLYGON_API_URL';
    const response = await this.httpService.get(url).toPromise();
    return response.data.price; // Adjust based on API response
  }

  // Save price of Ethereum and Polygon every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async savePrices() {
    const ethPrice = await this.fetchPrice('ethereum');
    const polygonPrice = await this.fetchPrice('polygon');

    await this.priceRepository.save([
      { chain: 'ethereum', price: ethPrice },
      { chain: 'polygon', price: polygonPrice },
    ]);

    await this.checkPriceAlerts();
  }

  // Check price alerts and send emails if conditions are met
  private async checkPriceAlerts() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const prices = await this.priceRepository.find({ where: { createdAt: oneHourAgo } });

    for (const price of prices) {
      const currentPrice = await this.fetchPrice(price.chain);
      const percentageIncrease = ((currentPrice - price.price) / price.price) * 100;

      if (percentageIncrease > 3) {
        await this.mailerService.sendMail({
          to: 'hyperhire_assignment@hyperhire.in',
          subject: `Price Alert for ${price.chain}`,
          text: `The price of ${price.chain} has increased by more than 3% in the last hour.`,
        });
      }
    }
  }

  // Get hourly prices within the last 24 hours
  async getHourlyPrices(chain: string): Promise<PriceEntity[]> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.priceRepository.find({
      where: {
        chain,
        createdAt: MoreThanOrEqual(twentyFourHoursAgo), // Use MoreThanOrEqual instead of $gte
      },
      order: { createdAt: 'ASC' },
    });
  }
  // Set price alert
  async setPriceAlert(chain: string, dollar: number, email: string) {
    const alert = this.alertRepository.create({
      chain,
      dollar,
      email,
    });

    await this.alertRepository.save(alert);
  }
}