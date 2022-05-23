import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entities';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { User } from '../users/entities/user.entities';
import { createChannelDto } from './dto/create.channel';
import { createMessageDto } from './dto/create.message';
import { Message } from './entities/message.entities';
import { UpdateChannelDto } from './dto/update.channel';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UsersService,
  ) {}

  // FIND //////////////////////////////////////////////:
  findAll() {
    return this.channelRepository.find({
      relations: ['messages', 'members', 'owner'],
    });
  }

  amIMember(memberList: User[], userId: number): boolean {
    let res: boolean = false;
    memberList.map((e) => (e.id === userId ? (res = true) : null));
    return res;
  }

  // will return all channels except private channels where the user is not a member
  async findUserChannels(userId: number) {
    let privList = await this.channelRepository.find({
      relations: ['owner', 'members', 'admins', 'messages'],
      where: { access: 'private' },
    });
    privList = privList.filter((e) => this.amIMember(e.members, userId));
    let totalList = await this.channelRepository.find({
      relations: ['owner', 'members', 'admins', 'messages'],
      where: [{ access: 'public' }, { access: 'protected' }],
    });
    return totalList.concat(privList);
  }

  async findOne(id: number): Promise<Channel> {
    const channel = await this.channelRepository.findOne(id, {
      relations: ['messages', 'members', 'owner'],
    });
    if (!channel) {
      throw new NotFoundException(`Channel ${id} not found`);
    }
    return channel;
  }

  async findByName(name: string): Promise<Channel[]> {
    const channel = await this.channelRepository.find({
      where: { name: name },
    });
    if (!channel) return null;
    return channel;
  }

////////////////////////////////////////////////////////////

