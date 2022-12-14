import { User } from './user.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAllByGroup(group: string) {
    return await this.userRepository.find({
      where: { group: group },
    });
  }

  async registerNewUser(vkId: number) {
    const existed = await this.userRepository.findOne({
      where: { vkId: vkId },
    });

    if (!!existed) return;

    const temp = new User();
    temp.vkId = vkId;

    await this.userRepository.save(temp);
  }

  async changeGroup(vkId: number, group: string) {
    const existed = await this.userRepository.findOne({
      where: { vkId: vkId },
    });

    existed.group = group;

    await this.userRepository.save(existed);
  }
}
