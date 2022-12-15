import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ScrapingService } from './scraping.service';
import { HttpModule } from '@nestjs/axios';
import { Scraping } from './scraping.entity';
import { VkBotModule } from 'src/vk-bot/vk-bot.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Scraping]),
    HttpModule,
    UserModule,
    forwardRef(() => VkBotModule),
  ],
  providers: [ScrapingService],
  exports: [ScrapingService],
})
export class ScrapingModule {}
