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
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'toor',
      database: 'db',
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: true,
    }),
    VkModule.forRoot({
      token:
        'vk1.a.AsFiOZxMvjtTUTMdMS2IeWsZjbNqq_Xz23H0o5qW3pMIAIge9zm39SgwIMM4i09hHv80ZGkOY1MPl_aczTat0R3xCzdaMJreuchK3sn6IvgKSUNlkqdG48Rl6DM1wwvrnOss11DF81kj0fR5_klALru-M63NbQr2hdQhlNmfmC6VaKnVPauHBM7co0zPtRU7rOe3-L8VEnTmGXFKURr47Q',
      options: {
        pollingGroupId: 217766260,
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
