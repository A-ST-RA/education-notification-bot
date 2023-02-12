import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VkModule } from 'nestjs-vk';
import { join } from 'path';
import { AppController } from './app.controller';
import { ScrapingModule } from './scraping/scraping.module';
import { VkBotModule } from './vk-bot/vk-bot.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    VkModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        token: configService.get<string>('VK_BOT_TOKEN'),
        options: {
          pollingGroupId: configService.get<number>('POLING_GROUP_ID'),
          apiMode: 'sequential',
        },
        useHearManager: true,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    forwardRef(() => VkBotModule),
    forwardRef(() => ScrapingModule),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
