import { HttpService } from '@nestjs/axios';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { load } from 'cheerio';
import { InjectRepository } from '@nestjs/typeorm';
import { Scraping } from './scraping.entity';
import { Repository } from 'typeorm';
import { VkBotService } from 'src/vk-bot/vk-bot.service';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  private readonly url = 'https://uaviak.ru:8081/pages/raspisanie-/#pos2';

  constructor(
    @InjectRepository(Scraping)
    private readonly scrapingRepository: Repository<Scraping>,
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => VkBotService))
    private readonly vkBotService: VkBotService,
  ) {}

  async getScrapedDataByGroup(gropName: string) {
    const currentDate = new Date(Date.now());

    const month = currentDate.getUTCMonth() + 1; //months from 1-12
    const day = currentDate.getUTCDate();
    const year = currentDate.getUTCFullYear();

    const currDateProcessed = `${year}/${month}${day}`;

    return await this.scrapingRepository.findOne({
      where: {
        group: gropName,
        date: currDateProcessed,
      },
    });
  }

  async getAllScrapedData() {
    const currentDate = new Date(Date.now());

    const month = currentDate.getUTCMonth() + 1; //months from 1-12
    const day = currentDate.getUTCDate();
    const year = currentDate.getUTCFullYear();

    const currDateProcessed = `${year}/${month}${day}`;

    return await this.scrapingRepository.find({
      where: {
        date: currDateProcessed,
      },
    });
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async parseDataFromWebSiteCron() {
    this.logger.debug('Parsing of web resourse started');
    const currentDate = new Date(Date.now());

    const month = currentDate.getUTCMonth() + 1; //months from 1-12
    const day = currentDate.getUTCDate();
    const year = currentDate.getUTCFullYear();

    const currDateProcessed = `${year}/${month}${day}`;

    const currentParsed = await this.scrapingRepository.find({
      where: {
        date: currDateProcessed,
      },
    });

    if (currentParsed.length) return;

    const rawData = await firstValueFrom(this.httpService.get(this.url));
    const htmlData = rawData.data;

    const cheerio = load(htmlData);

    const rawText = cheerio('.scrolling-text.pos2').text();
    const splitedData = rawText
      .split(
        '----------------------------------------------------------------------------------------',
      )
      .slice(1);

    for (const str of splitedData) {
      const scrapping = new Scraping();
      scrapping.date = currDateProcessed;
      scrapping.group = str.split(' ')[0].replace('\n', '');
      scrapping.rasp = str;

      await this.scrapingRepository.save(scrapping);
    }
  }
}
