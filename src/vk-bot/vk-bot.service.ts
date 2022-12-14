import { forwardRef, Inject } from '@nestjs/common';
import { Ctx, Hears, InjectVkApi, Update } from 'nestjs-vk';
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
      user_id: 378352636,
      random_id: getRandomId(),
      message: newRasp,
    });
  }

  @Hears('/ping')
  async ping(@Ctx() ctx: MessageContext) {
    await ctx.reply('pong');
  }

  @Hears('Расписание моей группы')
  async rasp(@Ctx() ctx: MessageContext) {
    console.log(ctx);
    await ctx.reply(
      (
        await this.scrapingService.getScrapedDataByGroup(
          ctx.messagePayload.group,
        )
      ).rasp,
    );
  }

  @Hears('Начать')
  async onStartCommand(@Ctx() ctx: MessageContext) {
    try {
      await this.userService.registerNewUser(ctx.senderId);
    } catch (e) {
      console.log(e);
    }

    await ctx.reply(
      'Здравствуйте, это бот расписание.\n' +
        'Я вышлю вам клавиатуру, после того, как вы укажите свою группу\n' +
        'Установить группу можно командой >>> /группа название <<<, где название это имя вашей группы',
      // {
      //   keyboard: new KeyboardBuilder().textButton({
      //     label: 'Расписание моей группы',
      //     payload: {
      //       group: '19адс1',
      //     },
      //     color: Keyboard.POSITIVE_COLOR,
      //   }),
      // },
    );
  }
}