// CREATE, UPDATE AND DELETE /////////////////////////////
  async createChannel(createChat: createChannelDto) {
    const user: User = await this.userService.findOne(createChat.userId);
    const channel = new Channel();
    channel.name = createChat.name;
    channel.access = createChat.access;
    if (createChat.access === 'protected')
      channel.password = createChat.password;
    channel.owner = user;
    channel.members = [user];
    return this.channelRepository.save(channel);
    // return channel.toResponseObjet();
  }

  async update(id: number, updateChannelDto: UpdateChannelDto) {
    // console.log('UPDATING CHANNEL: ', updateChannelDto);
    // const channel = await this.channelRepository.preload({
    //   id: id,
    //   ...updateChannelDto,
    // });
    const channel = await this.channelRepository.findOne(id);
    if (!channel) {
      throw new NotFoundException(`[Update:] Channel #${id} not found`);
    }
    channel.access = updateChannelDto.access;
    channel.password = updateChannelDto.password;
    return this.channelRepository.save(channel);
  }

  async changeAccess(param: { access: string, password: string, channelId: number }) {
    const channel = await this.channelRepository.findOne(param.channelId)
    if (!channel) {
      throw new NotFoundException(`[Update:] Channel #${param.channelId} not found`);
    }
    channel.access = param.access;
    channel.password = param.password;
    return this.channelRepository.save(channel)
  }

  async removeAll() {
    const channels = await this.findAll();
    for (let i = 0; i < channels.length; i++)
      this.channelRepository.remove(channels[i]);
  }

  async remove(id: number) {
    const channel = await this.findOne(id);
    return this.channelRepository.remove(channel);
  }

  // HANDLE MESSAGES /////////////////////////////////////////
  async messageList(channelId: number) {
    const data = await this.channelRepository.findOne(channelId, {
      relations: ['messages'],
    });
    if (data && data.messages) {
      return data.messages;
    }
  }

  async createMessage(createMessage: createMessageDto) {
    const channel: Channel = await this.channelRepository.findOne(
      createMessage.channelId,
    );
    const message = new Message();
    message.channel = channel;
    message.content = createMessage.content;
    message.senderName = createMessage.senderName;
    return this.messageRepository.save(message);
  }

  async findMessageChannel(messageId: number) {
    const message = await this.messageRepository.findOne(messageId, {
      relations: ['channels'],
    });
    if (!message) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }
    return message.channel;
  }

  // HANDLE PASSWORD /////////////////////////////////////
  async verifyPassword(password: string, channelId: number): Promise<boolean> {
    const channel = await this.findOne(channelId);
    return channel.comparePassword(password);
  }

  // HANDLE ADMIN ////////////////////////////////////////
  async addAdmin(id: number, adminId: number) {
    const admin = await this.userRepository.findOne(adminId);
    const channel = await this.channelRepository.findOne(id, {
      relations: ['admins'],
    });
    // if (!channel.admins.includes(admin)) {
    channel.admins.push(admin);
    this.channelRepository.save(channel);
    // }
  }

  async findAdmins(id: number): Promise<User[]> {
    const channel = await this.channelRepository.findOne(id, {
      relations: ['admins'],
    });
    if (!channel) {
      throw new NotFoundException(`[FindOne:] Channel ${id} not found`);
    }
    return channel.admins;
  }

  async removeAdmin(id: number, adminId: number) {
    const channel = await this.channelRepository.findOne(id, {
      relations: ['admins'],
    });
    const toDelete = channel.admins.findIndex((c) => c.id === adminId);
    channel.admins.splice(toDelete, 1);
    this.channelRepository.save(channel);
  }

  // HANDLE MEMBERS ///////////////////////////////
  async addMember(id: number, memberId: number) {
    const member = await this.userRepository.findOne(memberId);
    const channel = await this.channelRepository.findOne(id, {
      relations: ['members'],
    });
    if (!channel.members.includes(member)) {
      channel.members.push(member);
      this.channelRepository.save(channel);
    }
  }

  async findMembers(id: number): Promise<User[]> {
    const channel = await this.channelRepository.findOne(id, {
      relations: ['members'],
    });
    if (!channel) {
      throw new NotFoundException(`[FindOne:] Channel ${id} not found`);
    }
    return channel.members;
  }

  async removeMember(id: number, memberId: number) {
    const channel = await this.channelRepository.findOne(id, {
      relations: ['members'],
    });
    const toDelete = channel.members.findIndex((c) => c.id === memberId);
    channel.members.splice(toDelete, 1);
    this.channelRepository.save(channel);
  }

  // HANDLE BANNED ///////////////////////////////
  async addBanned(id: number, bannedId: number) {
    const banned = await this.userRepository.findOne(bannedId);
    const channel = await this.channelRepository.findOne(id, {
      relations: ['banned'],
    });
    if (!channel.banned.includes(banned)) {
      channel.banned.push(banned);
      this.channelRepository.save(channel);
    }
  }

  async findBanned(id: number): Promise<User[]> {
    const channel = await this.channelRepository.findOne(id, {
      relations: ['banned'],
    });
    if (!channel) {
      throw new NotFoundException(`[FindOne:] Channel ${id} not found`);
    }
    return channel.banned;
  }

  async removeBanned(id: number, bannedId: number) {
    const channel = await this.channelRepository.findOne(id, {
      relations: ['banned'],
    });
    const toDelete = channel.banned.findIndex((c) => c.id === bannedId);
    channel.banned.splice(toDelete, 1);
    this.channelRepository.save(channel);
  }

  // HANDLE MUTE ///////////////////////////////
  async addMuted(id: number, mutedId: number, muteTime: number) {
    const muted = await this.userRepository.findOne(mutedId);
    const channel = await this.channelRepository.findOne(id, {
      relations: ['muted'],
    });
    if (!channel.muted.includes(muted)) {
      channel.muted.push(muted);
      this.channelRepository.save(channel);
    }
    // unmute after given time
    setTimeout(() => {
      this.removeMuted(id, mutedId);
    }, muteTime)
  }

  async findMuted(id: number): Promise<User[]> {
    const channel = await this.channelRepository.findOne(id, {
      relations: ['muted'],
    });
    if (!channel) {
      throw new NotFoundException(`[FindOne:] Channel ${id} not found`);
    }
    return channel.muted;
  }

  async removeMuted(id: number, mutedId: number) {
    const channel = await this.channelRepository.findOne(id, {
      relations: ['muted'],
    });
    const toDelete = channel.muted.findIndex((c) => c.id === mutedId);
    channel.muted.splice(toDelete, 1);
    this.channelRepository.save(channel);
  }
}
