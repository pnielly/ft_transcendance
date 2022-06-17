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
import { createMuteStateDto } from './dto/create.muteState';

import * as bcrypt from 'bcrypt';
import { WsException } from '@nestjs/websockets';

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

  amIMember(memberList: User[], userId: string): boolean {
    let res: boolean = false;
    memberList.map((e: User) => (e.id == userId ? (res = true) : null));
    return res;
  }

  async areFriends(aId: string, bId: string) {
    const friendList = await this.userService.findFriends(aId);
    let ret: boolean = false;
    friendList.map((u:User) => u.id === bId ? ret = true : null)
    return ret
  }

  // will return all channels except private channels where the user is not a member
  async findUserChannels(userId: string) {
    // get private channels
    let privList = await this.channelRepository.find({
      relations: ['owner', 'members', 'admins', 'messages'],
      where: { access: 'private' },
    });
    privList = privList.filter((e: Channel) => this.amIMember(e.members, userId));
    // filter out DM channels where the users are not friends
    for (const c of privList) {
      if (!(c.members[0] && c.members[1])) break ;
      const ret = await this.areFriends(c.members[0].id, c.members[1].id);
      if (c.name.substring(0,3) === 'dm-' && !ret) {
        privList = privList.filter((e: Channel) => e.id !== c.id);
      }
    }
    // get the other channels
    let totalList = await this.channelRepository.find({
      relations: ['owner', 'members', 'admins', 'messages'],
      where: [{ access: 'public' }, { access: 'protected' }],
    });
    return totalList.concat(privList);
  }

  async findDMByMembers(fromId: string, blockId: string) {
    let chanList = await this.channelRepository.find({
      relations: ['members'], where: [{ access: 'private' }]})
      // filter to get the DM chan
    const chan: Channel = chanList.filter((e: Channel) => (this.amIMember(e.members, fromId) && this.amIMember(e.members, blockId) && e.name.substring(0, 3) === 'dm-'))[0];
    if (!chan) {
      throw new NotFoundException(`DM Channel with ${fromId} and ${blockId} not found`);
    }
    return chan;
  }

  async findOne(id: string): Promise<Channel> {
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
    return await this.channelRepository.save(channel);
    // return channel.toResponseObjet();
  }

  async update(id: string, updateChannelDto: UpdateChannelDto) {
    // console.log('UPDATING CHANNEL: ', updateChannelDto);
    // const channel = await this.channelRepository.preload({
    //   id: id,
    //   ...updateChannelDto,
    // });
    // const channel = await this.channelRepository.findOne(id);
    // if (!channel) {
    //   throw new NotFoundException(`[Update:] Channel #${id} not found`);
    // }
    // channel.access = updateChannelDto.access;
    // channel.password = updateChannelDto.password;
    // return this.channelRepository.save(channel);
  }

  async changeAccess(param: {
    access: string;
    password: string;
    channelId: string;
  }) {
    const channel = await this.channelRepository.findOne(param.channelId);
    if (!channel) {
      throw new NotFoundException(
        `[Update:] Channel #${param.channelId} not found`,
      );
    }
    channel.access = param.access;
    channel.password = await bcrypt.hash(param.password, 10);
    return await this.channelRepository.save(channel);
  }

  async changeOwner(channelId: string, heirId: string) {
    const channel = await this.channelRepository.findOne(channelId);
    if (!channel) {
      throw new NotFoundException(
        `[Update:] Channel #${channelId} not found`,
      );
    }
    const user = await this.userRepository.findOne(heirId);
    if (!user) {
      throw new NotFoundException(
        `[Update:] User #${heirId} not found`,
      );
    }
    channel.owner = user;
    return await this.channelRepository.save(channel);
  }

  async removeAll() {
    const channels = await this.findAll();
    for (let i = 0; i < channels.length; i++)
      await this.channelRepository.remove(channels[i]);
  }

  async remove(id: string) {
    const channel = await this.findOne(id);
    return await this.channelRepository.remove(channel);
  }

  // HANDLE MESSAGES /////////////////////////////////////////
  async messageList(channelId: string) {
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
    return await this.messageRepository.save(message);
  }

  async findMessageChannel(messageId: string) {
    const message = await this.messageRepository.findOne(messageId, {
      relations: ['channels'],
    });
    if (!message) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }
    return message.channel;
  }

  // HANDLE PASSWORD /////////////////////////////////////
  async verifyPassword(password: string, channelId: string): Promise<boolean> {
    const channel = await this.findOne(channelId);
    return channel.comparePassword(password);
  }

  // HANDLE ADMIN ////////////////////////////////////////
  async addAdmin(id: string, adminId: string) {
    const admin = await this.userRepository.findOne(adminId);
    const channel = await this.channelRepository.findOne(id, {
      relations: ['admins'],
    });
    if (!channel.admins.includes(admin)) {
    channel.admins.push(admin);
    await this.channelRepository.save(channel);
   }
  }

  async findAdmins(id: string): Promise<User[]> {
    const channel = await this.channelRepository.findOne(id, {
      relations: ['admins'],
    });
    if (!channel) {
      throw new NotFoundException(`[FindOne:] Channel ${id} not found`);
    }
    return channel.admins;
  }

  async removeAdmin(id: string, adminId: string) {
    const channel = await this.channelRepository.findOne(id, {
      relations: ['admins'],
    });
   
    if (!channel) return;
    const toDelete = channel.admins.findIndex((c) => c.id === adminId);
   
    if (toDelete !== -1) channel.admins.splice(toDelete, 1);
    return await this.channelRepository.save(channel);
  }

  // HANDLE MEMBERS ///////////////////////////////
  async addMember(id: string, memberId: string) {
    const member = await this.userRepository.findOne(memberId);
    const channel = await this.channelRepository.findOne(id, {
      relations: ['members'],
    });
    if (!channel.members.includes(member)) {
      channel.members.push(member);
      await this.channelRepository.save(channel);
    }
  }

  async findMembers(id: string): Promise<User[]> {
    const channel = await this.channelRepository.findOne(id, {
      relations: ['members'],
    });
    if (!channel) {
      throw new NotFoundException(`[FindOne:] Channel ${id} not found`);
    }
    return channel.members;
  }

  async removeMember(id: string, memberId: string) {
    const channel = await this.channelRepository.findOne(id, {
      relations: ['members'],
    });
    if (!channel) return;
    const toDelete = channel.members.findIndex((c) => c.id === memberId);
    channel.members.splice(toDelete, 1);
    return await this.channelRepository.save(channel);
  }

  // HANDLE BANNED ///////////////////////////////
  async addBanned(id: string, bannedId: string) {
    const banned = await this.userRepository.findOne(bannedId);
    const channel = await this.channelRepository.findOne(id, {
      relations: ['banned'],
    });
    if (!banned || !channel) throw new NotFoundException('NOT FOUND');
    if (!channel.banned.includes(banned)) {
      channel.banned.push(banned);
     
      return await this.channelRepository.save(channel);

    }
    return banned;
  }

  async findBanned(id: string): Promise<User[]> {
    const channel = await this.channelRepository.findOne(id, {
      relations: ['banned'],
    });
    if (!channel) {
      throw new NotFoundException(`[FindOne:] Channel ${id} not found`);
    }
    return channel.banned;
  }

  async removeBanned(id: string, bannedId: string) {
    const channel = await this.channelRepository.findOne(id, {
      relations: ['banned'],
    });
    if (!channel) return;
    const toDelete = channel.banned.findIndex((c: User) => c.id === bannedId);
    if (toDelete !== -1) channel.banned.splice(toDelete, 1);
    return await this.channelRepository.save(channel);
  }

  // HANDLE MUTE ///////////////////////////////
  async addMuted(id: string, mutedId: string, muteTime: number) {
    const muted = await this.userRepository.findOne(mutedId);
    const channel = await this.channelRepository.findOne(id, {
      relations: ['muted'],
    });
    if (!channel.muted.includes(muted)) {
      channel.muted.push(muted);
      await this.channelRepository.save(channel);
    }

    // will unmute automatically user after <muteTime> ms
    const timeOutId = setTimeout(async () => {
      await this.removeMuted(id, mutedId);
    }, muteTime)
    return timeOutId;
  }

  async findMuted(id: string): Promise<User[]> {
    const channel = await this.channelRepository.findOne(id, {
      relations: ['muted'],
    });
    if (!channel) {
      throw new NotFoundException(`[FindOne:] Channel ${id} not found`);
    }
    return channel.muted;
  }

  async removeMuted(id: string, mutedId: string) {
    const channel = await this.channelRepository.findOne(id, {
      relations: ['muted'],
    });
    if (!channel) return;
    const toDelete = channel.muted.findIndex((c) => c.id === mutedId);
    if (toDelete !== -1) channel.muted.splice(toDelete, 1);
    await this.channelRepository.save(channel);
  }

  // User Roles

  async isOwner(user: User, id: number): Promise<boolean> {
    const channel = await this.channelRepository.findOne(id, {
      relations: ['owner'],
    });
    if (!channel) {
      throw new WsException(`Channel ${id} not Found `);
    }
    if (channel.owner.id === user.id) return true;
    return false;
  }

  async isAdmin(user: User, id: number): Promise<boolean> {
    const channel = await this.channelRepository.findOne(id, {
      relations: ['admins'],
    });
    if (!channel) {
      throw new WsException(`Channel ${id} not Found `);
    }
    const check = channel.admins.find((admin: User) => admin.id === user.id);
    if (check) return true;
    return false;
  }

  async isMember(user: User, id: number): Promise<boolean> {
    const channel = await this.channelRepository.findOne(id, {
      relations: ['members'],
    });
    if (!channel) {
      throw new WsException(`Channel ${id} not Found `);
    }
    const check = channel.members.find((member) => member.id === user.id);
    if (check) return true;
    return false;
  }
}
