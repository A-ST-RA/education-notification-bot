import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ScrapingService } from './scraping.service';
import { HttpModule } from '@nestjs/axios';
import { Scraping } from './scraping.entity';
import { ScrapingController } from './scraping.controller';
import { VkBotModule } from 'src/vk-bot/vk-bot.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Scraping]),
    HttpModule,
    forwardRef(() => VkBotModule),
  ],
  providers: [ScrapingService],
  exports: [ScrapingService],
  controllers: [ScrapingController],
})
export class ScrapingModule {}
