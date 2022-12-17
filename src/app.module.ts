import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VkModule } from 'nestjs-vk';
import { join } from 'path';
import { AppController } from './app.controller';
import { ScrapingModule } from './scraping/scraping.module';
import { VkBotModule } from './vk-bot/vk-bot.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'mysql',
      port: 3306,
      username: 'root',
      password: 'toor',
      database: 'db',
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: true,
    }),
    VkModule.forRoot({
      token:
        'vk1.a.K8YRoYbQk88oBosCwpa_TrmyBfBmZhmLk_wAlGbROx7ia_mJ1iAKU492MNE0TiI_H2-6ML8neSJfLONOsrbpCXCZAUEHO4YCl1B2reW8i9nhSjFqV9WQfazFEVwtERq32uJyP1arASh1tTcwyqPxxNrDuQJ0mm0EIXazfol5mBnIIGt1ELYixRidzIV5FC-V0R-HAJPBf4WEGzhfJ2ak8w',
      options: {
        pollingGroupId: 189138323,
        apiMode: 'sequential',
      },
      useHearManager: true,
    }),
    UserModule,
    forwardRef(() => VkBotModule),
    forwardRef(() => ScrapingModule),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
