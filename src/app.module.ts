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
        'vk1.a.wsdrhEQHIQgZ2nCcYoEM6lbM209lnc1CaT1xFuZxozneFfW4Tx59KT3QXycOFQTlbjyxCimtbZ-OuIWlrB96tJ3lfw_qipsz-wM5IdLkOdCAnX-8AN7QrWVLLEYCDAeE6tcYNkPxmaXLkpML_Yv4S-Xwdbcm0JbQCCU3I_J196mZjXKWwmky1T_gp002Kjlo8GsvSzM8PkODbv_qa97eKw',
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
