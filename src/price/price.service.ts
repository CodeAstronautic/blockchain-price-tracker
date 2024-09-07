// src/price/price.service.ts
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceEntity, PriceAlertEntity } from './price.entity';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { MailerService } from '@nestjs-modules/mailer';
import { MoreThanOrEqual } from 'typeorm';

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly mailerService: MailerService,
    @InjectRepository(PriceEntity)
    private readonly priceRepository: Repository<PriceEntity>,
    @InjectRepository(PriceAlertEntity)
    private readonly priceAlertRepository: Repository<PriceAlertEntity>,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  private async fetchPrice(chain: string): Promise<number> {
    const response = await this.httpService
      .get(
        `https://deep-index.moralis.io/api/v2.2/erc20/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0/price?chain=${chain}&include=percent_change`,
        {
          headers: {
            'X-API-Key': process.env.MORALIS_API_KEY,
          },
        },
      )
      .toPromise();
    return response.data?.usdPrice;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async savePrices() {
    try {
      const ethPrice = await this.fetchPrice('eth');
      await this.priceRepository.save([{ chain: 'eth', price: ethPrice }]);
      this.logger.log('Successfully fetched price for eth');
    } catch (error: any) {
      this.logger.log(`Error fetching eth price: ${error}`);
    }
    try {
      const polygonPrice = await this.fetchPrice('polygon');
      await this.priceRepository.save([
        { chain: 'polygon', price: polygonPrice },
      ]);
      this.logger.log('Successfully fetched price for polygon');
    } catch (error: any) {
      this.logger.log(`Error fetching polygon price: ${error}`);
    }
    await this.checkPriceAlerts();
  }

  private async checkPriceAlerts() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const prices = await this.priceRepository.find({
      where: { createdAt: oneHourAgo },
    });

    for (const price of prices) {
      const currentPrice = await this.fetchPrice(price.chain);
      const percentageIncrease =
        ((currentPrice - price.price) / price.price) * 100;

      if (percentageIncrease > 3) {
        await this.mailerService.sendMail({
          to: 'hyperhire_assignment@hyperhire.in',
          subject: `Price Alert for ${price.chain}`,
          text: `The price of ${price.chain} has increased by more than 3% in the last hour.`,
        });
      }
    }
  }

  async getHourlyPrices(chain: string): Promise<PriceEntity[]> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Fetch all records from the last 24 hours
    const prices = await this.priceRepository.find({
      where: {
        chain,
        createdAt: MoreThanOrEqual(twentyFourHoursAgo),
      },
      order: { createdAt: 'ASC' },
    });

    // Group prices by hour
    const hourlyPricesMap = new Map<number, PriceEntity>();

    prices.forEach((price) => {
      const hour = new Date(price.createdAt).getHours();

      // Add the first occurrence of the hour to the map
      if (!hourlyPricesMap.has(hour)) {
        hourlyPricesMap.set(hour, price);
      }
    });

    // Convert the map to an array of prices for each hour
    const hourlyPrices = Array.from(hourlyPricesMap.values());

    return hourlyPrices;
  }

  async createSetPriceAlert(setAlertDto) {
    const { chain, dollar, email } = setAlertDto;
    try {
      const alert = await this.priceAlertRepository.save({
        chain,
        dollar,
        email,
      });
      const jobName = `alert-${alert.id}`;

      const job = setInterval(
        async () => {
          await this.checkPriceAlert(alert);
        },
        5 * 60 * 1000,
      ); // Every 5 minutes

      this.schedulerRegistry.addInterval(jobName, job);

      return `Alert set for ${chain} at $${dollar} for email ${email}`;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create price alert: ${error}`,
      );
    }
  }

  async checkPriceAlert(alert: PriceAlertEntity): Promise<void> {
    const { chain, dollar, email } = alert;

    const currentPrice = await this.fetchPrice(chain);

    if (currentPrice >= dollar) {
      await this.mailerService.sendMail({
        to: email,
        subject: `Price Alert: ${chain} has reached $${dollar}`,
        text: `The price of ${chain} is now $${currentPrice}.`,
      });

      this.logger.log(
        `Price alert sent to ${email} for ${chain} at $${dollar}`,
      );
      const jobName = `alert-${alert.id}`;
      this.schedulerRegistry.deleteInterval(jobName);
    }
  }
}
