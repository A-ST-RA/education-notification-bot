import { forwardRef, Inject } from '@nestjs/common';
import { Ctx, Hears, InjectVkApi, On, Update } from 'nestjs-vk';
import { ScrapingService } from 'src/scraping/scraping.service';
import { UserService } from 'src/user/user.service';
import {
  getRandomId,
  Keyboard,
  KeyboardBuilder,
  MessageContext,
  VK,
} from 'vk-io';

@Update()
export class VkBotService {
  public groupId: number;
  constructor(
    @InjectVkApi()
    private readonly vk: VK,
    private readonly userService: UserService,
    @Inject(forwardRef(() => ScrapingService))
    private readonly scrapingService: ScrapingService,
  ) {}

  async onModuleInit() {
    try {
      const [group] = await this.vk.api.groups.getById({});
      this.groupId = group.id;
    } catch (err) {
      console.error(err);
    }
  }

  async sendNewRaspToAllSubscribedUsers(userId: number, newRasp: string) {
    await this.vk.api.messages.send({
      user_id: userId,
      random_id: getRandomId(),
      message: 'Новое расписание для твоей группы\n\n' + newRasp,
    });
  }

  @On('message_new')
  async addGroup(@Ctx() ctx: MessageContext) {
    const rawText = ctx.text;
    const splited = rawText.split(' ');
    const [command, group] = splited;

    if (rawText === 'таких команд я не знаю') return;

    if (splited[0] === 'Начать') {
      await this.userService.registerNewUser(ctx.senderId);
      await ctx.reply(
        'Здравствуйте, это бот расписание.\n' +
          'Я вышлю вам клавиатуру, после того, как вы укажите свою группу\n' +
          'Установить группу можно командой >>> /группа название <<<, где название это имя вашей группы\n' +
          'Пиши /помощь для просмотра списка команд',
      );
      return;
    }
    if (rawText === 'Расписание моей группы') {
      await ctx.reply(
        (
          await this.scrapingService.getScrapedDataByGroup(
            ctx.messagePayload.group,
          )
        )?.rasp || 'такую группу я не нашел',
      );

      return;
    }

    if (splited[0] === '/помощь') {
      await ctx.reply(
        `
          /звонки <- список звонков,
          /помощь <- помощь с командами,
          /группа + название <- изменить группу,
          /преподаватель + фамилия инициалы <- поиск по преподавателю
        `,
      );

      return;
    }

    if (splited[0] === '/преподаватель' && !!splited[1]) {
      await ctx.reply(
        (await this.scrapingService.getScrapedDataByGroup(group))?.rasp ||
          'такого преподавателя я не нашел',
      );

      return;
    }

    if (splited[0] === '/звонки') {
      await ctx.reply(
        'https://uaviak.ru:8081/upload/medialibrary/fca/fcaee2bc8d4e865e1da059e65eb07a24.png',
      );

      return;
    }

    if (splited.length !== 2 || splited[0] !== '/группа') {
      await ctx.reply('таких команд я не знаю');
      return;
    }

    await this.userService.changeGroup(ctx.senderId, group);

    await ctx.reply('Клавиатура получена для группы ' + group, {
      keyboard: new KeyboardBuilder().textButton({
        label: 'Расписание моей группы',
        payload: {
          group: group,
        },
        color: Keyboard.SECONDARY_COLOR,
      }),
    });
  }
}
