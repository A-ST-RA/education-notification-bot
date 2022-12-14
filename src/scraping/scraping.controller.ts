import { ScrapingService } from './scraping.service';
import { Controller, Get } from '@nestjs/common';

@Controller('scraping')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Get()
  async getRaspInDb() {
    return await this.scrapingService.getAllScrapedData();
  }
}
