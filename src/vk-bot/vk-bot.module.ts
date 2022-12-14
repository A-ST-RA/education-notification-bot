import { forwardRef, Module } from '@nestjs/common';
import { ScrapingModule } from 'src/scraping/scraping.module';
import { UserModule } from 'src/user/user.module';
import { VkBotService } from './vk-bot.service';

@Module({
  imports: [forwardRef(() => UserModule), forwardRef(() => ScrapingModule)],
  providers: [VkBotService],
  exports: [VkBotService],
})
export class VkBotModule {}
