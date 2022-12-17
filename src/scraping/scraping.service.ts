import { HttpService } from '@nestjs/axios';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { load } from 'cheerio';
import { InjectRepository } from '@nestjs/typeorm';
import { Scraping } from './scraping.entity';
import { MoreThan, Repository } from 'typeorm';
import { VkBotService } from 'src/vk-bot/vk-bot.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  private readonly url = 'https://uaviak.ru:8081/pages/raspisanie-/#pos2';

  constructor(
    @InjectRepository(Scraping)
    private readonly scrapingRepository: Repository<Scraping>,
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => VkBotService))
    private readonly vkBotService: VkBotService,
  ) {}

  async getScrapedDataByGroup(gropName: string) {
    const currentDate = new Date(Date.now());

    const month = currentDate.getUTCMonth() + 1; //months from 1-12
    const day = currentDate.getUTCDate();
    const year = currentDate.getUTCFullYear();

    const currDateProcessed = +`${day}${month}${year}`;

    return await this.scrapingRepository.findOne({
      where: [
        {
          group: gropName,
          date: MoreThan(currDateProcessed),
        },
        {
          group: gropName,
          date: currDateProcessed,
        },
      ],
    });
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async parseDataFromWebSiteCron() {
    this.logger.debug('Parsing of web resourse started');

    const rawData = await firstValueFrom(this.httpService.get(this.url));
    const htmlData = rawData.data;

    const cheerio = load(htmlData);

    const rawText = cheerio('.scrolling-text.pos2').text();
    const splitedData = rawText.split(
      '----------------------------------------------------------------------------------------',
    );

    const isNewDataNeeded = splitedData[0].split(' ');

    const newDate = +isNewDataNeeded[3].split('.').join('');

    const temp = await this.scrapingRepository.find({
      where: {
        date: newDate,
        isPrepod: false,
      },
    });

    if (temp.length) return;

    const slicedData = splitedData.slice(1);

    for (const str of slicedData) {
      const scrapping = new Scraping();
      scrapping.date = newDate;
      scrapping.group = str.split(' ')[0].replace('\n', '');
      scrapping.rasp = str;
      scrapping.isPrepod = false;

      const usersList = await this.userService.findAllByGroup(scrapping.group);

      for (const user of usersList) {
        this.vkBotService.sendNewRaspToAllSubscribedUsers(
          user.vkId,
          scrapping.rasp,
        );
      }

      await this.scrapingRepository.save(scrapping);
    }
  }
}
